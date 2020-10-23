"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const koa = require("koa");
const kstatic = require("koa-static");
const del = require("del");
const generator_1 = require("./generator");
const fse = require("fs-extra");
const runInThread_1 = require("./lib/runInThread");
const template = require("art-template");
const path = require("path");
function getUpdatedMessage(date) {
    return {
        type: "updated",
        data: date
    };
}
function worker1(context, configname) {
    let wh = context.localRequire("./watch");
    let watchArticles = wh.default;
    console.log("开始监视文章改动");
    wh.OnArticleGenerated.subscribe(() => {
        context.sendMessage(getUpdatedMessage(new Date()));
    });
    watchArticles(configname);
}
function worker2(context, config) {
    let wh = context.localRequire("./watch");
    let watchSite = wh.watchSite;
    console.log(`开始监视网站 [${config.site}] 改动`);
    wh.OnSiteSynced.subscribe(() => {
        context.sendMessage(getUpdatedMessage(new Date()));
    });
    watchSite(config.site);
}
;
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
        let temp = template(framefile, {
            content: str
        });
        ctx.body = temp;
        return ret;
    };
}
const serverInfo = {
    article_updateTime: new Date(),
    site_updateTime: new Date()
};
async function serve(port = null, configname = "default") {
    let config = (await fse.readJSON(`./config/${configname}.json`));
    if (port == null)
        port = 1024 + Math.floor((Math.random() * 65535));
    let startServer = (port) => {
        const app = new koa();
        app.use(async (ctx, next) => {
            if (ctx.path == "/info") {
                ctx.body = JSON.stringify(serverInfo);
                return;
            }
            else
                return next();
        });
        let mid = getContentFrame(path.resolve(__dirname, "../static/head.html"));
        app.use(mid);
        app.use(async (ctx, next) => {
            let p = ctx.path;
            if (p.startsWith(config.base_url)) {
                let ap = p.slice(config.base_url.length);
                if (ap == "")
                    ap = "/";
                ctx.path = ap;
                return next();
            }
            ctx.redirect(config.base_url + "/");
        });
        app.use(kstatic("."));
        app.listen(port);
    };
    try {
        startServer(port);
    }
    catch (e) {
        port = port + 1 + Math.random() * (65535 - port);
        port = Math.floor(port);
        console.log("启动服务器失败，尝试重选端口");
        startServer(port);
    }
    console.log(`服务器启动，端口:${port},地址:http://localhost:${port}${config.base_url}`);
    await del("./content");
    console.log("已启动全部重新生成");
    await generator_1.default(configname);
    let w1 = runInThread_1.runFunction(__dirname, {}, { getUpdatedMessage }, worker1, configname);
    w1.MessagePump("updated").subscribe((dt) => {
        serverInfo.article_updateTime = dt;
    });
    let w2 = runInThread_1.runFunction(__dirname, {}, { getUpdatedMessage }, worker2, config);
    w2.onMessage("update", (dt) => {
        serverInfo.site_updateTime = dt;
    });
}
exports.default = serve;
if (require.main == module)
    serve(8000);
//# sourceMappingURL=sync.js.map