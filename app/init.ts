import { mkdir } from "fs-extra";
import * as execa from "execa"
/**
 * 主要用于在一个目录中创建基本的博客目录结构
 * 功能：
 * 在目录中创建博客
 * 如果目录不存在可自动创建目录（可选）
 */
import * as fse from "fs-extra"
import * as path from 'path';
import * as walk from 'walk';
import * as del from 'del';
// import { fork } from 'child_process';
import changesite from './changesite';
import { initGit } from "./manager";
import { runInDir } from "./lib/utils";
import { innerCopy } from "./lib/utils";


/**
 * 在目录中创建博客
 * @param dirpath 要创建博客的目录
 * @param autocreate 是否在不存在目录时自动创建目录
 * @param autoreplace 是否在创建子目录出现冲突时自信replace策略，删除dirpath后重建，请谨慎使用
 */
export async function createBlog(dirpath:string,autocreate:boolean=true,autoreplace:boolean=false){
    if(!(await fse.pathExists(dirpath))) 
    if(autocreate) await fse.ensureDir(dirpath);
    else console.warn("目录不存在！");
    

    /**
     * 
     */
    let  createSubDir=async ()=>{
        await Promise.all([
            mkdir(`${dirpath}/articles`),
            mkdir(`${dirpath}/content`),
            mkdir(`${dirpath}/nowSite`),
            mkdir(`${dirpath}/config`),
            mkdir(`${dirpath}/sites`),
            mkdir(`${dirpath}/assets`)
        ]);
    }
    //当前直接程序创建
    //未来考虑使用模板解压
    try{
        await createSubDir();
    }catch(e){
        if(autoreplace){
            console.log("创建子目录失败，删除重建中");
            await del(dirpath);
            await mkdir(dirpath);
            await createSubDir();
        }else{
            console.log("创建子目录失败，此目录中可能已存在Blog")
            return;
        }
        
    }
    
    console.log("目录创建完毕")
    await Promise.all([
        innerCopy(`${__dirname}/../sites/default`,`${dirpath}/sites/default`),
        innerCopy(`${__dirname}/../config/default.json`,`${dirpath}/config/default.json`),
        innerCopy(`${__dirname}/../assets`,`${dirpath}/assets`),
        innerCopy(`${__dirname}/../index.html`,`${dirpath}/index.html`),
        innerCopy(`${__dirname}/../global.json`,`${dirpath}/global.json`)
    ]);
    console.log("文件复制完毕");
    console.log("切换到默认site");
    await runInDir(dirpath,async ()=>await changesite("default"));
    await initGit(dirpath);
    

}

if(require.main==module){
    createBlog("./tst",true,true);
}