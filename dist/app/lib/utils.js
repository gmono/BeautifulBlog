"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapCached = exports.cached = exports.pathMap = exports.getUrlFromPath = exports.innerCopy = exports.changeExt = exports.runWithError = exports.runInDir = exports.changeJson = exports.writeToGlobalConfig = exports.readGlobalConfig = exports.readConfig = exports.hasUndefined = exports.objHasValue = void 0;
const fse = require("fs-extra");
const path = require("path");
const walk = require("walk");
function objHasValue(obj, names, val) {
    for (let k of names) {
        if (obj[k] === val)
            return true;
    }
    return false;
}
exports.objHasValue = objHasValue;
function hasUndefined(...args) {
    return objHasValue(args[0], args[1], undefined);
}
exports.hasUndefined = hasUndefined;
function readConfig(name) {
    return fse.readJson(`./config/${name}.json`);
}
exports.readConfig = readConfig;
function readGlobalConfig() {
    return fse.readJSON("./global.json");
}
exports.readGlobalConfig = readGlobalConfig;
function writeToGlobalConfig(obj) {
    return fse.writeJSON("./global.json", obj, { spaces: 4 });
}
exports.writeToGlobalConfig = writeToGlobalConfig;
async function changeJson(jsonpath, cbk) {
    let obj = await fse.readJson(jsonpath);
    let res = await cbk(obj);
    await fse.writeJson(jsonpath, res);
}
exports.changeJson = changeJson;
async function runInDir(dirpath, ...args) {
    const s = process.cwd();
    process.chdir(dirpath);
    await runWithError(...args);
    process.chdir(s);
}
exports.runInDir = runInDir;
async function runWithError(func, errorcbk, args) {
    try {
        if (args == null) {
            let fun = func;
            await fun();
        }
        else
            func(...args);
    }
    catch (e) {
        if (errorcbk)
            errorcbk(e);
    }
}
exports.runWithError = runWithError;
function changeExt(fpath, ext = "") {
    let obj = path.parse(fpath);
    obj.ext = ext;
    obj.base = obj.name + obj.ext;
    let npath = path.format(obj);
    npath = npath.replace(/\\/g, "/");
    return npath;
}
exports.changeExt = changeExt;
async function innerCopy(src, dest) {
    let info = await fse.lstat(src);
    let copyFile = async (s, d) => {
        let rd = fse.createReadStream(s);
        let wd = fse.createWriteStream(d);
        return new Promise((r) => {
            wd.addListener("finish", () => {
                r();
            });
            rd.pipe(wd);
        });
    };
    if (info.isFile()) {
        await copyFile(src, dest);
    }
    else {
        await fse.ensureDir(dest);
        let mon = walk.walk(src);
        mon.on("directory", (base, name, next) => {
            next();
        });
        mon.on("file", async (dirpath, filename, next) => {
            let endDirpath = dirpath.slice(src.length).slice(1);
            let allpath = path.resolve(dirpath, filename.name);
            let destdir = path.resolve(dest, endDirpath);
            let destpath = path.resolve(destdir, filename.name);
            console.log(dest, endDirpath, destdir);
            await fse.ensureDir(destdir);
            await copyFile(allpath, destpath);
            next();
        });
        return new Promise((resolve) => {
            mon.on("end", () => resolve());
        });
    }
}
exports.innerCopy = innerCopy;
function getUrlFromPath(fpath, baseurl = "/") {
    let url = path.relative(".", fpath).replace(/\\/g, "/").trim();
    url = path.posix.resolve(baseurl, url).trim();
    return url;
}
exports.getUrlFromPath = getUrlFromPath;
function pathMap(srcpath, base, newbase) {
    const rel = path.relative(base, srcpath);
    const npath = path.resolve(newbase, rel);
    return npath;
}
exports.pathMap = pathMap;
const equal = require("fast-deep-equal");
const ld = require("lodash");
function cached(func) {
    let hascalled = false;
    let oldresult = null;
    let oldargs = null;
    return (...args) => {
        if (!hascalled || oldargs !== args || !equal(args, oldargs)) {
            oldresult = func(...args);
            oldargs = ld.cloneDeep(args);
            return oldresult;
        }
    };
}
exports.cached = cached;
function mapCached(func) {
    let args_resultMap = new Map();
    return (...args) => {
        if (args_resultMap.has(args)) {
            return args_resultMap.get(args);
        }
        else {
            let res = func(...args);
            args_resultMap.set(args, res);
            return res;
        }
    };
}
exports.mapCached = mapCached;
//# sourceMappingURL=utils.js.map