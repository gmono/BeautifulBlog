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
import dev from "./dev";
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


pro.command("generate [configname] [verbose]")
    .description("执行生成器程序(verbose 可选择v和verbose 不填默认不显示生成详情)")
    .action(async (config?:string,verbose?:string)=>{
        let v=verbose=="v"||verbose=="verbose";
        await generate(config,v);
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
pro.command("server [port] [configname]")
.description("启动开发服务器(指定端口与配置文件）")
.action(async (port:string="8080",configname="default")=>{
    let p=parseInt(port);
    await serve(p,configname);
});

pro.command("refresh [configname]")
    .description("刷新，切换网站并重新生成内容，相当于changesite与generate的组合")
    .action(async (configname="default")=>{
        await sitegen(configname);
    });
pro.command("dev")
    .description("启动开发监视器（主要用于开发者 开发blog程序和helpers),监视app与helpers目录并实时生成js")
    .action(async ()=>{
        await dev();
    })
pro.command("help").description("输出帮助").action(()=>pro.outputHelp());

pro.parseAsync(process.argv);