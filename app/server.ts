/**
 * 服务器，监控更改并在更改重新生成后发送刷新信号
 */


import * as koa from "koa"
import * as kstatic from "koa-static"
import { watchFile } from "fs";
import watchArticles from "./watch";
import { fork } from "child_process";
import del = require("del");
import generate from "./generator";
import   * as clu from "cluster"
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
        let worker=clu.fork();
        worker.send("start");
        app.listen(port);
    }
    else{
        process.on("message",(msg:"start")=>{
            if(msg=="start"){
                watchArticles(configname);
            }
        })
        
    }
    
    
}

if(require.main==module)
    serve();