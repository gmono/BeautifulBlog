"use strict";
/**
 * 服务器，监控更改并在更改重新生成后发送刷新信号
 */
Object.defineProperty(exports, "__esModule", { value: true });
const koa = require("koa");
const kstatic = require("koa-static");
const del = require("del");
const generator_1 = require("./generator");
const fse = require("fs-extra");
//尝试使用此模块实现
const runInThread_1 = require("./lib/runInThread");
const template = require("art-template");
const path = require("path");
function worker1(context, configname) {
    ("./watch");
    let watchArticles = context.localRequire("./watch").default;
    console.log("开始监视文章改动");
    watchArticles(configname);
}
function worker2(context, config) {
    ("./watch");
    let watchSite = context.localRequire("./watch").watchSite;
    console.log(`开始监视网站 [${config.site}] 改动`);
    watchSite(config.site);
}
;
//获取内容Frame中间件 通过art-template模板文件
function getContentFrame(framefile) {
    return async (ctx, next) => {
        let ret = await next();
        if (ctx.type != "text/html")
            return ret;
        let body = ctx.body;
        let str = "";
        for await (let t of body) {
            str += t.toString();
        }
        //给html加框架
        let temp = template(framefile, {
            content: str
        });
        // console.log(temp);
        ctx.body = temp;
        return ret;
    };
}
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
        //html添加前缀中间件
        let mid = getContentFrame(path.resolve(__dirname, "../static/head.html"));
        app.use(mid);
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
    //主线程 启动服务器
    startServer(port);
    console.log(`服务器启动，端口:${port},地址:http://localhost:${port}${config.base_url}`);
    //删除原有content 全部重新生成
    await del("./content");
    console.log("已启动全部重新生成");
    await generator_1.default(configname);
    //开启监视线程
    let w1 = runInThread_1.runFunction(__dirname, worker1, configname);
    // w1.stdout.on("data",(c:Buffer)=>console.log(`[文章同步器] ${c.toString()}`))
    let w2 = runInThread_1.runFunction(__dirname, worker2, config);
    // w2.stdout.on("data",(c:Buffer)=>console.log(`[网站同步器] ${c.toString()}`))
}
exports.default = serve;
if (require.main == module)
    serve(8000);
//# sourceMappingURL=sync.js.map