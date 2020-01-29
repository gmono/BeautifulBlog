/**
 * 开发服务器 启动根目录的tsconfig.json 编译app目录的程序文件到dist_server
 *            启动Helper目录的tsconfig.json  编译Helper目录的浏览器帮助模块到 app/Helper/helpers.js 
 *            启动指定配置文件指定的网站的tsconfig.json 编译其中的ts文件到js
 *            启动 yarn blog server 实时监控内容变化同步到content目录，同时实时监控配置文件配置的site目录的改动并同步到nowSite
 * 开发服务器主要用于本项目本身编写时用，若是终端用户请直接使用yarn blog server
 */



 import * as cluster from "cluster"
import { spawn, exec, execSync } from "child_process";
 /**
  * 启动tsc -w 来监视一个目录的ts文件实时编译
  * @param dirpath 要监控的目录
  */
 function tscWatch(dirpath:string)
 {
     let child=spawn("tsc -w",{
         stdio:"pipe"
     });
     child.on("message",(msg,send)=>{
         //接收到输出
     })
 }