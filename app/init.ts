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
            wd.addListener("finish",()=>{
                console.log(`复制文件 ${s} 到 ${d}`)
                r();
            })
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
            //不带src路径前缀的目录路径
            let endDirpath=dirpath.slice(src.length);
            let allpath=path.resolve(dirpath,filename.name); //源地址
            //在allpath中去除src的部分
            let destdir=path.resolve(dest,endDirpath); //目的目录地址
            let destpath=path.resolve(destdir,filename.name);//目的文件地址
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

async function runInDir(dirpath:string,func:Function){
    const s=process.cwd()
    process.chdir(dirpath);
    await func();
    process.chdir(s);
}
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
        innerCopy(`${__dirname}/../index.html`,`${dirpath}/index.html`)
    ]);
    console.log("文件复制完毕");
    console.log("开始创建git仓库");
    //创建git仓库
    await runInDir(dirpath,async ()=>{
        // console.log(process.cwd())
        await execa("git init",{
            stdio:"inherit",
        });
        await execa("git add .",{stdio:"inherit"});
        await execa(`git commit -m "创建博客" `,{stdio:"inherit"});
    });
    console.log("创建完毕")
    

}

if(require.main==module){
    createBlog("./tst",true,true);
}