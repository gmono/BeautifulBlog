"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const walk = tslib_1.__importStar(require("walk"));
const path = tslib_1.__importStar(require("path"));
function getRel(p) {
    let ar = p.replace(/\\/g, "/").split("/").filter((v) => v != ".").slice(1);
    let np = ar.join("/");
    return np;
}
function getContentPath(p, content) {
    let np = getRel(p);
    np = np != "" ? `${content}/${np}` : content;
    return np.replace(/\\/g, "/");
}
function getContentFile(root, filestat) {
    let apath = `${root}/${filestat.name}`;
    let cpath = getContentPath(apath, "./content");
    return cpath;
}
const utils_1 = require("./lib/utils");
function getArticleFile(root, filestat) {
    let apath = `${root}/${filestat.name}`;
    let cpath = getContentPath(apath, "./articles");
    return cpath;
}
function getUrlFile(root, filestat, base_url) {
    let url = `${root}/${filestat.name}`;
    let baseu = base_url == "/" ? "" : base_url;
    let prefix = baseu + "/content";
    url = getContentPath(url, prefix);
    url = url.replace(/\\/g, "/");
    return url;
}
const fs = tslib_1.__importStar(require("fs-extra"));
const transform_1 = require("./transform");
const ld = tslib_1.__importStar(require("lodash"));
const hooks_1 = require("./hooks");
const hooks_2 = require("./hooks");
const utils_2 = require("./lib/utils");
const file_index_1 = require("./file-index");
function getContentMeta(articlemeta, from_dir, html, raw, articlefile) {
    from_dir = getRel(from_dir);
    let cmeta = JSON.parse(JSON.stringify(articlemeta));
    cmeta.from_dir = from_dir.split("/");
    cmeta.article_length = raw.length;
    cmeta.content_length = html.length;
    cmeta.modify_time = articlefile.mtime;
    return cmeta;
}
const process = tslib_1.__importStar(require("process"));
const filesjsonpath = "./content/files.json";
async function generate(configname = "default", verbose = false, refresh = false) {
    console.log(process.cwd());
    await fs.ensureDir("./content");
    if (refresh) {
        console.log("已启动全部重新生成");
    }
    const config = (await fs.readJSON(`./config/${configname}.json`));
    const globalConfig = await (0, utils_2.readGlobalConfig)();
    const siteSupport = await (0, hooks_2.getSiteArticleSupport)(config.site);
    const siteInterceptor = siteSupport?.intercept;
    const defaultFileExts = await (0, transform_1.getAllowFileExts)();
    const siteFileExts = (siteSupport?.metainfo.articleExtensions ?? []).map(ext => ext.startsWith(".") ? ext.toLowerCase() : `.${ext.toLowerCase()}`);
    const allowFileExts = new Set([...defaultFileExts, ...siteFileExts]);
    let walker = walk.walk("./articles");
    let files = { useConfig: configname, fileList: {} };
    if (await fs.pathExists("./content/files.json")) {
        const t = (await fs.readJSON("./content/files.json"));
        files = { ...t, useConfig: configname, fileList: { ...t.fileList } };
        console.log(t.useConfig == configname
            ? "配置文件一致，清洗并刷新记录数据中......"
            : "配置文件更改，保留已有发布结果并刷新记录数据中...");
    }
    const staleRecords = [];
    const existingArticlePaths = new Set();
    for (let k in files.fileList) {
        let apath = files.fileList[k].article_path;
        if (await fs.pathExists(apath)) {
            existingArticlePaths.add(apath);
            continue;
        }
        let cpath = getContentPath(apath, "./content");
        staleRecords.push({ articlePath: apath, contentPath: cpath });
    }
    if (staleRecords.length)
        console.log("检测到已删除文章，待本轮生成成功后清理其发布结果");
    const recordedFiles = ld.map(files.fileList, (value, key, col) => {
        return path.resolve(value.article_path);
    });
    const isRecorded = (articlepath) => recordedFiles.includes(path.resolve(articlepath));
    let fileProcessingError;
    walker.on("file", (base, name, next) => {
        void (async () => {
            try {
                const extension = path.parse(name.name).ext.trim().toLowerCase();
                if (!allowFileExts.has(extension)) {
                    return;
                }
                let articlepath = getArticleFile(base, name).replace(/\\/g, "/");
                existingArticlePaths.add(articlepath);
                let contentpath = getContentFile(base, name);
                contentpath = (0, utils_1.changeExt)(contentpath, "");
                let confpath = (0, utils_1.changeExt)(contentpath, ".json");
                let generate = async () => {
                    let res = siteInterceptor ? await siteInterceptor({
                        sourcePath: path.resolve(articlepath),
                        destinationPath: path.resolve(contentpath),
                        extension,
                        config,
                        globalConfig
                    }) : undefined;
                    let transformed = res ? await (0, transform_1.writeTransformResult)(articlepath, contentpath, res) : null;
                    if (!transformed) {
                        if (!defaultFileExts.includes(extension))
                            throw new Error(`主题声明了 ${extension}，但 interceptArticle 没有返回结果，且没有默认 transformer`);
                        transformed = await (0, transform_1.transformFile)(articlepath, contentpath);
                    }
                    const { content_meta: meta } = transformed;
                    if (verbose)
                        console.log(`文章:${meta.title}\n转换${articlepath}到${contentpath}`);
                    CurrFileRecordToFiles(meta.title);
                };
                let CurrFileRecordToFiles = (title) => {
                    let url = getUrlFile(base, name, config.base_url);
                    url = (0, utils_1.changeExt)(url, ".json");
                    const fdir = (0, transform_1.getFilesDir)(contentpath);
                    const furl = (0, utils_1.getUrlFromPath)(fdir, config.base_url);
                    files.fileList[url] = {
                        title: title,
                        article_path: articlepath.replace(/\\/g, "/"),
                        filesDir_url: furl
                    };
                };
                if (refresh)
                    await generate();
                else if (!isRecorded(articlepath))
                    await generate();
                else if (await fs.pathExists(confpath)) {
                    let amtime = name.mtime.getTime();
                    let meta = await fs.readJSON(getContentPath(confpath, "./content"));
                    let cmtime = new Date(meta.modify_time).getTime();
                    if (amtime != cmtime)
                        await generate();
                    else {
                        if (verbose)
                            console.log(`文章:${meta.title}:修改时间一致，跳过生成`);
                        CurrFileRecordToFiles(meta.title);
                    }
                }
                else
                    await generate();
            }
            catch (error) {
                fileProcessingError ??= error;
            }
        })().finally(() => next());
    });
    return new Promise((resolve, reject) => {
        walker.on("end", async () => {
            if (fileProcessingError) {
                reject(fileProcessingError);
                return;
            }
            for (const stale of staleRecords) {
                const htmlPath = (0, utils_1.changeExt)(stale.contentPath, ".html");
                const jsonPath = (0, utils_1.changeExt)(stale.contentPath, ".json");
                const filesDir = (0, transform_1.getFilesDir)(stale.contentPath);
                console.log("文章已删除：", htmlPath);
                await Promise.all([fs.remove(htmlPath), fs.remove(jsonPath), fs.remove(filesDir)]);
            }
            files = (0, file_index_1.pruneFileIndex)(files, existingArticlePaths);
            if (await fs.pathExists(filesjsonpath)) {
                await fs.remove(filesjsonpath);
            }
            await fs.writeFile(filesjsonpath, JSON.stringify(files, null, "\t"));
            console.log("生成完毕");
            if (refresh) {
                await (0, hooks_1.afterRefresh)();
            }
            resolve();
        }).on("error", reject).on("errors", (_root, errors) => {
            reject(new AggregateError(errors.map(error => error.error ?? error), "文章目录遍历失败"));
        });
    });
}
if (require.main == module) {
    generate("default", true);
}
exports.default = generate;
//# sourceMappingURL=generator.js.map