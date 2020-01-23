import { IConfig } from './Interface/IConfig';
/**
 * 复制并替换nowSite
 * 假设nowSite中没有任何改动（与sites中的同目录一致）
 * 
 */


 //删除nowSite目录复制spath指向的目录并命名为nowSite
 //删除复制目录树
 import * as _copy from "copy-dir";

 //copy模块的类型
type CopyMod=(from:string,to:string,option:{
    utimes?:boolean|Object,
    mode?:boolean|Number,
    cover?:boolean,
    filter?:boolean|((stat:"file"|"directory"|"symbolicLink",filepath:string,filename:string)=>boolean)
},cbk:(err:any)=>void)=>void;


const copy=_copy as CopyMod;
 import * as del from "del"
import  {mkdir}  from "fs-extra";
import * as path from "path"
async function changesite(sitename:string){
    
    
    let spath=path.resolve("./sites",sitename);
    let dpath="./nowSite"
    console.log(spath,dpath)
    await del(dpath)
    await mkdir(dpath)
    return new Promise<void>((r,j)=>{
        copy(spath,dpath,{
            utimes:true,
            mode:true,
            cover:true
        },(err)=>{
    
            err&&(console.log("切换失败:",err),j(err));
            err||(console.log("切换完成"),r())
        })
    })
    
}
//按照配置的来复制
if(require.main==module){
    let config=require("../config/default.json") as IConfig;
    changesite(config.site);
}

export default changesite;