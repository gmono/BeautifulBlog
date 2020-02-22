import * as thread from "worker_threads"


/**
 * 在新线程里运行一个函数 返回worker
 * @param func 函数
 * @param args 参数
 */
export function runFunction(modpath:string,func: (context:IThreadContext,...args) => any, ...args) {
    let rel = modpath.replace(/\\/g, "/") + "/";
    let worker = new thread.Worker(`
        let __argv=require('worker_threads').workerData;
        class ThreadContext{
            localRequire(mod){
                return require("${rel}"+mod)
            }
        }
        const __context=new ThreadContext();
        let __func=${func.toString()}
        __func(__context,...__argv);
    `, { eval: true, workerData: args });
    return worker;
}

export interface IThreadContext{
    localRequire<T>(mod:string):T;
}
