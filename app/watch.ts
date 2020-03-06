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

//这里的设计可能不支持 启动多个监视器 后续考虑改为面向对象写法
export const OnArticleGenerated:Subject<void>=new Subject();
export const OnSiteSynced:Subject<void>=new Subject();
async function generateFiles(configname:string){
    //启动重新生成
    await generate(configname);
    OnArticleGenerated.next();
}

export default async function watchArticles(configname:string="default"){
    //等待更改 自动进行全部重新生成 如同服务器里一样
    let mon=await createMonitor("./articles");
    //刷新函数 
    let refresh=async (f:string,stat:fs.Stats,msgtype:string)=>{
        //检测是否为文件（可能是目录）
        if(!stat.isFile()) return;
        console.clear();
        console.log(`${msgtype}:${f}`);
        await generateFiles(configname);
    }
    mon.on("changed",async (f:string,curr,prev)=>{
        await refresh(f,curr,"更改");
    });
    mon.on("created",async (f:string,stat)=>{
        await refresh(f,stat,"新文章");
    })
    mon.on("removed",async (f:string,stat)=>{
        await refresh(f,stat,"删除");
    })
}
import * as path from "path"
import * as pe from "path-extra"
import * as fse from "fs-extra"
import changesite from './changesite';
import { EventEmitter } from "events";
/**
 * 监控指定site，如果有改动就自动复制到nowSite（实际上一开始是先删除再建立再复制为保证完整性） 
 * @param sitename 网站名字
 */
export async function watchSite(sitename:string){
    let spath=path.resolve("./sites",sitename);
    if(!(await fse.pathExists(spath))) return ;
    let mon=await createMonitor(spath);
    let update=async (f)=>{
        //更新网站
        //这里直接使用changesite 后期考虑优化
        await changesite(sitename);
        console.log("网站同步完成!");
        OnSiteSynced.next();
    }
    mon.on("changed",async (f:string,c,p)=>{
        await update(f);
    })
    mon.on("created",async (f:string,s)=>{
        await update(f);
    })
    mon.on("removed",async (f:string,s)=>{
        await update(f);
    })
}
if(require.main==module){
    watchArticles();
    // watchSite("default");
}