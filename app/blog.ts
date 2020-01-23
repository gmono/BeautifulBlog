/**
 * 总和程序 通过commander构建   
 */

import * as pro from "commander";
import transform from './transform';
import * as path from "path-extra"

import * as fs from "fs-extra"
import generate from "./generator"
import changesite from "./changesite";
import sitegen from "./sitegen"
import serve from "./server";
pro.command("transform <filename> [dest]")
    .description("执行转换器程序")
    .action(async (filename:string,dest?:string)=>{
        let res=await transform(filename);
        //生成输出文件名
        dest||(dest=filename);
        let hpath=path.replaceExt(dest,".html");
        let mpath=path.replaceExt(dest,".json");
        await Promise.all([fs.writeFile(hpath,res.html),
                            fs.writeFile(mpath,res.meta)]);
        console.log("转换完成");
    });


pro.command("generate [configname]")
    .description("执行生成器程序")
    .action(async (config?:string)=>{
        await generate(config);
    });

pro.command("changesite [sitename]")
    .description("切换网站")
    .action(async (sitename:string="default")=>{
        await changesite(sitename);
    });
pro.command("watch [configname]")
    .description("监视文件改动并实时生成")
    .action(async (configname?:string)=>{
        await sitegen(configname);
    });
pro.command("server [port]")
.description("启动开发服务器（未完成）")
.action(async (port:string="8080")=>{
    let p=parseInt(port);
    await serve(p);
});
pro.command("help").description("输出帮助").action(()=>pro.outputHelp());

pro.parseAsync(process.argv);