"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 复制并替换nowSite
 * 假设nowSite中没有任何改动（与sites中的同目录一致）
 *
 */
//删除nowSite目录复制spath指向的目录并命名为nowSite
//删除复制目录树
const _copy = require("copy-dir");
const copy = _copy;
const del = require("del");
const fs_extra_1 = require("fs-extra");
const path = require("path");
async function copysite(sitename) {
    let spath = path.resolve("../sites", sitename);
    let dpath = "../nowSite";
    await del(dpath);
    await fs_extra_1.mkdir(dpath);
    return new Promise((r, j) => {
        copy(spath, dpath, {
            utimes: true,
            mode: true,
            cover: true
        }, (err) => {
            err && (console.log("切换失败:", err), j(err));
            err || (console.log("切换完成"), r());
        });
    });
}
//按照配置的来复制
if (require.main == module) {
    let config = require("../config.json");
    copysite(config.base_url);
}
exports.default = copysite;
