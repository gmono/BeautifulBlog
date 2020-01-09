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
 * 获取contentdir的对应路径
 * @param p 原始articles目录的路径
 * @param content content目录的路径
 */
function getContentPath(p:string,content:string){
    let np=getRel(p);
    np=`${content}/${np}`;
    return np;
}



function getContentFile(root:string,filestat:walk.WalkStats){
    //从文件信息中得到相对于content的文件完整路径
    //合成文件路径
    let apath=`${root}/${filestat.name}`;
    //获取相对于content的路径
    let cpath=getContentPath(apath,"./content");
    return cpath;
}
function changeExt(fpath:string,ext:string=".html"){
    let obj=path.parse(fpath);
    obj.ext=ext;
    obj.base=obj.name+obj.ext;
    let npath=path.format(obj);
    return npath;
}
function getArticleFile(root:string,filestat:walk.WalkStats){
    //从文件信息中得到相对于content的文件完整路径
    //合成文件路径
    let apath=`${root}/${filestat.name}`;
    //获取相对于content的路径
    let cpath=getContentPath(apath,"./articles");
    return cpath;
}


import transform from "./transform";
import * as fs from "fs"
import * as ensurePath from '@wrote/ensure-path'

console.log(ensurePath)
//ensurePath(string)->Promise
async function main()
{
    //主函数
    let walker=walk.walk("./articles");
    walker.on("file",async (base,names,next)=>{
        let articlepath=getArticleFile(base,names);
        let contentpath=getContentFile(base,names);
        contentpath=changeExt(contentpath);
        console.log(articlepath,contentpath);
        //开始转换
        let html=await transform(articlepath);
        await ensurePath(contentpath);
        fs.writeFile(contentpath,html,(e)=>{
            console.log(e);
        });
        next();
    });
}
main();
