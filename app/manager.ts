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
import { readConfig,runInDir } from './lib/utils';
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


async function getChangeInfoText(){
    //获取更改信息文本 主要用于合成提交消息
    //这里需要generator和watch等程序做log操作 因此这里展示只返回固定的消息
    return "更新文章";
}


/**
 * 列出所有仓库
 */
export async function listRemote(){
    console.log("发布地址列表:");
    (await getRemoteList()).forEach(v=>{
        console.log(`Name:${v.name} URL:${v.url}`);
    })
}


/**
 * 用于初始化一个blog的git相关内容
 * 包括 创建仓库 初次提交和push（包括设置trach branch)  创建.gitignore 
 * 此函数执行后blog才可以进行后续manage操作
 */
export async function initGit(dirpath:string){
    console.log("开始创建git仓库");
    //创建git仓库
    await runInDir(dirpath,async ()=>{
        // console.log(process.cwd())
        await execa("git init",{
            stdio:"inherit",
        });
        ////此处需要添加复制.gitignore的操作
        await execa("git add .",{stdio:"inherit"});
        await execa(`git commit -m "创建博客" `,{stdio:"inherit"});
        ////此处需要添加初次提交操作
    });
    console.log("创建完毕")
}
/**
 * 提交到某个仓库   
 * @param name 仓库名
 */
export async function pushToRemote(name?:string){
    let push=async (name)=>{
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
    if(name!=null){
        //提交到单个仓库
        await push((await getRemote(name)).url);
        console.log(`成功提交到:${name}`)
    }
    else{
        //提交到所有仓库
        (await getRemoteList()).map(v=>({name:v.name,res:push(v.url)})).forEach(async v=>{
            await v.res;
            console.log(`成功提交到:${v.name}`);
        });
    }
}