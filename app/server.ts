//开发服务器 用于实时预览 未完成

import * as fs from "fs"
import * as watch from "watch"
async function createMonitor(root:string){
    return new Promise<watch.Monitor>((resolve,reject)=>{
        watch.createMonitor(root,(monitor)=>{
            resolve(monitor);
        })
    });
}
async function main(){
    let mon=await createMonitor("./articles");
    mon.on("changed",(f,curr,prev)=>{
        //更改文件
        console.log(f,curr);
    });
    mon.on("created",(f,curr,prev)=>{
        //创建了文章
    })
    mon.on("removed",(f,curr,prev)=>{
        //移除文章 
    })
}
main();