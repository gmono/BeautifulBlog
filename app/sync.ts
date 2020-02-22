/**
 * 服务器，监控更改并在更改重新生成后发送刷新信号
 */


import * as koa from "koa"
import * as kstatic from "koa-static"
import * as krouter from "koa-router"


import { watchFile, watch } from "fs";
import watchArticles, { watchSite } from "./watch";
import del = require("del");
import generate from "./generator";
import   * as clu from "cluster"

import { IConfig } from "./Interface/IConfig";
import * as fse from 'fs-extra';


//尝试使用此模块实现
import * as thread from "worker_threads"
import * as path from 'path';


function wrequire<T>(m:string):T{
    throw new Error("错误，此函数应在worker中被调用")
}

function worker1(configname:string){
    type W=typeof import("./watch");
    let watchArticles=wrequire<W>("./watch").default;
    console.log("开始监视文章改动");
    watchArticles(configname);
}
function worker2(config:IConfig){
    type W=typeof import("./watch");
    let watchSite=wrequire<W>("./watch").watchSite;
    console.log(`开始监视网站 [${config.site}] 改动`)
    watchSite(config.site);
}
/**
 * 在新线程里运行一个函数 返回worker
 * @param func 函数
 * @param args 参数
 */
export function runFunction(func:(...args)=>any,...args){
    let rel=path.relative(".",__dirname).replace("\\","/");
    rel="./"+rel;
    if(rel!="./") rel+="/";
    let worker=new thread.Worker(`
        let __argv=require('worker_threads').workerData;
        function wrequire(mod){
            return require("${rel}"+mod);
        }
        let __func=${func.toString()}
        __func(...__argv);
    `,{eval:true,workerData:args})
    return worker;
};

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
    // await del("./content");
    console.log("已启动全部重新生成");
    // await generate(configname)
    //开启监视线程
    let w1=runFunction(worker1,configname);
    // w1.stdout.on("data",(c:Buffer)=>console.log(`[文章同步器] ${c.toString()}`))
    let w2=runFunction(worker2,config);
    // w2.stdout.on("data",(c:Buffer)=>console.log(`[网站同步器] ${c.toString()}`))

}

    
    

if(require.main==module)
    serve();