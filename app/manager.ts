/**
 * 用于管理博客
 * 注意：本程序用于增强和添加针对blog的git功能，而不替代git功能
 * // * 配置远程git仓库地址（增删改查）
 * * 列出所有仓库
 * * 提交blog到远端，允许选择提交的仓库，在提交之前自动使用同名配置文件重新生成内容
 *    *自动添加文件，生成commit记录（差异记录包括修改 添加删除记录），自动创建commit并提交，
 *    * 选择性add，不提交articles
 * * 为articles单独配置git
 * * back 和 forward 命令，允许向前前进和后退版本，与此相应的有对git log的封装
 * 
 * git本地仓库包括全部文件防止信息丢失
 * git远端仓库原则上只包括 index.html nowSite content 三个目录
 * 
 * 未来考虑添加articles目录独立配置远端仓库功能（以防止articles丢失）
 */
//其中name为git remote仓库名  url为git仓库，此处由于使用git url只做展示用
type RemoteItem={name:string,url:string};
import * as ld from "lodash"
import * as execa from 'execa';
import { fork } from 'child_process';
import generate from './generator';
import changesite from './changesite';
import * as fse from 'fs-extra';
import * as path from 'path';
import { readConfig,runInDir, innerCopy } from './lib/utils';

///基本功能函数部分

///获取信息系列 包括获取仓库url和名字等
export async function getNames(){
    //执行git remote
    //all表示要手机process的所有输出
    let res=await execa("git remote",{all:true});
    let output=res.all;
    return output.trim().split("\n").map(v=>v.trim());
}
//临时如此 实际使用时类型为
export async function getRemote(name:string):Promise<RemoteItem>{
    //执行 git remote 和 git remote get-url
    return {
        name:name,
        url:(await execa(`git remote get-url ${name}`,{all:true})).all
    }
}
export async function getRemoteList():Promise<RemoteItem[]>{
    let names=getNames();
    let res=(await names).map(v=>getRemote(v))
    return Promise.all(res);
}

/**
 * 用于生成提交说明
 */
async function getChangeInfoText(){
    //获取更改信息文本 主要用于合成提交消息
    //这里需要generator和watch等程序做log操作 因此这里展示只返回固定的消息
    return "更新文章";
}




///操作函数部分
/**
 * 用于初始化一个blog的git相关内容
 * 包括 创建仓库 初次提交和push（包括设置trach branch)  创建.gitignore 
 * 此函数执行后blog才可以进行后续manage操作
 * 仅对独立blog目录使用
 * 对于主仓库（即直接clone下来的包含blog和代码的仓库）请勿使用此函数（可能会破坏原有仓库结构）
 * @param dirpath 独立blog目录的路径
 */
export async function initGit(dirpath:string){
    console.log("开始创建git仓库");
    //创建git仓库
    await runInDir(dirpath,async ()=>{
        // console.log(process.cwd())
        await execa("git init",{
            stdio:"inherit",
        });
        //复制gitginore模板到blog目录的.gitignore文件
        await innerCopy(path.resolve(__dirname,"../static/template_gitignore.txt"),"./.gitignore");
        await execa("git add .",{stdio:"inherit"});
        await execa(`git commit -m "创建博客" `,{stdio:"inherit"});
    });
    console.log("创建完毕")
}

/**
 * 提交到某个仓库，假定不是初次提交（初次提交可能需要输入用户名密码和设置跟踪分支）
 * @param name 要提交到的仓库
 */
export async function pushToRepos(name:string){
    //读取配置文件保存的用户名和密码并提交
    //提交到某个仓库 generate changesite add commit push 一条龙
        //自动读取名称相同的配置文件
        await generate(name)
        const config=await readConfig(name);
        await changesite(config.site);
        //add 由于存在默认的.gitignore 会自动跳过添加articles sites config目录
        await execa("git add .");
        //合成提交消息
        await execa(`git commit -m "${await getChangeInfoText()}"`);
        //此处只提供提交到master分支 假设已经设置了trach branch
        await execa(`git push ${name} master`)
}


/**
 * 只能在initGit之后调用
 * 代理git remote add的功能，增加自动进行初次提交(假设远端为空仓库) 自动保存提交用用户名密码的功能
 * 确保后续工作进行并确保远端仓库与本地一致（如果远端仓库与本地冲突则自动解决冲突）
 * @param reposname 仓库名
 * @param giturl remote url
 */
export async function addRepos(reposname:string,giturl:URL){
    //指定git指令添加仓库，并进行初次提交
    //目前的冲突解决策略是直接放弃显示失败，因此务必保持remote仓库为空
    await execa(`git remote add ${reposname} ${giturl}`)
    //初次提交 目前只支持master分支不支持自定义分支指定
    await execa(`git push -u ${reposname} master`)
}
/**
 * 代理移除仓库的功能
 * @param reposname 仓库名
 */
export async function removeRepos(reposname:string){
    await execa(`git remove ${reposname}`);
}



///用户接口部分

/**
 * 用户接口，列出所有仓库
 */
export async function listRemote(){
    console.log("发布地址列表:");
    (await getRemoteList()).forEach(v=>{
        console.log(`Name:${v.name} URL:${v.url}`);
    })

    
/**
 * 用户接口，提交到某个仓库   
 * @param name 仓库名，如果不提供则提交到所有仓库
 */
export async function pushToRemote(name?:string){
    if(name!=null){
        //提交到单个仓库
        await pushToRepos((await getRemote(name)).url);
        console.log(`成功提交到:${name}`)
    }
    else{
        //提交到所有仓库
        (await getRemoteList()).map(v=>({name:v.name,res:pushToRepos(v.url)})).forEach(async v=>{
            await v.res;
            console.log(`成功提交到:${v.name}`);
        });
    }
}

import * as prompt from "prompts"
/**
 * 用户接口 添加仓库 提示输入名字和url
 */
export async function add()
{
    
}