"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSiteHooks = void 0;
exports.getSiteArticleSupport = getSiteArticleSupport;
exports.interceptSiteArticle = interceptSiteArticle;
exports.changedSite = changedSite;
exports.afterRefresh = afterRefresh;
exports.changed = changed;
const tslib_1 = require("tslib");
const utils_1 = require("./lib/utils");
const fse = tslib_1.__importStar(require("fs-extra"));
const path = tslib_1.__importStar(require("path"));
const getContext = (0, utils_1.cached)(async (configname) => {
    let ret = {
        node_version: process.version,
        version: "0.6-alpha",
        config: configname == null ? null : await (0, utils_1.readConfig)(configname),
        globalConfig: await (0, utils_1.readGlobalConfig)()
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
const getSiteHooks = (sitename) => {
    const hookpath = path.resolve(sitename ? `./sites/${sitename}/hooks.js` : './nowSite/hooks.js');
    try {
        delete require.cache[require.resolve(hookpath)];
        return require(hookpath);
    }
    catch {
        return null;
    }
};
exports.getSiteHooks = getSiteHooks;
async function getSiteArticleSupport(sitename) {
    const hooks = (0, exports.getSiteHooks)(sitename);
    if (!hooks?.metainfo?.articleExtensions?.length && !hooks?.interceptArticle)
        return null;
    return { metainfo: hooks.metainfo ?? {}, intercept: hooks.interceptArticle?.bind(hooks) };
}
async function interceptSiteArticle(sitename, context) {
    const hooks = (0, exports.getSiteHooks)(sitename);
    return hooks?.interceptArticle?.call(hooks, context);
}
function getErrorCBK(name) {
    return (e) => console.log(`${name}hooks中发生异常 ${e.message ? e.message : ""}`);
}
async function* changedSite() {
    await fse.ensureDir("./nowSite");
    const ctx = await getContext();
    await (0, utils_1.runWithError)(() => {
        const obj = getNowSiteHooks();
        obj?.beforeUnload(ctx);
    }, getErrorCBK("切换网站"));
    yield;
    await (0, utils_1.runWithError)(() => {
        const newobj = getNowSiteHooks();
        newobj?.loaded(ctx);
    }, getErrorCBK("切换网站"));
}
async function afterRefresh() {
    await fse.ensureDir("./nowSite");
    const ctx = await getContext();
    const obj = getNowSiteHooks();
    await (0, utils_1.runWithError)(() => {
        obj && obj.generated(ctx);
    }, getErrorCBK("文章刷新"));
}
async function changed(destpath, changeType) {
    await fse.ensureDir("./nowSite");
    const ctx = await getContext();
    const obj = getNowSiteHooks();
    const f = (0, utils_1.changeExt)(destpath, ".json");
    let tp = changeType;
    if (!tp && !(await fse.pathExists(f)))
        tp = "remove";
    else if (!tp) {
        const info = await fse.stat(f);
        if (info.ctimeMs == info.mtimeMs)
            tp = "add";
        else
            tp = "change";
    }
    await (0, utils_1.runWithError)(() => {
        obj && obj.articleChanged(ctx, tp, (0, utils_1.changeExt)(destpath, ""));
    }, getErrorCBK("文章更改"));
}
if (require.main == module) {
    (async () => {
        let obj = changedSite();
        await obj.next();
        console.log("执行完毕");
        await obj.next();
    })();
}
//# sourceMappingURL=hooks.js.map