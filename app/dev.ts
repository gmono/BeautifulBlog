/**
 * 开发服务器 启动根目录的tsconfig.json 编译app目录的程序文件到dist_server
 *            启动Helper目录的tsconfig.json  编译Helper目录的浏览器帮助模块到 app/Helper/helpers.js 
 *            启动指定配置文件指定的网站的tsconfig.json 编译其中的ts文件到js
 *            启动 yarn blog server 实时监控内容变化同步到content目录，同时实时监控配置文件配置的site目录的改动并同步到nowSite
 * 开发服务器主要用于本项目本身编写时用，若是终端用户请直接使用yarn blog server
 */



 import * as cluster from "cluster"
import { spawn, exec, execSync, fork } from "child_process";
 /**
  * 启动tsc -w 来监视一个目录的ts文件实时编译
  * @param dirpath 要监控的目录
  */
 function tscWatch(name:string,dirpath:string)
 {
     //需要调查detached在false时，有监听事件时，会不会被自动结束的问题
     let child=spawn("tsc",["-w"],{
         stdio:"pipe",
         cwd:dirpath,
         detached:false
     });
     child.stdout.on("data",(chunk)=>{
         console.log(`${name}输出:`,chunk);
     })
     child.stderr.on("data",(c)=>{
         console.log(`${name}错误:`,c);
     })
 }

