import * as thread from "worker_threads"
import { Observable, Subject } from 'rxjs';
import * as ld from 'lodash';

type InnerType<T extends IMessage<any>>=T extends IMessage<infer S>? S:never;
interface ExtraWorker extends thread.Worker{
    onMessage<MT extends IMessage<any>,DT=InnerType<MT>>(type:string,cbk:(data:DT)=>any);
    onceMessage<MT extends IMessage<any>,DT=InnerType<MT>>(type:string):Promise<DT>;
    MessagePump<MT extends IMessage<any>,DT=InnerType<MT>>(type:string):Observable<DT>;
}
/**
 * 转换worker为扩展worker 允许双向通信
 * @param worker 要转换的worker
 */
function transToExtraWorker(worker:thread.Worker){
    //转换为扩展worker
    let ret=worker as ExtraWorker;
    ret.onMessage=(type:string,cbk:(data:any)=>any)=>{
        worker.addListener("message",(msg:IMessage)=>{
            if(msg.type==type){
                cbk(msg.data);
            }
        });
    }
    ret.onceMessage=(type:string)=>{
        return new Promise<any>((resolve)=>{
            worker.once("message",(msg:IMessage)=>{
                if(msg.type==type){
                    resolve(msg.data);
                }
            })
        })
    }
    ret.MessagePump=(type:string)=>{
        let sub=new Subject<any>();
        ret.onMessage(type,(data)=>sub.next(data));
        return sub;
    }
    return ret;
}
/**
 * 在新线程里运行一个函数 返回worker
 * @param func 函数
 * @param args 参数
 * @param namedObjects 全局命名对象列表(不能包含函数)
 */
export function runFunction(modpath:string,namedObjects:{[idx:string]:any},libFuncs:{[idx:string]:Function},func: (context:IThreadContext,...args) => any, ...args) {
    let rel = modpath.replace(/\\/g, "/") + "/";
    let libstr=ld.map(libFuncs,(value,key,col)=>{
        return `const ${key}=${value.toString()};`
    })
    let worker = new thread.Worker(`
        const __dt=require('worker_threads').workerData;
        const __argv=__dt.args;
        const __parentPort=require('worker_threads').parentPort;
        //全局对象
        Object.assign(global,__dt.namedObjects);
        //库函数
        ${libstr}
        class ThreadContext{
            localRequire(mod){
                return require("${rel}"+mod)
            }
            sendMessage(msg){
                //原名
                // console.log(process)
                __parentPort.postMessage(msg)
            }
            sendMessageOf(type,data){
                this.sendMessage({type,data})
            }
        }
        const __context=new ThreadContext();
        let __func=${func.toString()}
        __func(__context,...__argv);
    `, { eval: true, workerData: {namedObjects,
                                args} });
    return transToExtraWorker(worker);
}

export interface IThreadContext{
    localRequire<T>(mod:string):T;
    sendMessage<DT>(msg:IMessage<DT>);
    sendMessageOf<DT>(type:string,data:DT);
}

export interface IMessage<DT=any>{
    type:string;
    data:DT;
}
