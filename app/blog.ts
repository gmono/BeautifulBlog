/**
 * 总和程序 通过commander构建   
 */

import * as pro from "commander";
import transform,{transformFile} from './transform';

import * as path from "path-extra"

import * as fs from "fs-extra"
import generate from "./generator"
import changesite from "./changesite";
import sitegen from "./sitegen"
import sync from "./sync";
import dev from "./dev";
import { createArticle, createClass } from "./create";
import { exec, fork } from "child_process";
import watchArticles from "./watch";
import { createBlog } from "./init";
import { listRemote,  pushUp, add, remove, pushToRepos } from "./manager";
pro.command("transform <filename> [dest]")
    .description("执行转换器程序")
    .action(async (filename:string,dest?:string)=>{
        //生成输出文件名
        dest||(dest=filename);
        await transformFile(filename,dest);
        console.log("转换完成");
    });


pro.command("generate [configname] [refresh] [verbose]")
    .description("执行生成器程序(verbose 可选择v和verbose 不填默认不显示生成详情)")
    .action(async (config?:string,refresh:"y"|"n"="n",verbose?:string)=>{
        let v=verbose=="v"||verbose=="verbose";
        let r=refresh=="y";
        await generate(config,v,r);
    });


pro.command("changesite [sitename]")
    .description("切换网站")
    .action(async (sitename:string="default")=>{
        await changesite(sitename);
    });

//并不等同于watch程序（watch程序中有监视articles目录和sites目录的函数）
pro.command("watch [configname]")
    .description("监视文件改动并实时生成")
    .action(async (configname?:string)=>{
        console.log("正在监视文章改动......");
        await watchArticles(configname);
    });
pro.command("sync  [configname] [port]")
.description("启动开发服务器(指定端口与配置文件）")
.action(async (configname="default",port:string=null)=>{
    if(port==null) await sync(null,configname);
    else{
        let p=parseInt(port);
        await sync(p,configname);
    }
});

pro.command("refresh [configname]")
    .description("刷新，切换网站并重新生成内容，相当于changesite与generate的组合")
    .action(async (configname="default")=>{
        await sitegen(configname);
    });

/**
 * 其中usesync 为n时 configname只用于选取要监视的网站(编译并自动复制到nowSite) usesync为y时，configname还用于给
 * sync程序指定配置文件（用于生成内容）
 */
pro.command("dev [configname] [usesync] [serverport]")
    .description("启动开发用自动编译器（开发时专用),usesync=y|n （y等同于自动执行sync命令）")
    .action(async (configname:string="default",useserver:"y"|"n"="y",serverport="8080")=>{
        await dev(configname);
        //考虑在此处启动开发服务器实现自动同步site和自动生成content 以提供完整的开发体验
        if(useserver=="y"){
            console.log("正在启动同步程序...");
            let p=parseInt(serverport);
            let c= fork(`${__dirname}/blog.js`, ["sync",configname,serverport],{
                stdio:"pipe"
            });
            c.stdout.on("data",(str:Buffer)=>{
                console.log("[同步程序] ",str.toString());
            });
        }
    })

import * as ph from "path"
import * as execa from 'execa';
import { createConfig, deleteConfig, useConfig } from "./config";
//new命令与create程序对应
pro.command("new <type> <path> <name> ")
    .description("创建文章或子类 type: a 文章 c 子类 ")
    .action(async (type:"a"|"c",p:string,name:string)=>{
        //合成相对于articles的地址
        
        let basepath=ph.resolve("./articles",p);
        switch(type){
            case "a":
                await createArticle(basepath,name);
                break;
            case "c":
                await createClass(basepath,name);
                break;
            default:
                console.warn("不存在此创建类型");
                break;
        }
    });
pro.command("init <dir> [autoCreateDir]")
    .description("初始化一个目录作为Blog,autoCreateDir指定是否自动创建目录(如果不存在)")
    .action(async (dirpath:string,autocreate:string="y")=>{
        let auto=autocreate=="y";
        createBlog(dirpath,auto);
    });
pro.command("manage <cmd> [p1] [p2]").description("管理博客 cmd=list|add|remove|push,p1为name,p2为url")
    .action(async (cmd:string,p1:string,p2:string)=>{
        let cmds={
            list(){
                listRemote();
            },
            push(){
                if(p1!=null)
                    pushToRepos(p1);
                else pushUp();
            },
            add(){
                add()
            },
            remove(){
                remove()
            }
        }
        cmds[cmd]();
    })

pro.command("config <cmd> <target> [target2]").description("管理配置文件").action((async (cmd:string,target:string,target2:string)=>{
    let cmds={
        add(target:string,target2:string,...args){
            return createConfig(target2,target)
        },
        del(target:string,...args){
            return deleteConfig(target)
        },
        use(target:string,...args){
            return useConfig(target);
        }
    }
    if(cmd in cmds==false) {console.log("命令错误");return;}
    await cmds[cmd](...[target,target2]);
}))
pro.command("help").description("输出帮助").action(()=>pro.outputHelp());

pro.parseAsync(process.argv);

// console.log("hhhh");