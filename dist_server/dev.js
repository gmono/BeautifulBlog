"use strict";
/**
 * 开发服务器 启动根目录的tsconfig.json 编译app目录的程序文件到dist_server
 *            启动Helper目录的tsconfig.json  编译Helper目录的浏览器帮助模块到 app/Helper/helpers.js
 *            启动指定配置文件指定的网站的tsconfig.json 编译其中的ts文件到js
 *            启动 yarn blog server 实时监控内容变化同步到content目录，同时实时监控配置文件配置的site目录的改动并同步到nowSite
 * 开发服务器主要用于本项目本身编写时用，若是终端用户请直接使用yarn blog server
 */
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
/**
 * 启动tsc -w 来监视一个目录的ts文件实时编译
 * @param dirpath 要监控的目录
 */
async function tscWatch(name, dirpath) {
    //需要调查detached在false时，有监听事件时，会不会被自动结束的问题
    let child = child_process_1.exec("tsc -w", {
        cwd: dirpath
    }, (error, stdout, stderr) => {
        if (error != null) {
            console.log(`${name}输出:`, stdout);
            console.log(`${name}ERROR:`, stderr);
        }
    });
    console.log(`[${name}] `, "已启动,正在等待完成......");
    return new Promise((resolve) => {
        //等待输出编译完成后返回
        child.stdout.on("data", (chunk) => {
            if (chunk.indexOf("Compilation complete. Watching for file changes") != -1) {
                //表示已经启动监视
                console.log(`[${name}] `, "初次编译完成");
                //实际返回
                resolve(child);
            }
        });
        child.stderr.on("data", (c) => {
            console.log(`[${name}] `, `错误:`, c);
        });
        child.on("close", (code, signal) => {
            console.log(`[${name}] `, "已退出", `退出代码${code}`);
        });
    });
}
async function main() {
    console.log("正在启动处理进程......");
    let childs = await Promise.all([
        tscWatch("App ts监视器", "."),
        tscWatch("Helper ts监视器", "./app/Helper")
    ]);
    //等待所有任务结束 或输入q 结束所有进程
    console.log("输入ctrl+c结束所有监视任务");
}
exports.default = main;
main();
