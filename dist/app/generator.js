"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const walk = require("walk");
const path = require("path");
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
const fs = require("fs-extra");
const transform_1 = require("./transform");
const ld = require("lodash");
const del = require("del");
const hooks_1 = require("./hooks");
function getContentMeta(articlemeta, from_dir, html, raw, articlefile) {
    from_dir = getRel(from_dir);
    let cmeta = JSON.parse(JSON.stringify(articlemeta));
    cmeta.from_dir = from_dir.split("/");
    cmeta.article_length = raw.length;
    cmeta.content_length = html.length;
    cmeta.modify_time = articlefile.mtime;
    return cmeta;
}
const process = require("process");
const filesjsonpath = "./content/files.json";
async function generate(configname = "default", verbose = false, refresh = false) {
    console.log(process.cwd());
    await fs.ensureDir("./content");
    if (refresh) {
        console.log("已启动全部重新生成");
    }
    const config = (await fs.readJSON(`./config/${configname}.json`));
    const allowFileExts = await transform_1.getAllowFileExts();
    let walker = walk.walk("./articles");
    let files = { useConfig: configname, fileList: {} };
    if (!refresh)
        if (await fs.pathExists("./content/files.json")) {
            let t = (await fs.readJSON("./content/files.json"));
            if (t.useConfig == configname) {
                console.log("配置文件一致，清洗并刷新记录数据中......");
                files = t;
            }
            else {
                console.log("配置文件更改，刷新记录数据中...");
            }
        }
    let dtasks = [];
    for (let k in files.fileList) {
        let apath = files.fileList[k].article_path;
        if (await fs.pathExists(apath))
            continue;
        let cpath = getContentPath(apath, "./content");
        let hpath = utils_1.changeExt(cpath, ".html");
        let jpath = utils_1.changeExt(cpath, ".json");
        console.log("文章已删除：", hpath);
        dtasks.push(del(hpath));
        dtasks.push(del(jpath));
    }
    await Promise.all(dtasks);
    const recordedFiles = ld.map(files.fileList, (value, key, col) => {
        return path.resolve(value.article_path);
    });
    const isRecorded = (articlepath) => recordedFiles.includes(path.resolve(articlepath));
    walker.on("file", async (base, name, next) => {
        if (allowFileExts.indexOf(path.parse(name.name).ext.trim()) == -1) {
            next();
            return;
        }
        let articlepath = getArticleFile(base, name);
        let contentpath = getContentFile(base, name);
        contentpath = utils_1.changeExt(contentpath, "");
        let confpath = utils_1.changeExt(contentpath, ".json");
        let generate = async () => {
            let { res, content_meta: meta } = await transform_1.transformFile(articlepath, contentpath);
            if (verbose)
                console.log(`文章:${meta.title}\n转换${articlepath}到${contentpath}`);
            CurrFileRecordToFiles(meta.title);
        };
        let CurrFileRecordToFiles = (title) => {
            let url = getUrlFile(base, name, config.base_url);
            url = utils_1.changeExt(url, ".json");
            const fdir = transform_1.getFilesDir(contentpath);
            const furl = utils_1.getUrlFromPath(fdir, config.base_url);
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
        next();
    });
    return new Promise((resolve, reject) => {
        walker.on("end", async () => {
            if (await fs.pathExists(filesjsonpath)) {
                await del(filesjsonpath);
            }
            await fs.writeFile(filesjsonpath, JSON.stringify(files, null, "\t"));
            console.log("生成完毕");
            if (refresh) {
                await hooks_1.afterRefresh();
            }
            resolve();
        });
    });
}
if (require.main == module) {
    generate("default", true);
}
exports.default = generate;
//# sourceMappingURL=generator.js.map