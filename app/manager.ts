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
 * 列出所有仓库
 */
export async function listRemote(){
    console.log("发布地址列表:");
    (await getRemoteList()).forEach(v=>{
        console.log(`Name:${v.name} URL:${v.url}`);
    })
}

export async function pushToRemote(name?:string){
    let push=async (name)=>{
        //提交到url
        
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