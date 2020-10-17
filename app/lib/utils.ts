import * as fse from 'fs-extra';
import { IConfig } from '../Interface/IConfig';
import path = require("path");
import * as walk from "walk"
import { IGlobalConfig } from '../Interface/IGlobalConfig';
import { deepEqual } from 'assert';
//确保对象指定的key中没有undefined
export function objHasValue(obj:object,names:PropertyKey[],val:any){
    for(let k of names){
        if(obj[k]===val)
            return true;
    }
    return false;
} 
export function hasUndefined<T extends Parameters<typeof objHasValue>>(...args:[T[0],T[1]]){
    return objHasValue(args[0],args[1],undefined);
}

export function readConfig(name:string){
    return fse.readJson(path.resolve(__dirname,`../../config/${name}.json`)) as Promise<IConfig>;
}
export function readGlobalConfig(){
    //读取全局配置文件 从blog根目录
    return fse.readJSON("./global.json") as Promise<IGlobalConfig>;
}
export function writeToGlobalConfig(obj:IGlobalConfig)
{
    return fse.writeJSON("./global.json",obj,{spaces:4});
}
//添加函数 用于支持“修改json文件"
export async function changeJson<T>(jsonpath:string,cbk:(obj:T)=>Promise<T>){
    let obj=await fse.readJson(jsonpath);
    let res=await cbk(obj);
    await fse.writeJson(jsonpath,res);
}

export async function runInDir<T extends Parameters<typeof runWithError>>(dirpath:string,...args:T){
    // assert(args.length>=2,"参数错误");
    const s=process.cwd()
    process.chdir(dirpath);
    await (runWithError as Function)(...args);
    process.chdir(s);
}

export async function runWithError<T extends any[]>(func:(...args:T)=>any,errorcbk?:(e:any)=>void,args?:T)
{
    try{
        //无参调用与有参调用
        if(args==null)
        {
            let fun=func as Function;
            await fun();
        }
        else func(...args);
        
    }
    catch(e){
        if(errorcbk) errorcbk(e);
    }
}

/**
 * 修改一个路径的扩展名并返回(原文件名无扩展名也可使用)
 * @param fpath 文件路径
 * @param ext 扩展名 .xxx
 */
export function changeExt(fpath:string,ext:string=""){
    let obj=path.parse(fpath);
    obj.ext=ext;
    obj.base=obj.name+obj.ext;
    let npath=path.format(obj);
    npath=npath.replace(/\\/g,"/");
    return npath;
}

//工具函数区域
/**
 * 复制，主要是可以从虚拟路径复制，不依赖系统复制命令,通过write(read(file)) 功能继承自fse.copy
 * @param src 源地址
 * @param dest 目的地址
 */
export async function innerCopy(src: string, dest: string) {
    let info = await fse.lstat(src);
    let copyFile = async (s: string, d: string) => {
        let rd = fse.createReadStream(s);
        let wd = fse.createWriteStream(d);
        return new Promise<void>((r) => {
            wd.addListener("finish", () => {
                // console.log(`复制文件 ${s} 到 ${d}`)
                r();
            });
            rd.pipe(wd);
        });
    };
    if (info.isFile()) {
        await copyFile(src, dest);
    }
    else {
        //目录
        await fse.ensureDir(dest);
        //开始复制目录 遍历src目录树
        let mon = walk.walk(src);
        mon.on("directory", (base, name, next) => {
            // console.log(path.resolve(base,name.name));
            next();
        });
        mon.on("file", async (dirpath, filename, next) => {
            //把文件复制到对应位置 把dirpath和filename合成完整src路径 从中生成dest路径 复制文件
            //不带src路径前缀的目录路径 从1开始截取是为了去掉path前面的/ 以免被认为是从root开始
            let endDirpath = dirpath.slice(src.length).slice(1);
            let allpath = path.resolve(dirpath, filename.name); //源地址
            // console.log(allpath);
            //在allpath中去除src的部分
            let destdir = path.resolve(dest, endDirpath); //目的目录地址
            let destpath = path.resolve(destdir, filename.name); //目的文件地址
            console.log(dest, endDirpath, destdir);
            await fse.ensureDir(destdir);
            //复制文件
            await copyFile(allpath, destpath);
            next();
        });
        return new Promise<void>((resolve) => {
            mon.on("end", () => resolve());
        });
    }
}

/**
 * 从path获取服务器的url
 * @param fpath 文件path
 * @param baseurl 服务器的baseurl，在config中定义
 */
export function getUrlFromPath(fpath:string,baseurl:string="/"){
    let url= path.relative(".",fpath).replace(/\\/g,"/").trim();
    url=path.posix.resolve(baseurl,url).trim();
    return url;
}

/**
 * 对path进行同构映射
 * @param srcpath 源地址，比如文件地址
 * @param base 源地址的base目录，可以是任何一级
 * @param newbase 用于替换的新base
 */
export function pathMap(srcpath:string,base:string,newbase:string){
    const rel=path.relative(base,srcpath);
    const npath=path.resolve(newbase,rel);
    return npath;
}


///高阶函数区域

import * as equal from "fast-deep-equal"
import * as ld from 'lodash';
import { assert } from 'console';
/**
 * 包装函数，在参数与上次相同时返回上一次结果不调用函数
 * 注意为了提高性能，本函数并不对result进行deepClone缓存，返回值不可修改否则将破坏一致性
 * @param args 参数
 */
export function cached<T extends any[],R>(func:(...args:T)=>R):(...args:T)=>Readonly<R>{
    let hascalled=false;
    let oldresult=null;
    let oldargs=null;
    return (...args:T)=>{
        if(!hascalled||oldargs!==args||!equal(args,oldargs))
        {
            oldresult=func(...args);
            oldargs=ld.cloneDeep(args);
            return oldresult;
        }

    }

}

/**
 * 包装函数，让同一参数只调用一次函数
 * 注意由于技术所限本函数不会像cached一样进行deepClone和deepEqual比较
 * 注意为了提高性能，本函数并不对result进行deepClone缓存，返回值不可修改否则将破坏一致性
 * @param func 要包装的函数
 */
export function mapCached<T extends any[],R>(func:(...args:T)=>R):(...args:T)=>Readonly<R>{
    let args_resultMap=new Map<T,R>();
    return (...args:T)=>{
        if(args_resultMap.has(args)){
            return args_resultMap.get(args);
        }
        else{
            let res=func(...args);
            args_resultMap.set(args,res);
            return res;
        }
    }
}


