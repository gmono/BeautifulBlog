"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _copy = require("copy-dir");
const copy = _copy;
const del = require("del");
const fs_extra_1 = require("fs-extra");
const path = require("path");
async function changesite(sitename) {
    const changesiteHook = hooks_1.changedSite();
    await changesiteHook.next();
    let spath = path.resolve("./sites", sitename);
    let dpath = "./nowSite";
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
                await changesiteHook.next();
                r();
            })();
        });
    });
}
const fs = require("fs-extra");
const hooks_1 = require("./hooks");
if (require.main == module) {
    let config = fs.readJsonSync("./config/default.json");
    changesite(config.site);
}
exports.default = changesite;
//# sourceMappingURL=changesite.js.map