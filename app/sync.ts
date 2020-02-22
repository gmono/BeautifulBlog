/**
 * 服务器，监控更改并在更改重新生成后发送刷新信号
 */


import * as koa from "koa"
import * as kstatic from "koa-static"
import * as krouter from "koa-router"


import del = require("del");
import generate from "./generator";


import { IConfig } from "./Interface/IConfig";
import * as fse from 'fs-extra';


//尝试使用此模块实现



import { runFunction, IThreadContext } from './lib/runInThread';





function worker1(context:IThreadContext,configname:string){
    // let path=require("path")
    // console.log(path.resolve("."))
    //
    type W=typeof import("./watch");
    let watchArticles=context.localRequire<W>("./watch").default;
    console.log("开始监视文章改动");
    watchArticles(configname);
}
function worker2(context:IThreadContext,config:IConfig){
    type W=typeof import("./watch");
    let watchSite=context.localRequire<W>("./watch").watchSite;
    console.log(`开始监视网站 [${config.site}] 改动`)
    watchSite(config.site);
}
;

/**
 * 此函数一定要作为单独程序启动
 * @param port 接口
 * @param configname 配置文件
 */
export default async function serve(port:number=80,configname="default"){
    let config=(await fse.readJSON(`./config/${configname}.json`)) as IConfig;
    //启动服务器
    let startServer=(port:number)=>{
        //启动服务器
        const app=new koa();
        //prefixify中间件
        app.use(async (ctx,next)=>{
            let p=ctx.path;
            if(p.startsWith(config.base_url)){

                // if(p==config.base_url&&!p.endsWith("/")) (p+="/",ctx.redirect(p));
                //去除
                let ap=p.slice(config.base_url.length);
                if(ap=="") ap="/";
                
                //使用去头后的调用next
                ctx.path=ap;
                return next();
            }
            //错误
            ctx.redirect(config.base_url+"/");
        })
        app.use(kstatic("."))
        app.listen(port);
    }
    //主线程 启动服务器
    startServer(port);
    console.log(`服务器启动，端口:${port},地址:http://localhost:${port}${config.base_url}`);
    //删除原有content 全部重新生成
    await del("./content");
    console.log("已启动全部重新生成");
    await generate(configname)
    //开启监视线程
    let w1=runFunction(__dirname,worker1,configname);
    // w1.stdout.on("data",(c:Buffer)=>console.log(`[文章同步器] ${c.toString()}`))
    let w2=runFunction(__dirname,worker2,config);
    // w2.stdout.on("data",(c:Buffer)=>console.log(`[网站同步器] ${c.toString()}`))

}

    
    

if(require.main==module)
    serve();