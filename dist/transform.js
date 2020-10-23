"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformFile = exports.getFilesDir = exports.getFileFromDest = exports.readMetaFromArticle = exports.getAllowFileExts = exports.ensureTransformTable = void 0;
const fs = require("fs");
const toml = require("toml");
let readAsync = async (fpath) => {
    return new Promise((r) => {
        fs.readFile(fpath, (e, d) => {
            r(d);
        });
    });
};
const fse = require("fs-extra");
const path = require("path");
const utils_1 = require("./lib/utils");
const ld = require("lodash");
const walk = require("walk");
async function getTransformers() {
    let basedir = "./transforms";
    if (await fse.pathExists(basedir) == false)
        basedir = path.resolve(__dirname, "./transforms");
    let mon = walk.walk(basedir);
    let ret = {};
    const loadTransformer = async (obj) => {
        if (ld.has(ret, obj.ext)) {
            console.warn("警告:存在文件类型重复的转换器脚本(已跳过加载),文件类型:", obj.ext);
            return;
        }
        ret[obj.ext] = obj.transformer;
        console.log(`转换器:${obj.desc.name}已加载,可处理 ${obj.ext} 文件`);
        await obj.init();
    };
    mon.on("file", async (base, name, next) => {
        if (path.extname(name.name) != ".js") {
            next();
            return;
        }
        const jspath = path.resolve(basedir, name.name);
        const obj = require(jspath);
        if (obj instanceof Array) {
            await Promise.all(obj.map(v => loadTransformer(v)));
        }
        else {
            await loadTransformer(obj);
        }
        next();
    });
    return new Promise((r, j) => {
        mon.on("end", () => r(ret));
    });
}
let transformTable = null;
async function ensureTransformTable() {
    if (transformTable == null)
        transformTable = await getTransformers();
}
exports.ensureTransformTable = ensureTransformTable;
async function getAllowFileExts() {
    await ensureTransformTable();
    return ld.keys(transformTable);
}
exports.getAllowFileExts = getAllowFileExts;
async function transform(filepath, destpath, configname = "default", ...args) {
    let config = await utils_1.readConfig(configname);
    let globalconfig = await utils_1.readGlobalConfig();
    const ext = path.parse(filepath).ext;
    await ensureTransformTable();
    const func = transformTable[ext];
    return func(filepath, destpath, config, globalconfig, ...args);
}
async function getContentMeta(res, articlePath) {
    if (!articlePath)
        return;
    let articlestat = await fse.stat(articlePath);
    let cmeta = JSON.parse(JSON.stringify(res.meta));
    cmeta.article_length = res.raw.length;
    cmeta.content_length = res.html.length;
    cmeta.modify_time = articlestat.mtime;
    cmeta.article_path = articlePath;
    return cmeta;
}
async function readMetaFromArticle(articlePathOrSrcPath) {
    const metapath = utils_1.changeExt(articlePathOrSrcPath, ".toml");
    if (!(await fse.pathExists(metapath)))
        return null;
    return toml.parse((await fse.readFile(metapath)).toString());
}
exports.readMetaFromArticle = readMetaFromArticle;
function getFileFromDest(destpath, filename) {
    return path.resolve(getFilesDir(destpath), filename);
}
exports.getFileFromDest = getFileFromDest;
function getFilesDir(destpath) {
    return utils_1.changeExt(destpath, "") + ".dir";
}
exports.getFilesDir = getFilesDir;
async function transformFile(srcfile, destfilename) {
    await fse.ensureDir(path.parse(destfilename).dir);
    let res = await transform(srcfile, destfilename);
    let htmlpath = utils_1.changeExt(destfilename, ".html");
    let jsonpath = utils_1.changeExt(destfilename, ".json");
    let contentMeta = await getContentMeta(res, srcfile);
    await Promise.all([
        fse.writeFile(htmlpath, res.html),
        fse.writeJson(jsonpath, contentMeta)
    ]);
    const dirpath = getFilesDir(destfilename);
    if (res.files != null) {
        await Promise.all(ld.map(res.files, async (value, key, obj) => {
            if (key.startsWith("/"))
                key = key.slice(1);
            let p = path.resolve(dirpath, key);
            let pdir = path.parse(p).dir;
            await fse.ensureDir(pdir);
            await fse.writeFile(p, value);
        }));
    }
    return {
        res, content_meta: contentMeta
    };
}
exports.transformFile = transformFile;
if (require.main == module)
    transformFile("./articles/about.md", "./test");
exports.default = transform;
//# sourceMappingURL=transform.js.map