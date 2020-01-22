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
exports.OnGenerated = new rxjs_1.Subject();
async function generateFiles() {
    //启动重新生成
    await generator_1.default();
    exports.OnGenerated.next();
}
async function watchfile() {
    let mon = await createMonitor("./articles");
    mon.on("changed", async (f, curr, prev) => {
        console.clear();
        console.log(`更改:${f}`);
        await generateFiles();
    });
    mon.on("created", async (f, stat) => {
        //创建了文章
        console.clear();
        console.log(`新文章:${f}`);
        await generateFiles();
    });
    mon.on("removed", async (f, stat) => {
        //移除文章 
        console.clear();
        console.log(`删除:${f}`);
        await generateFiles();
    });
}
if (require.main == module) {
    watchfile();
}
