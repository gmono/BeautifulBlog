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


//工具函数区域
/**
 * 复制，通过write(read(file)) 功能继承自fse.copy
 * @param src 源地址
 * @param dest 目的地址
 */
async function innerCopy(src:string,dest:string){
    let info=await fse.lstat(src);

    let copyFile=async (s:string,d:string)=>{
        let rd=fse.createReadStream(s);
        let wd=fse.createWriteStream(d);
        return new Promise<void>((r)=>{
            wd.addListener("finish",()=>r())
            rd.pipe(wd);
        });
        
    }
    if(info.isFile())
    {
        await copyFile(src,dest);
    }else{
        //目录
        await fse.ensureDir(dest);
        //开始复制目录 遍历src目录树
        let mon=walk.walk(src);
        mon.on("file",async (dirpath,filename,next)=>{
            //把文件复制到对应位置 把dirpath和filename合成完整src路径 从中生成dest路径 复制文件
            let allpath=path.resolve(dirpath,filename.name);
            //在allpath中去除src的部分
            let endpath=allpath.slice(src.length);
            let destpath=path.resolve(dest,endpath);
            let destdir=path.parse(destpath).dir;
            await fse.ensureDir(destdir);
            //复制文件
            await copyFile(allpath,destpath);
            next();
        });
        return new Promise<void>((resolve)=>{
            mon.on("end",()=>resolve())
        })
    }
    
}

/**
 * 在目录中创建博客
 * @param dirpath 要创建博客的目录
 */
export async function createBlog(dirpath:string,autocreate:boolean=true){
    if(!(await fse.pathExists(dirpath))) 
    if(autocreate) await fse.ensureDir(dirpath);
    else console.warn("目录不存在！");
    
    //当前直接程序创建
    //未来考虑使用模板解压
    await Promise.all([
        mkdir(`${dirpath}/articles`),
        mkdir(`${dirpath}/content`),
        mkdir(`${dirpath}/nowSite`),
        mkdir(`${dirpath}/config`),
        mkdir(`${dirpath}/sites`),
        mkdir(`${dirpath}/assets`)
    ]);
    console.log("目录创建完毕")
    await Promise.all([
        innerCopy(`${__dirname}/../sites/default`,`${dirpath}/sites/default`),
        innerCopy(`${__dirname}/../config/default.json`,`${dirpath}/config/default.json`),
        innerCopy(`${__dirname}/../assets`,`${dirpath}/assets`)
    ]);
    console.log("文件复制完毕");
    console.log("开始创建git仓库");
    //创建git仓库
    await execa("git init",{
        stdio:"inherit"
    });
    await execa("git add .",{stdio:"inherit"});
    console.log("创建完毕")

}

if(require.main==module){
    createBlog(process.argv[2]);
}