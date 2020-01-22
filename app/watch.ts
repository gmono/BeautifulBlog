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
import generate from "./generator";
import { Subject } from "rxjs";
export const OnGenerated:Subject<void>=new Subject();


async function generateFiles(){
    
    //启动重新生成
    await generate();
    OnGenerated.next();

}
async function watchfile(){
    let mon=await createMonitor("./articles");
    mon.on("changed",async (f:string,curr,prev)=>{
        console.clear();
        console.log(`更改:${f}`);
        await generateFiles();
    });
    mon.on("created",async (f:string,stat)=>{
        //创建了文章
        console.clear();
        console.log(`新文章:${f}`);
        await generateFiles();
    })
    mon.on("removed",async (f:string,stat)=>{
        //移除文章 
        console.clear();
        console.log(`删除:${f}`);
        await generateFiles();
    })
}
if(require.main==module){
    watchfile();
}