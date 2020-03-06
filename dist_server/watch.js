"use strict";
//开发服务器 用于实时预览 未完成
Object.defineProperty(exports, "__esModule", { value: true });
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
//这里的设计可能不支持 启动多个监视器 后续考虑改为面向对象写法
exports.OnArticleGenerated = new rxjs_1.Subject();
exports.OnSiteSynced = new rxjs_1.Subject();
async function generateFiles(configname) {
    //启动重新生成
    await generator_1.default(configname);
    exports.OnArticleGenerated.next();
}
async function watchArticles(configname = "default") {
    //等待更改 自动进行全部重新生成 如同服务器里一样
    let mon = await createMonitor("./articles");
    //刷新函数 
    let refresh = async (f, stat, msgtype) => {
        //检测是否为文件（可能是目录）
        if (!stat.isFile())
            return;
        console.clear();
        console.log(`${msgtype}:${f}`);
        await generateFiles(configname);
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
/**
 * 监控指定site，如果有改动就自动复制到nowSite（实际上一开始是先删除再建立再复制为保证完整性）
 * @param sitename 网站名字
 */
async function watchSite(sitename) {
    let spath = path.resolve("./sites", sitename);
    if (!(await fse.pathExists(spath)))
        return;
    let mon = await createMonitor(spath);
    let update = async (f) => {
        //更新网站
        //这里直接使用changesite 后期考虑优化
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
    // watchSite("default");
}
//# sourceMappingURL=watch.js.map