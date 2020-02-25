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



import { runFunction, IThreadContext, IMessage } from './lib/runInThread';
import * as template from 'art-template';
import * as path from 'path';
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


function worker1(context:IThreadContext,configname:string){
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
    watchArticles(configname);
}
function worker2(context:IThreadContext,config:IConfig){
    type W=typeof import("./watch");
    let wh=context.localRequire<W>("./watch");
    let watchSite=wh.watchSite;
    console.log(`开始监视网站 [${config.site}] 改动`)
    wh.OnSiteSynced.subscribe(()=>{
        context.sendMessage(getUpdatedMessage(new Date()))
    })
    watchSite(config.site);
}
;

//获取内容Frame中间件 通过art-template模板文件
function getContentFrame(framefile:string){
    return async (ctx:koa.ParameterizedContext<koa.DefaultState, koa.DefaultContext>,next)=>{
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
    
    let startServer=(port:number)=>{
        //启动服务器
        const app=new koa();
        app.use(async (ctx,next)=>{
            //这里拦截查询服务器信息的请求
            if(ctx.path=="/info"){
                ctx.body=JSON.stringify(serverInfo);
                return;
            }else return next();
        })
        //html添加前缀中间件
        let mid=getContentFrame(path.resolve(__dirname,"../static/head.html"));
        app.use(mid);
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
        // app.on("error",v=>console.log("hello"))
        app.listen(port);
    }
    //主线程 启动服务器 这里错误捕捉不成功
    try{
        startServer(port);
    }catch(e){
        //此处重选端口并启动服务器
        port=port+1+Math.random()*(65535-port);
        port=Math.floor(port);
        console.log("启动服务器失败，尝试重选端口");
        startServer(port);
    }
    console.log(`服务器启动，端口:${port},地址:http://localhost:${port}${config.base_url}`);
    //删除原有content 全部重新生成
    await del("./content");
    console.log("已启动全部重新生成");
    await generate(configname)
    //开启监视线程
    let w1=runFunction(__dirname,{},{getUpdatedMessage},worker1,configname);
    w1.MessagePump<UpdateMsg>("updated").subscribe((dt)=>{
        serverInfo.article_updateTime=dt;
    })
    let w2=runFunction(__dirname,{},{getUpdatedMessage},worker2,config);
    w2.onMessage<UpdateMsg>("update",(dt)=>{
        serverInfo.site_updateTime=dt;
    })

}

    
    

if(require.main==module)
    serve(8000);