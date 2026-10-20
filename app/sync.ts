/**
 * 服务器，监控更改并在更改重新生成后发送刷新信号
 */


import Koa = require("koa")
import kstatic from "koa-static"


import generate from "./generator";


import { IConfig } from "./Interface/IConfig";
import * as fse from 'fs-extra';


//尝试使用此模块实现



import { runFunction, IThreadContext, IMessage } from './lib/runInThread';
import template = require('art-template');
import * as path from 'path';
import { stripBaseUrl } from "./url";
import { WriteStream } from "fs-extra";
import { ReadStream } from "tty";
import { IServerInfo } from './Interface/IServerInfo';





//worker会发布updated消息 
type UpdateMsg=IMessage<Date>;
function getUpdatedMessage(date:Date){
    return <IMessage<Date>>{
        type:"updated",
        data:date
    }
}


async function worker1(context:IThreadContext,configname:string){
    // let path=require("path")
    // console.log(path.resolve("."))
    //
    type W=typeof import("./watch");
    let wh=context.localRequire<W>("./watch");
    let watchArticles=wh.default;
    console.log("开始监视文章改动");
    //发送更新消息
    wh.OnArticleGenerated.subscribe(()=>{
        context.sendMessage(getUpdatedMessage(new Date()))
    })
    await watchArticles(configname);
    console.log("文章监视已就绪");
}
async function worker2(context:IThreadContext,config:IConfig){
    type W=typeof import("./watch");
    let wh=context.localRequire<W>("./watch");
    let watchSite=wh.watchSite;
    console.log(`开始监视网站 [${config.site}] 改动`)
    wh.OnSiteSynced.subscribe(()=>{
        context.sendMessage(getUpdatedMessage(new Date()))
    })
    await watchSite(config.site);
}
;

//获取内容Frame中间件 通过art-template模板文件
function getContentFrame(framefile:string){
    return async (ctx:Koa.ParameterizedContext<Koa.DefaultState, Koa.DefaultContext>,next)=>{
        let ret=await next();
        if(ctx.type!="text/html") return ret;
        let body=ctx.body as ReadStream;
        let str="";
        for await (let t of body){
            str+=(<Buffer>t).toString();
        }
        //给html加框架
        let temp=template(framefile,{
            content:str
        });
        // console.log(temp);
        ctx.body=temp;
        return ret;
    }
    
}

const serverInfo={
    article_updateTime:new Date(),
    site_updateTime:new Date()
} as IServerInfo;

//新方法之后学习用
type t=Parameters<typeof serve>
type s=ReturnType<typeof serve>;
//
/**
 * 此函数一定要作为单独程序启动
 * @param port 接口 null时自动选择
 * @param configname 配置文件
 */
export default async function serve(port:number=null,configname="default"){
    let config=(await fse.readJSON(`./config/${configname}.json`)) as IConfig;
    //启动服务器
    if(port==null) port=1024+Math.floor((Math.random()*65535));
    const app=new Koa();
    app.use(async (ctx,next)=>{
        if(ctx.path==="/info"){
            ctx.body=JSON.stringify(serverInfo);
            return;
        }
        return next();
    });
    const mid=getContentFrame(path.resolve(__dirname,"../../static/head.html"));
    app.use(mid);
    app.use(async (ctx,next)=>{
        const staticPath=stripBaseUrl(ctx.path,config.base_url);
        if(staticPath===null){ctx.status=404;return;}
        ctx.path=staticPath;
        return next();
    });
    app.use(kstatic("."));

    let server:ReturnType<typeof app.listen>;
    for(let attempt=0;attempt<64;attempt++){
        server=app.listen(port);
        try{
            await new Promise<void>((resolve,reject)=>{
                server.once("listening",resolve);
                server.once("error",reject);
            });
            break;
        }catch(error){
            server.close();
            if(error.code!=="EADDRINUSE"||attempt===63) throw error;
            port=port>=65535?1024:port+1;
        }
    }
    console.log(`服务器启动，端口:${port},地址:http://localhost:${port}${config.base_url}`);
    // 强制重新处理文章，但保留旧发布结果，主题切换或处理失败时可继续提供旧内容。
    console.log("已启动全部重新生成");
    await generate(configname, false, true)
    //开启监视线程
    let w1=runFunction(__dirname,{},{getUpdatedMessage},worker1,configname);
    w1.onMessage<UpdateMsg>("updated",(dt)=>{
        serverInfo.article_updateTime=dt;
    })
    let w2=runFunction(__dirname,{},{getUpdatedMessage},worker2,config);
    w2.onMessage<UpdateMsg>("updated",(dt)=>{
        serverInfo.site_updateTime=dt;
    })
    w1.on("error",error=>console.error("文章监视线程错误:",error));
    w2.on("error",error=>console.error("主题监视线程错误:",error));
    w1.on("exit",code=>{if(code!==0) console.error(`文章监视线程退出，代码 ${code}`)});
    w2.on("exit",code=>{if(code!==0) console.error(`主题监视线程退出，代码 ${code}`)});

}

    
    

if(require.main==module)
    serve(8000);
