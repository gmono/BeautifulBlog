"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runFunction = runFunction;
exports.MakeMessageType = MakeMessageType;
exports.MakeMessageFactory = MakeMessageFactory;
const tslib_1 = require("tslib");
const thread = tslib_1.__importStar(require("worker_threads"));
const rxjs_1 = require("rxjs");
const ld = tslib_1.__importStar(require("lodash"));
function transToExtraWorker(worker) {
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
            const onMessage = (msg) => {
                if (msg.type !== type)
                    return;
                worker.off("message", onMessage);
                resolve(msg.data);
            };
            worker.on("message", onMessage);
        });
    };
    ret.MessagePump = (type) => {
        let sub = new rxjs_1.Subject();
        ret.onMessage(type, (data) => sub.next(data));
        return sub;
    };
    return ret;
}
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
function MakeMessageType(type) {
    return class Message {
        data;
        type = type;
        constructor(data) {
            this.data = data;
        }
    };
}
function MakeMessageFactory(type) {
    return (data) => ({
        type: type,
        data: data
    });
}
//# sourceMappingURL=runInThread.js.map