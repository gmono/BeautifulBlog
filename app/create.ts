import * as fse from 'fs-extra';
import * as path from "path"
import async from './watch';
/**
 * 专门处理各种创建操作
 * 包括但不限于：
 *  创建文章
 *  创建子目录
 *  创建标签（未来支持）
 *  创建版本（未来支持）
 */

//把一个第一个参数接收路径的函数转换为第一个参数接收目录列表的函数
let makeToClassBase=<T>(func:(tp:string,...args)=>T)=>{
    return (classes:string[],...args)=>{
        //合成路径
        let p=path.resolve("./articles",...classes);
        return func(p,...args);
    }
}
 /**
  * 在指定目录中创建一个文章
  * @param basepath 要创建的文章的目录
  * @param title 文章标题 同名则报错
  */
export async function createArticle(basepath:string,title:string){
    //生成文件名
    let filename=`${title}.md`;
    let p=path.resolve(basepath,filename);
    if(await fse.pathExists(p)){
        throw new Error(`错误，目录${basepath}存在同名文章`);
    }
    //标准模板
    let templateContent=`---
title: "${title}"
date: ${JSON.stringify(new Date())}
draft: true
---
    `
    //创建文件
    await fse.writeFile(p,templateContent);
    console.log(`创建文章完成，文章路径:${p}`)
}


/**
 * 在一个文件夹中创建一个子类（一个子文件夹）
 * @param basepath 要在其中创建Class（子文件夹）的目录
 * @param name class名称
 */
export async function createClass(basepath:string,name:string){
    let p=path.resolve(basepath,name);
    if(await fse.pathExists(p)){
        throw new Error("错误，子类已存在");
    }
    await fse.mkdir(p);
    console.log(`创建子类完成，子类文件夹路径:${p}`)
}


export async function createVersion(basepath:string,name:string){
    throw new Error("尚未实现此功能");
}
export async function createTag(basepath:string,name:string){
    throw new Error("尚未实现此功能");
}

//使用类序列而非地址来工作的函数
//所有函数除第一个参数为一个string[] 表示classes（逐级下降）外，其余参数与原始函数相同
export let createArticleByClasses=makeToClassBase(createArticle);
export let createClassByClasses=makeToClassBase(createClass);
export let createVersionByClasses=makeToClassBase(createVersion);
export let createTagByClass=makeToClassBase(createTag);

if(require.main==module){
    console.log("本程序不支持直接运行,请在程序中引用");
}

