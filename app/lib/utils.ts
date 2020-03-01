import * as fse from 'fs-extra';
import { IConfig } from '../Interface/IConfig';
import path = require("path");
import * as walk from "walk"
import { IGlobalConfig } from '../Interface/IGlobalConfig';

export function readConfig(name:string){
    return fse.readJson(path.resolve(__dirname,`../../config/${name}.json`)) as Promise<IConfig>;
}
export function readGlobalConfig(){
    //读取全局配置文件
    return fse.readJSON(path.resolve(__dirname,"../../global.json")) as Promise<IGlobalConfig>;
}

export async function runInDir(dirpath:string,func:Function){
    const s=process.cwd()
    process.chdir(dirpath);
    await func();
    process.chdir(s);
}

/**
 * 修改一个路径的扩展名并返回(原文件名无扩展名也可使用)
 * @param fpath 文件路径
 * @param ext 扩展名 .xxx
 */
export function changeExt(fpath:string,ext:string=".html"){
    let obj=path.parse(fpath);
    obj.ext=ext;
    obj.base=obj.name+obj.ext;
    let npath=path.format(obj);
    npath=npath.replace(/\\/g,"/");
    return npath;
}

//工具函数区域
/**
 * 复制，通过write(read(file)) 功能继承自fse.copy
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