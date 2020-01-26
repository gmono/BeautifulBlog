/**
 * 服务器，监控更改并在更改重新生成后发送刷新信号
 */


import * as koa from "koa"
import * as kstatic from "koa-static"
import { watchFile } from "fs";
import watchArticles, { watchSite } from "./watch";
import { fork } from "child_process";
import del = require("del");
import generate from "./generator";
import   * as clu from "cluster"
import { IConfig } from "./Interface/IConfig";
const app=new koa();
app.use(kstatic("."));

export default async function serve(port:number=80,configname="default"){
    
    //启动监视
    if(clu.isMaster){
        console.log(`服务器启动，端口:${port},地址:http://localhost:${port}`);
        //删除原有content 全部重新生成
        await del("./content");
        console.log("已启动全部重新生成");
        generate(configname)
        //开启监视进程
        let worker1=clu.fork();
        let worker2=clu.fork();
        //同时监控文章和网站
        worker1.send("start");
        worker2.send("site");
        app.listen(port);
    }
    else{
        process.on("message",(msg:"article"|"site")=>{
            if(msg=="article"){
                watchArticles(configname);
            }
            else if(msg=="site"){
                //监控网站 读取指定配置文件中的网站设置
                let config=require(`../config/${configname}.json`) as IConfig;
                let sname=config.site;
                watchSite(sname);
            }
        })
        
    }
    
    
}

if(require.main==module)
    serve();