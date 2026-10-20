"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnSiteSynced = exports.OnArticleGenerated = void 0;
exports.default = watchArticles;
exports.watchSite = watchSite;
const tslib_1 = require("tslib");
const path = tslib_1.__importStar(require("path"));
const generator_1 = tslib_1.__importDefault(require("./generator"));
const rxjs_1 = require("rxjs");
const utils_1 = require("./lib/utils");
const hooks_1 = require("./hooks");
const changesite_1 = tslib_1.__importDefault(require("./changesite"));
const fse = tslib_1.__importStar(require("fs-extra"));
exports.OnArticleGenerated = new rxjs_1.Subject();
exports.OnSiteSynced = new rxjs_1.Subject();
async function createWatcher(root) {
    const { watch } = await import("chokidar");
    const watcher = watch(root, {
        ignoreInitial: true,
        awaitWriteFinish: { stabilityThreshold: 150, pollInterval: 50 },
    });
    await new Promise((resolve, reject) => {
        watcher.once("ready", resolve);
        watcher.once("error", reject);
    });
    return watcher;
}
async function watchArticles(configName = "default") {
    const root = path.resolve("./articles");
    await fse.ensureDir(root);
    const watcher = await createWatcher(root);
    let queue = Promise.resolve();
    const enqueue = (articlePath, type) => {
        queue = queue.then(async () => {
            console.log(`${type}: ${articlePath}`);
            await (0, generator_1.default)(configName);
            const destination = (0, utils_1.pathMap)(articlePath, root, path.resolve("./content"));
            await (0, hooks_1.changed)(destination, type);
            exports.OnArticleGenerated.next();
        }).catch(error => console.error("文章更新失败:", error));
    };
    watcher.on("add", file => enqueue(file, "add"));
    watcher.on("change", file => enqueue(file, "change"));
    watcher.on("unlink", file => enqueue(file, "remove"));
    watcher.on("error", error => console.error("文章监视器错误:", error));
    return watcher;
}
async function watchSite(siteName) {
    const sitePath = path.resolve("./sites", siteName);
    if (!(await fse.pathExists(sitePath))) {
        console.log(`网站 ${siteName} 不存在`);
        return null;
    }
    console.log("正在初始化网站...");
    await (0, changesite_1.default)(siteName);
    const watcher = await createWatcher(sitePath);
    let queue = Promise.resolve();
    const update = () => {
        queue = queue.then(async () => {
            console.log("正在同步网站更改");
            await (0, changesite_1.default)(siteName);
            exports.OnSiteSynced.next();
        }).catch(error => console.error("网站同步失败:", error));
    };
    watcher.on("add", update);
    watcher.on("change", update);
    watcher.on("unlink", update);
    watcher.on("addDir", update);
    watcher.on("unlinkDir", update);
    watcher.on("error", error => console.error("网站监视器错误:", error));
    return watcher;
}
if (require.main === module)
    watchArticles();
//# sourceMappingURL=watch.js.map