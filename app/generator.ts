//文件生成器

//遍历articles目录 生成content目录的文章文件
//每个文章一个html内容文件和一个json信息文件（从frontmatter提取）
//content根目录有files.json 生成，保存网站的配置信息，和所有文章的索引
import * as walk from "walk"
import * as path from "path"
/*
 * 获取文件名 path.basename
 * 获取目录名 path.dirname
 * 获取完整信息 path.parse:{
 * root dir base ext name
 * }
 * 获取路径中除了最前面的目录的路径: getRel(path)
 * ./a/b/c->b/c
 */

function getRel(p:string){
    //得到相对于第一个目录的相对路径
    let ar=p.replace("\\","/").split("/").filter((v)=>v!=".").slice(1);
    let np=ar.join("/");
    // console.log(np);
    return np;
    //从 ./a/b/c ->b/c
}
/**
 * 获取contentdir的对应路径  ./a/b->{content}/b
 * @param p 原始articles目录的路径
 * @param content content目录的路径
 */
function getContentPath(p:string,content:string){
    let np=getRel(p);
    np=np!=""?`${content}/${np}`:content;
    return np;
}


/**
 * 获取相对于content目录的路径 {content}=./content
 * @param root 基础路径
 * @param filestat 文件
 */
function getContentFile(root:string,filestat:walk.WalkStats){
    //从文件信息中得到相对于content的文件完整路径
    //合成文件路径
    let apath=`${root}/${filestat.name}`;
    //获取相对于content的路径
    let cpath=getContentPath(apath,"./content");
    return cpath;
}
/**
 * 修改一个路径的扩展名并返回
 * @param fpath 文件路径
 * @param ext 扩展名 .xxx
 */
function changeExt(fpath:string,ext:string=".html"){
    let obj=path.parse(fpath);
    obj.ext=ext;
    obj.base=obj.name+obj.ext;
    let npath=path.format(obj);
    return npath;
}
/**
 * 替换content=./articles
 */
function getArticleFile(root:string,filestat:walk.WalkStats){
    //从文件信息中得到相对于content的文件完整路径
    //合成文件路径
    let apath=`${root}/${filestat.name}`;
    //获取相对于content的路径
    let cpath=getContentPath(apath,"./articles");
    return cpath;
}

function getUrlFile(root:string,filestat:walk.WalkStats){
    let url=`${root}/${filestat.name}`;
    let baseu=config.base_url=="/"? "":config.base_url;
    let prefix=baseu+"/content";//相对前缀
    url=getContentPath(url,prefix);
    return url;

}

/**
 * 用法 articles_path|content_path|url_path -> 
 * getContentFile:相对于content目录的路径
 * getArticleFile:相对于articles目录的路径
 * getUrlFile:相对于base_url的路径（可直接做为网站链接）
 */

import transform from "./transform";
import * as fs from "fs"
import * as ensurePath from '@wrote/ensure-path'
import { IArticleMeta } from './Interface/IArticleMeta';
import { IContentMeta } from './Interface/IContentMeta';

import * as format from "dateformat"
import { IConfig } from "./Interface/IConfig";

/**
 * 
 * @param articlemeta 元信息
 * @param from_dir 来源目录 为完整的article base目录（不包括文件名）
 * @param html 内容字符串
 * @param text 文章原文
 */
function getContentMeta(articlemeta:IArticleMeta,from_dir:string,html:string,text:string){
    //从文章信息提取得到内容附加信息
    //去掉最前面的 ./articles
    from_dir=getRel(from_dir);
    let cmeta=JSON.parse(JSON.stringify(articlemeta)) as IContentMeta;
    cmeta.from_dir=from_dir.split("/");
    cmeta.article_length=text.length;
    cmeta.content_length=html.length;
    return cmeta;
}
const config=require("./config.json") as IConfig;
// console.log(ensurePath)
//ensurePath(string)->Promise
async function main()
{
    
    //主函数
    let walker=walk.walk("./articles");
    //文件表 key:元数据路径  value:文章标题  key相对于content目录 后期考虑换为 相对于base_url的路径
    let files:{[index:string]:string}={};
    //得到文件
    walker.on("file",async (base,name,next)=>{
        let articlepath=getArticleFile(base,name);
        let contentpath=getContentFile(base,name);
        contentpath=changeExt(contentpath);
        console.log(articlepath,contentpath);
        
        //开始转换
        let {html,meta,text}=await transform(articlepath);
        //得到contentmeta
        let cmeta=getContentMeta(meta,base,html,text);
        //输出转换进度
        console.log(`文章:${meta.title}\n转换${articlepath}到${contentpath}`)
        await ensurePath(contentpath);
        fs.writeFile(contentpath,html,(e)=>{
            e&&console.log(e);
        });
        //写入文章元文件
        let confpath=changeExt(contentpath,".json");
        fs.writeFile(confpath,JSON.stringify(cmeta),(e)=>{
            e&&console.log(e);
        });
        //记录文章记录到files.json 修bug 替换//
        let url=getUrlFile(base,name);
        files[url]=cmeta.title;
        
        next();
    });
    walker.on("end",()=>{
        //写入files.json
        fs.writeFile("./content/files.json",JSON.stringify(files),(e)=>{
            e&&console.log(e);
        })
    })
    
}
if(require.main==module){
    main()
}
export default main;
