/// <reference types="node" />
import * as thread from "worker_threads";
import { Observable } from 'rxjs';
declare type RepresentType<Base> = Base | (new (...args: any[]) => Base) | ((...args: any[]) => Base);
declare type MSGType<T> = RepresentType<IMessage<T>>;
declare type InnerType<T extends MSGType<any>> = T extends MSGType<infer S> ? S : never;
interface ExtraWorker extends thread.Worker {
    onMessage<MT extends MSGType<any>, DT = InnerType<MT>>(type: string, cbk: (data: DT) => any): any;
    onceMessage<MT extends MSGType<any>, DT = InnerType<MT>>(type: string): Promise<DT>;
    MessagePump<MT extends MSGType<any>, DT = InnerType<MT>>(type: string): Observable<DT>;
}
declare type WorkerFunc = (context: IThreadContext, ...args: any[]) => any;
export declare function runFunction(modpath: string, namedObjects: {
    [idx: string]: any;
}, libFuncs: {
    [idx: string]: Function;
}, func: WorkerFunc, ...args: any[]): ExtraWorker;
export interface IThreadContext {
    localRequire<T>(mod: string): T;
    sendMessage<DT>(msg: IMessage<DT>): any;
    sendMessageOf<DT>(type: string, data: DT): any;
}
export interface IMessage<DT = any> {
    type: string;
    data: DT;
}
export declare function MakeMessageType<DT>(type: string): new (data: DT) => IMessage<DT>;
export declare function MakeMessageFactory<DT>(type: string): (data: DT) => IMessage<DT>;
export {};
