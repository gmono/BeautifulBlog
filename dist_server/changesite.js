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
async function changesite(sitename) {
    //事件相关
    const changesiteHook = hooks_1.changedSite();
    //执行此前的before
    await changesiteHook.next();
    let spath = path.resolve("./sites", sitename);
    let dpath = "./nowSite";
    // console.log(spath,dpath)
    await del(dpath);
    await fs_extra_1.mkdir(dpath);
    return new Promise((r, j) => {
        copy(spath, dpath, {
            utimes: true,
            mode: true,
            cover: true
        }, (err) => {
            err && (console.log("切换失败:", err), j(err));
            err || (async () => {
                console.log("切换完成");
                //调用loaded钩子
                await changesiteHook.next();
                r();
            })();
        });
    });
}
const fs = require("fs-extra");
const hooks_1 = require("./hooks");
//按照配置的来复制
if (require.main == module) {
    let config = fs.readJsonSync("./config/default.json");
    changesite(config.site);
}
exports.default = changesite;
//# sourceMappingURL=changesite.js.map