"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = serve;
const tslib_1 = require("tslib");
const Koa = require("koa");
const koa_static_1 = tslib_1.__importDefault(require("koa-static"));
const generator_1 = tslib_1.__importDefault(require("./generator"));
const fse = tslib_1.__importStar(require("fs-extra"));
const runInThread_1 = require("./lib/runInThread");
const template = require("art-template");
const path = tslib_1.__importStar(require("path"));
const url_1 = require("./url");
function getUpdatedMessage(date) {
    return {
        type: "updated",
        data: date
    };
}
async function worker1(context, configname) {
    let wh = context.localRequire("./watch");
    let watchArticles = wh.default;
    console.log("开始监视文章改动");
    wh.OnArticleGenerated.subscribe(() => {
        context.sendMessage(getUpdatedMessage(new Date()));
    });
    await watchArticles(configname);
    console.log("文章监视已就绪");
}
async function worker2(context, config) {
    let wh = context.localRequire("./watch");
    let watchSite = wh.watchSite;
    console.log(`开始监视网站 [${config.site}] 改动`);
    wh.OnSiteSynced.subscribe(() => {
        context.sendMessage(getUpdatedMessage(new Date()));
    });
    await watchSite(config.site);
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
    const app = new Koa();
    app.use(async (ctx, next) => {
        if (ctx.path === "/info") {
            ctx.body = JSON.stringify(serverInfo);
            return;
        }
        return next();
    });
    const mid = getContentFrame(path.resolve(__dirname, "../../static/head.html"));
    app.use(mid);
    app.use(async (ctx, next) => {
        const staticPath = (0, url_1.stripBaseUrl)(ctx.path, config.base_url);
        if (staticPath === null) {
            ctx.status = 404;
            return;
        }
        ctx.path = staticPath;
        return next();
    });
    app.use((0, koa_static_1.default)("."));
    let server;
    for (let attempt = 0; attempt < 64; attempt++) {
        server = app.listen(port);
        try {
            await new Promise((resolve, reject) => {
                server.once("listening", resolve);
                server.once("error", reject);
            });
            break;
        }
        catch (error) {
            server.close();
            if (error.code !== "EADDRINUSE" || attempt === 63)
                throw error;
            port = port >= 65535 ? 1024 : port + 1;
        }
    }
    console.log(`服务器启动，端口:${port},地址:http://localhost:${port}${config.base_url}`);
    console.log("已启动全部重新生成");
    await (0, generator_1.default)(configname, false, true);
    let w1 = (0, runInThread_1.runFunction)(__dirname, {}, { getUpdatedMessage }, worker1, configname);
    w1.onMessage("updated", (dt) => {
        serverInfo.article_updateTime = dt;
    });
    let w2 = (0, runInThread_1.runFunction)(__dirname, {}, { getUpdatedMessage }, worker2, config);
    w2.onMessage("updated", (dt) => {
        serverInfo.site_updateTime = dt;
    });
    w1.on("error", error => console.error("文章监视线程错误:", error));
    w2.on("error", error => console.error("主题监视线程错误:", error));
    w1.on("exit", code => { if (code !== 0)
        console.error(`文章监视线程退出，代码 ${code}`); });
    w2.on("exit", code => { if (code !== 0)
        console.error(`主题监视线程退出，代码 ${code}`); });
}
if (require.main == module)
    serve(8000);
//# sourceMappingURL=sync.js.map