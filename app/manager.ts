/**
 * 用于管理博客
 * 包括但不限于：
 * 1. 配置远程git仓库地址（增删改查）
 * 2. 提交博客到git仓库（确保自动生成最新 只提交content到远端 ）
 * 3. 控制版本，允许方便的提交更改 退回和版本选择
 * 
 * git本地仓库包括全部文件防止信息丢失
 * git远端仓库原则上只包括 index.html nowSite content 三个目录
 * 
 * 未来考虑添加articles目录独立配置远端仓库功能（以防止articles丢失）
 */
type RemoteItem={name:string,url:string};
export async function getRemoteList():Promise<RemoteItem[]>{
    return Promise.all((await getNames()).map(v=>getRemote(v)));
}
let lst={
    "测试":"http://helloworld",
    "hello":"http://baidu.com"
};
import * as ld from "lodash"
export async function getNames(){
    return ld.keys(lst);
}
//临时如此 实际使用时类型为
export async function getRemote(name:string):Promise<RemoteItem>{
    
    return {name:name,url:lst[name]};
}



/**
 * 显示所有可用的RemoteItem
 */
export async function listRemote(){
    console.log("发布地址列表:");
    (await getRemoteList()).forEach(v=>{
        console.log(`Name:${v.name} URL:${v.url}`);
    })
}
export async function addRemote(name:string,url:string){

}
export async function removeRemote(name:string){

}
export async function pushToRemote(name?:string){
    let push=async (url)=>{
        //提交到url
        
    }
    if(name!=null){
        await push((await getRemote(name)).url);
        console.log(`成功提交到:${name}`)
    }
    else{
        //提交到所有
        (await getRemoteList()).map(v=>({name:v.name,res:push(v.url)})).forEach(async v=>{
            await v.res;
            console.log(`成功提交到:${v.name}`);
        });
    }
}