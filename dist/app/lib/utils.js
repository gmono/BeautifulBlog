"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.objHasValue = objHasValue;
exports.hasUndefined = hasUndefined;
exports.readConfig = readConfig;
exports.readGlobalConfig = readGlobalConfig;
exports.writeToGlobalConfig = writeToGlobalConfig;
exports.changeJson = changeJson;
exports.runInDir = runInDir;
exports.runWithError = runWithError;
exports.changeExt = changeExt;
exports.innerCopy = innerCopy;
exports.getUrlFromPath = getUrlFromPath;
exports.pathMap = pathMap;
exports.cached = cached;
exports.mapCached = mapCached;
const tslib_1 = require("tslib");
const fse = tslib_1.__importStar(require("fs-extra"));
const path = require("path");
const walk = tslib_1.__importStar(require("walk"));
function objHasValue(obj, names, val) {
    for (let k of names) {
        if (obj[k] === val)
            return true;
    }
    return false;
}
function hasUndefined(...args) {
    return objHasValue(args[0], args[1], undefined);
}
function readConfig(name) {
    return fse.readJson(`./config/${name}.json`);
}
function readGlobalConfig() {
    return fse.readJSON("./global.json");
}
function writeToGlobalConfig(obj) {
    return fse.writeJSON("./global.json", obj, { spaces: 4 });
}
async function changeJson(jsonpath, cbk) {
    let obj = await fse.readJson(jsonpath);
    let res = await cbk(obj);
    await fse.writeJson(jsonpath, res);
}
async function runInDir(dirpath, ...args) {
    const s = process.cwd();
    process.chdir(dirpath);
    await runWithError(...args);
    process.chdir(s);
}
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
function changeExt(fpath, ext = "") {
    let obj = path.parse(fpath);
    obj.ext = ext;
    obj.base = obj.name + obj.ext;
    let npath = path.format(obj);
    npath = npath.replace(/\\/g, "/");
    return npath;
}
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
function getUrlFromPath(fpath, baseurl = "/") {
    let url = path.relative(".", fpath).replace(/\\/g, "/").trim();
    url = path.posix.resolve(baseurl, url).trim();
    return url;
}
function pathMap(srcpath, base, newbase) {
    const rel = path.relative(base, srcpath);
    const npath = path.resolve(newbase, rel);
    return npath;
}
const fast_deep_equal_1 = tslib_1.__importDefault(require("fast-deep-equal"));
const ld = tslib_1.__importStar(require("lodash"));
function cached(func) {
    let hascalled = false;
    let oldresult = null;
    let oldargs = null;
    return (...args) => {
        if (!hascalled || oldargs !== args || !(0, fast_deep_equal_1.default)(args, oldargs)) {
            oldresult = func(...args);
            oldargs = ld.cloneDeep(args);
            return oldresult;
        }
    };
}
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
//# sourceMappingURL=utils.js.map