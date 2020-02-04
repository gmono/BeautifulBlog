/**
 * 开发服务器 启动根目录的tsconfig.json 编译app目录的程序文件到dist_server
 *            启动Helper目录的tsconfig.json  编译Helper目录的浏览器帮助模块到 app/Helper/helpers.js 
 *            启动指定配置文件指定的网站的tsconfig.json 编译其中的ts文件到js
 *            启动 yarn blog server 实时监控内容变化同步到content目录，同时实时监控配置文件配置的site目录的改动并同步到nowSite
 * 开发服务器主要用于本项目本身编写时用，若是终端用户请直接使用yarn blog server
 */



 import * as cluster from "cluster"
import { spawn, exec, execSync, fork, ChildProcess } from "child_process";
import { IConfig } from "./Interface/IConfig";


const tscCompileOK=(outcontent:string)=>outcontent.indexOf("Compilation complete. Watching for file changes")!=-1;
//出错信息
interface ErrorInfo
{
    errorCode:number;
    errorDesc:string;
    //以此为基础合并
    errorFile:string;
    //位置表 行 列
    errorPoints:[number,number][];
}
import * as ld from "lodash"

const tscCompileError=(outcontent:string)=>{
    //tsc编译器编译出错的情况
    //扫描并检测每行，记录所有错误和错误位置 错误号与 错误表述
    let errorlines=outcontent.split("\n").filter((line:string)=>(line.indexOf("error TS")!=-1));
    if(errorlines.length==0) return null;
    //提取每个错误行的信息
    let errors=errorlines.map((line,i)=>{
        //把每行转换为一个对象 
        let regex=/(.*)\((\d+),(\d+)\):\s*error\sTS(\d+):(.+)/;
        //1:文件 2:行 3 列 4 错误号 5 错误描述
        let result=line.match(regex);
        let info={
            errorCode:parseInt(result[4]),
            errorDesc:result[5],
            errorFile:result[1],
            errorPoints:[
                [parseInt(result[2]),parseInt(result[3])]
            ]
        } as ErrorInfo;
        return info;
    })
    //合并操作 合并errorFile相同的info对象
    //此处需要groupBy函数 
    let conErrors=ld.groupBy(errors,(e)=>e.errorFile);
    //进行融合
    let result=ld.reduce(conErrors,(result,value,key)=>{
        //此处融合errorinfo列表为一个
        let allpoints=value.map((v)=>v.errorPoints).flat();
        //生成唯一的info
        let info=ld.cloneDeep(value[0]);
        info.errorPoints=allpoints;
        //把融合的info加入结果数组
        result.push(info);
        return result;
    },[] as ErrorInfo[])
    return result;
}
 /**
  * 启动tsc -w 来监视一个目录的ts文件实时编译
  * @param dirpath 要监控的目录
  */
 async function tscWatch(name:string,dirpath:string)
 {
     //需要调查detached在false时，有监听事件时，会不会被自动结束的问题
     let child=exec("tsc -w",{
         cwd:dirpath
     },(error,stdout,stderr)=>{
         if(error!=null){
             console.log(`${name}输出:`,stdout);
             console.log(`${name}ERROR:`,stderr)
         }
     });
     console.log(`[${name}] `,"已启动,正在等待完成......");
     ///此处等待Subject实现（rxjs）
     return new Promise<ChildProcess>((resolve)=>{
         //等待输出编译完成后返回
        child.stdout.on("data",(chunk:string)=>{
            //每次重新编译都会触发此检测
            //检测错误
            let errors=tscCompileError(chunk);
            if(errors!=null){
                //输出错误
                errors.forEach((v)=>{
                    //此处考虑追加输出行列
                    console.error(`[${name}] `,`错误 ${v.errorCode}:${v.errorDesc}`);
                })
            }
            if(tscCompileOK(chunk)){
                //表示已经启动监视
                console.log(`[${name}] `,"编译完成");
                //实际返回
                resolve(child);
            }
            
        })
        child.stderr.on("data",(c)=>{
            console.log(`[${name}] `,`错误:`,c);
        })
        child.on("close",(code,signal)=>{
            console.log(`[${name}] `,"已退出",`退出代码${code}`);
        })
     })
     

 }

 /**
  * 启动开发监视器，进行自动项目编译部署
  * @param configname 主要用于确定“当前网站”  并对网站目录启动监视（目前为单一的tsc监视)
  */
export default async function dev(configname="default")
{
    console.log("正在启动处理进程......");
    let config=require(`../config/${configname}.json`) as IConfig;
    let sitename=config.site;
    //考虑抽离此函数作为公共工具函数
    let getsitepath=(sitename:string)=>`./sites/${sitename}`;
    let childs=await Promise.all([
        tscWatch("App ts监视器","."),
        tscWatch("Helper ts监视器","./app/Helper"),
        tscWatch(`当前网站[${sitename}]`,getsitepath(sitename))
    ]);
    //等待所有任务结束 或输入q 结束所有进程
    console.log("输入ctrl+c结束所有监视任务");
}

if(require.main==module){
    dev()
}
