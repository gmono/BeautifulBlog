"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.watchSite = exports.OnSiteSynced = exports.OnArticleGenerated = void 0;
const watch = require("watch");
async function createMonitor(root) {
    return new Promise((resolve, reject) => {
        watch.createMonitor(root, (monitor) => {
            resolve(monitor);
        });
    });
}
const generator_1 = require("./generator");
const rxjs_1 = require("rxjs");
exports.OnArticleGenerated = new rxjs_1.Subject();
exports.OnSiteSynced = new rxjs_1.Subject();
async function generateFiles(configname) {
    await generator_1.default(configname);
    exports.OnArticleGenerated.next();
}
async function watchArticles(configname = "default") {
    let mon = await createMonitor("./articles");
    let refresh = async (f, stat, msgtype) => {
        if (!stat.isFile())
            return;
        console.clear();
        console.log(`${msgtype}:${f}`);
        await generateFiles(configname);
        const dest = utils_1.pathMap(f, "./articles", "./content");
        await hooks_1.changed(f, dest);
    };
    mon.on("changed", async (f, curr, prev) => {
        await refresh(f, curr, "更改");
    });
    mon.on("created", async (f, stat) => {
        await refresh(f, stat, "新文章");
    });
    mon.on("removed", async (f, stat) => {
        await refresh(f, stat, "删除");
    });
}
exports.default = watchArticles;
const path = require("path");
const fse = require("fs-extra");
const changesite_1 = require("./changesite");
const hooks_1 = require("./hooks");
const utils_1 = require("./lib/utils");
async function watchSite(sitename) {
    let spath = path.resolve("./sites", sitename);
    if (!(await fse.pathExists(spath))) {
        console.log(`网站${sitename}不存在`);
        return;
    }
    console.log("正在初始化网站...");
    await changesite_1.default(sitename);
    let mon = await createMonitor(spath);
    let update = async (f) => {
        console.log("正在同步网站更改");
        await changesite_1.default(sitename);
        console.log("网站同步完成!");
        exports.OnSiteSynced.next();
    };
    mon.on("changed", async (f, c, p) => {
        await update(f);
    });
    mon.on("created", async (f, s) => {
        await update(f);
    });
    mon.on("removed", async (f, s) => {
        await update(f);
    });
}
exports.watchSite = watchSite;
if (require.main == module) {
    watchArticles();
}
//# sourceMappingURL=watch.js.map