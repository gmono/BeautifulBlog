"use strict";
/**
 * 服务器，监控更改并在更改重新生成后发送刷新信号
 */
Object.defineProperty(exports, "__esModule", { value: true });
const koa = require("koa");
const kstatic = require("koa-static");
const child_process_1 = require("child_process");
const app = new koa();
app.use(kstatic("."));
async function serve(port = 80) {
    console.log(`服务器启动，端口:${port},地址:http://localhost:${port}`);
    //启动监视
    child_process_1.fork("./dist_server/watch.js");
    app.listen(port);
}
exports.default = serve;
if (require.main == module)
    serve();
