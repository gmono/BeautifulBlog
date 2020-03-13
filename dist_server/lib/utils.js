"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fse = require("fs-extra");
const path = require("path");
const walk = require("walk");
function readConfig(name) {
    return fse.readJson(path.resolve(__dirname, `../../config/${name}.json`));
}
exports.readConfig = readConfig;
function readGlobalConfig() {
    //读取全局配置文件
    return fse.readJSON(path.resolve(__dirname, "../../global.json"));
}
exports.readGlobalConfig = readGlobalConfig;
async function runInDir(dirpath, func, errorcbk) {
    const s = process.cwd();
    process.chdir(dirpath);
    try {
        await func();
    }
    catch (e) {
        errorcbk(e);
    }
    process.chdir(s);
}
exports.runInDir = runInDir;
/**
 * 修改一个路径的扩展名并返回(原文件名无扩展名也可使用)
 * @param fpath 文件路径
 * @param ext 扩展名 .xxx
 */
function changeExt(fpath, ext = "") {
    let obj = path.parse(fpath);
    obj.ext = ext;
    obj.base = obj.name + obj.ext;
    let npath = path.format(obj);
    npath = npath.replace(/\\/g, "/");
    return npath;
}
exports.changeExt = changeExt;
//工具函数区域
/**
 * 复制，通过write(read(file)) 功能继承自fse.copy
 * @param src 源地址
 * @param dest 目的地址
 */
async function innerCopy(src, dest) {
    let info = await fse.lstat(src);
    let copyFile = async (s, d) => {
        let rd = fse.createReadStream(s);
        let wd = fse.createWriteStream(d);
        return new Promise((r) => {
            wd.addListener("finish", () => {
                // console.log(`复制文件 ${s} 到 ${d}`)
                r();
            });
            rd.pipe(wd);
        });
    };
    if (info.isFile()) {
        await copyFile(src, dest);
    }
    else {
        //目录
        await fse.ensureDir(dest);
        //开始复制目录 遍历src目录树
        let mon = walk.walk(src);
        mon.on("directory", (base, name, next) => {
            // console.log(path.resolve(base,name.name));
            next();
        });
        mon.on("file", async (dirpath, filename, next) => {
            //把文件复制到对应位置 把dirpath和filename合成完整src路径 从中生成dest路径 复制文件
            //不带src路径前缀的目录路径 从1开始截取是为了去掉path前面的/ 以免被认为是从root开始
            let endDirpath = dirpath.slice(src.length).slice(1);
            let allpath = path.resolve(dirpath, filename.name); //源地址
            // console.log(allpath);
            //在allpath中去除src的部分
            let destdir = path.resolve(dest, endDirpath); //目的目录地址
            let destpath = path.resolve(destdir, filename.name); //目的文件地址
            console.log(dest, endDirpath, destdir);
            await fse.ensureDir(destdir);
            //复制文件
            await copyFile(allpath, destpath);
            next();
        });
        return new Promise((resolve) => {
            mon.on("end", () => resolve());
        });
    }
}
exports.innerCopy = innerCopy;
/**
 * 从path获取服务器的url
 * @param fpath 文件path
 * @param baseurl 服务器的baseurl，在config中定义
 */
function getUrlFromPath(fpath, baseurl = "/") {
    let url = path.relative(".", fpath).replace(/\\/g, "/").trim();
    url = path.posix.resolve(baseurl, url).trim();
    return url;
}
exports.getUrlFromPath = getUrlFromPath;
/**
 * 对path进行同构映射
 * @param srcpath 源地址，比如文件地址
 * @param base 源地址的base目录，可以是任何一级
 * @param newbase 用于替换的新base
 */
function pathMap(srcpath, base, newbase) {
    const rel = path.relative(base, srcpath);
    const npath = path.resolve(newbase, rel);
    return npath;
}
exports.pathMap = pathMap;
///高阶函数区域
const equal = require("fast-deep-equal");
const ld = require("lodash");
/**
 * 包装函数，在参数与上次相同时返回上一次结果不调用函数
 * 注意为了提高性能，本函数并不对result进行deepClone缓存，返回值不可修改否则将破坏一致性
 * @param args 参数
 */
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
/**
 * 包装函数，让同一参数只调用一次函数
 * 注意由于技术所限本函数不会像cached一样进行deepClone和deepEqual比较
 * 注意为了提高性能，本函数并不对result进行deepClone缓存，返回值不可修改否则将破坏一致性
 * @param func 要包装的函数
 */
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