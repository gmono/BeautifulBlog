"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changed = exports.afterRefresh = exports.changedSite = void 0;
const utils_1 = require("./lib/utils");
const fse = require("fs-extra");
const path = require("path");
const getContext = utils_1.cached(async (configname) => {
    let ret = {
        node_version: process.version,
        version: "0.6-alpha",
        config: configname == null ? null : await utils_1.readConfig(configname),
        globalConfig: await utils_1.readGlobalConfig()
    };
    return ret;
});
const getNowSiteHooks = () => {
    try {
        let obj = require(path.resolve("./nowSite/hooks.js"));
        return obj;
    }
    catch (e) {
        return null;
    }
};
function getErrorCBK(name) {
    return (e) => console.log(`${name}hooks中发生异常 ${e.message ? e.message : ""}`);
}
async function* changedSite() {
    await fse.ensureDir("./nowSite");
    const ctx = await getContext();
    await utils_1.runWithError(() => {
        const obj = getNowSiteHooks();
        obj?.beforeUnload(ctx);
    }, getErrorCBK("切换网站"));
    yield;
    await utils_1.runWithError(() => {
        const newobj = getNowSiteHooks();
        newobj?.loaded(ctx);
    }, getErrorCBK("切换网站"));
}
exports.changedSite = changedSite;
async function afterRefresh() {
    await fse.ensureDir("./nowSite");
    const ctx = await getContext();
    const obj = getNowSiteHooks();
    await utils_1.runWithError(() => {
        obj && obj.generated(ctx);
    }, getErrorCBK("文章刷新"));
}
exports.afterRefresh = afterRefresh;
async function changed(destpath) {
    await fse.ensureDir("./nowSite");
    const ctx = await getContext();
    const obj = getNowSiteHooks();
    const f = utils_1.changeExt(destpath, ".json");
    let tp = null;
    if (!(await fse.pathExists(f)))
        tp = "remove";
    else {
        const info = await fse.stat(f);
        if (info.ctimeMs == info.mtimeMs)
            tp = "add";
        else
            tp = "change";
    }
    await utils_1.runWithError(() => {
        obj && obj.articleChanged(ctx, tp, utils_1.changeExt(destpath, ""));
    }, getErrorCBK("文章更改"));
}
exports.changed = changed;
if (require.main == module) {
    (async () => {
        let obj = changedSite();
        await obj.next();
        console.log("执行完毕");
        await obj.next();
    })();
}
//# sourceMappingURL=hooks.js.map