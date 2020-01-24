"use strict";
/**
 * 服务器，监控更改并在更改重新生成后发送刷新信号
 */
Object.defineProperty(exports, "__esModule", { value: true });
const koa = require("koa");
const kstatic = require("koa-static");
const watch_1 = require("./watch");
const del = require("del");
const generator_1 = require("./generator");
const clu = require("cluster");
const app = new koa();
app.use(kstatic("."));
async function serve(port = 80, configname = "default") {
    //启动监视
    if (clu.isMaster) {
        console.log(`服务器启动，端口:${port},地址:http://localhost:${port}`);
        //删除原有content 全部重新生成
        await del("./content");
        console.log("已启动全部重新生成");
        generator_1.default(configname);
        //开启监视进程
        let worker = clu.fork();
        worker.send("start");
        app.listen(port);
    }
    else {
        process.on("message", (msg) => {
            if (msg == "start") {
                watch_1.default(configname);
            }
        });
    }
}
exports.default = serve;
if (require.main == module)
    serve();
