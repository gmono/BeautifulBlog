"use strict";
/**
 * 服务器，监控更改并在更改重新生成后发送刷新信号
 */
Object.defineProperty(exports, "__esModule", { value: true });
const koa = require("koa");
const kstatic = require("koa-static");
const watch_1 = require("./watch");
const clu = require("cluster");
const fse = require("fs-extra");
const cluster = require("cluster");
/**
 * 此函数一定要作为单独程序启动
 * @param port 接口
 * @param configname 配置文件
 */
async function serve(port = 80, configname = "default") {
    let config = (await fse.readJSON(`./config/${configname}.json`));
    //启动服务器
    let startServer = (port) => {
        //启动服务器
        const app = new koa();
        //prefixify中间件
        app.use(async (ctx, next) => {
            let p = ctx.path;
            if (p.startsWith(config.base_url)) {
                // if(p==config.base_url&&!p.endsWith("/")) (p+="/",ctx.redirect(p));
                //去除
                let ap = p.slice(config.base_url.length);
                if (ap == "")
                    ap = "/";
                //使用去头后的调用next
                ctx.path = ap;
                return next();
            }
            //错误
            ctx.redirect(config.base_url + "/");
        });
        app.use(kstatic("."));
        app.listen(port);
    };
    console.log("ttt");
    //启动监视
    if (clu.isMaster) {
        startServer(port);
        console.log(`服务器启动，端口:${port},地址:http://localhost:${port}${config.base_url}`);
        //删除原有content 全部重新生成
        // await del("./content");
        console.log("已启动全部重新生成");
        // await generate(configname)
        //开启监视进程
        let worker1 = clu.fork();
        let worker2 = clu.fork();
        worker1.send("article");
        worker2.send("site");
    }
    else {
        process.send("helo");
        cluster.addListener("message", (msg) => {
            console.log("开始监视文章");
            if (msg == "article") {
                watch_1.default(configname);
            }
            else if (msg == "site") {
                //监控网站 读取指定配置文件中的网站设置
                let sname = config.site;
                watch_1.watchSite(sname);
            }
        });
    }
}
exports.default = serve;
if (require.main == module)
    serve();
//# sourceMappingURL=sync.js.map