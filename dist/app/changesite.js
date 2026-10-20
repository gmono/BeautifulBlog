"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const copy_dir_1 = tslib_1.__importDefault(require("copy-dir"));
const copy = copy_dir_1.default;
const fs_extra_1 = require("fs-extra");
const path = tslib_1.__importStar(require("path"));
async function changesite(sitename) {
    const changesiteHook = (0, hooks_1.changedSite)();
    await changesiteHook.next();
    let spath = path.resolve("./sites", sitename);
    let dpath = "./nowSite";
    await (0, fs_extra_1.remove)(dpath);
    await (0, fs_extra_1.mkdir)(dpath);
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
const fs = tslib_1.__importStar(require("fs-extra"));
const hooks_1 = require("./hooks");
if (require.main == module) {
    let config = fs.readJsonSync("./config/default.json");
    changesite(config.site);
}
exports.default = changesite;
//# sourceMappingURL=changesite.js.map