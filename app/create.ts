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
async function createArticle(basepath:string,title:string){
    //生成文件名
    let filename=`${title}.md`;
    let p=path.resolve(basepath,filename);
    if(await fse.pathExists(p)){
        throw new Error(`错误，目录${basepath}存在同名文章`);
    }
    //读取标准模板
    let templateContent=`
---
title: "${title}"
date: ${new Date()}
draft: true
---
    `
    //创建文件
    await fse.writeFile(p,templateContent);
}



async function createClass(basepath:string,name:string){

}
async function createVersion(basepath:string,name:string){

}
async function createTag(basepath:string,name:string){

}
let createArticleByClass=makeToClassBase(createArticle);