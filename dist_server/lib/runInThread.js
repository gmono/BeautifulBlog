"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const thread = require("worker_threads");
const rxjs_1 = require("rxjs");
const ld = require("lodash");
/**
 * 转换worker为扩展worker 允许双向通信
 * @param worker 要转换的worker
 */
function transToExtraWorker(worker) {
    //转换为扩展worker
    let ret = worker;
    ret.onMessage = (type, cbk) => {
        worker.addListener("message", (msg) => {
            if (msg.type == type) {
                cbk(msg.data);
            }
        });
    };
    ret.onceMessage = (type) => {
        return new Promise((resolve) => {
            worker.once("message", (msg) => {
                if (msg.type == type) {
                    resolve(msg.data);
                }
            });
        });
    };
    ret.MessagePump = (type) => {
        let sub = new rxjs_1.Subject();
        ret.onMessage(type, (data) => sub.next(data));
        return sub;
    };
    return ret;
}
/**
 * 在新线程里运行一个函数 返回worker
 * @param func 函数
 * @param args 参数
 * @param namedObjects 全局命名对象列表(不能包含函数)
 */
function runFunction(modpath, namedObjects, libFuncs, func, ...args) {
    let rel = modpath.replace(/\\/g, "/") + "/";
    let libstr = ld.map(libFuncs, (value, key, col) => {
        return `const ${key}=${value.toString()};`;
    });
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
    `, { eval: true, workerData: { namedObjects,
            args } });
    return transToExtraWorker(worker);
}
exports.runFunction = runFunction;
//# sourceMappingURL=runInThread.js.map