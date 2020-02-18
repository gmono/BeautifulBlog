import { mkdir } from "fs-extra";
import * as execa from "execa"
/**
 * 主要用于在一个目录中创建基本的博客目录结构
 * 功能：
 * 在目录中创建博客
 * 如果目录不存在可自动创建目录（可选）
 */
import * as fse from "fs-extra"

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
        fse.copy(`${__dirname}/../sites/default`,`${dirpath}/sites/default`),
        fse.copy(`${__dirname}/../config/default.json`,`${dirpath}/config/default.json`),
        fse.copy(`${__dirname}/../assets`,`${dirpath}/assets`)
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