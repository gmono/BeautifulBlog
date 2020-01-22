/**
 * 监听器组件相关
 */
namespace Watcher
{
    let a={};
//消息中心
    function MessageCbk(obj:any)
    {
        console.log(`changed:${JSON.stringify(obj)}`);
    }
    function Changed(obj:any){
        //发出更改消息并冒泡
        //发出此对象更改消息
        MessageCbk(obj);
        //发出parent更改消息
        if(obj[Parent]!=null) Changed(obj[Parent]);
    }
    ///
    export const Parent=Symbol("父对象的代理对象的指针");
    export const SelfName=Symbol("此对象在父对象中的属性名，如果有")
    export const NoProxy=Symbol("表明此对象不需要Proxy化");
    export const NoEvent=Symbol("表明此对象不监听更改事件");
    /**
     * 辅助函数，用于打印一个对象相对top对象的path 前提是这个top对象必须是被代理的
     * @param obj 打印的对象
     */
    function printChain(obj:any)
    {
        //获得parent对象并打印parent对象的信息
        let parent=obj[Parent];
        if(parent!=null) printChain(parent);
        //打印自己的信息
        console.log(obj);
    }
    /**
     * 监听回调函数
     */
    export type WatchHandler=(pars:ChangeObject)=>void;


    ///基本读写函数区域
    /**
     * 进行自定义的属性设置，允许对proxy行为进行控制
     * @param obj 要设置属性的对象
     * @param key 属性名
     * @param value 属性值
     * @param noevent 是否不触发事件
     * @param noproxy 是否不进行递归代理（针对新设置的属性）
     */
    function setObject(obj:Object,key:PropertyKey,value:any,noevent=false,noproxy=false)
    {
        let nobj=value;
        obj[NoEvent]=noevent;
        if(typeof value=="object") nobj[NoProxy]=noproxy;
        obj[key]=nobj;
        delete obj[NoEvent];
        if(typeof value=="object") delete nobj[NoProxy];
    }
    /**
     * 
     * @param obj 要获取属性的对象
     * @param path 路径
     * @param ensure 当path指定的属性不存在时是否进行ensure操作，即创建一个新属性   
     * @param noevent 是否触发修改事件 
     * @param noproxy 是否需要对新属性进行递归代理
     */
    function getPathPtr(obj:any,path:string,ensure:boolean=false,noevent=false,noproxy=false)
    {
        let arr=path.split("/").slice(1);
        let npth=arr.slice(0,-1);
        let prop=arr[arr.length-1];
        let now=obj;
        for(let p of npth){
            if(now[p]==null) {
                if(ensure) {
                    setObject(now,p,{},noevent,noproxy);
                }
                else throw "错误，路径不存在";
            }
            now=now[p];
        }
        return {obj:now,prop};
    }
    /////结束

    //确认path存在 如果不存在抛出错误
    export let ensuerPathExists=(obj:any,path:string)=>{getPathPtr(obj,path);}




    ///应用读写函数
    //根据path设置属性
    export function setProp(obj:any,path:string,value:any,force:boolean=false,noevent=false,noproxy=false)
    {
        let res=getPathPtr(obj,path,force,noevent,noproxy);
        setObject(res.obj,res.prop,value,noevent,noproxy);
        //返回的是有Proxy的对象或值
        return res.obj[res.prop];
    }
    /**
     * 根据path获取属性
     * @param obj 获取属性
     * @param path 路径
     */
    export function getProp(obj:any,path:string)
    {
        if(path=="/") return obj;
        let res=getPathPtr(obj,path);
        return res.obj[res.prop];
    }
    ///查询函数
    /**
     * 分析对象，得到其top对象和相对于top对象的path
     * @param obj 要分析的对象
     */
    export function getTopAndPath(obj:any)
    {
        let nowpath="";
        let now=obj;
        while(now[Parent]!=null)
        {
            nowpath=`/${now[SelfName]}${nowpath}`;
            now=now[Parent];
        }
        if(nowpath=="") nowpath="/";
        return {top:now,nowpath};
    }
    /**
     * 获取一个object自带的路径
     * 追溯Parent获取obj相对顶层对象的路径
     * @param obj 要获取路径的对象
     */
    export function getPath(obj:any)
    {
        return getTopAndPath(obj).nowpath;   
    }



    
    ///数据结构声明
    export interface ChangeInfo
    {
        old:any;
        new:any;
    }
    interface ChangeObject
    {
        obj:any;
        target:ChangeInfo;
        targetPath:string
    }

    export interface IWatcher
    {
        toProxiedData<T>(obj:T,parent:any,key:PropertyKey):T;
    }
    export interface IHandle
    {
        Changed(pars:ChangeObject):any;
    }
    //正文开始
    /**
     * 正文开始
     * 使用方法 let obj=new Watcher(handler).toProxiedData(obj);
     */
    export class Watcher
    {
        //指示是否暂停发出Change事件
        public isListen=true;
        //target中的old和new 都是Proxied对象或值
        protected Changed(obj:any,target:ChangeInfo,targetPath:string)
        {
            this.Handler({obj,target,targetPath});
            //如果冒泡且存在父对象才继续递归
            if(this.isBubble&&obj[Parent]!=null) this.Changed(obj[Parent],target,`/${String(obj[SelfName])}${targetPath}`);
        }
        /**
         * @param Handler 通知函数
         * @param isBubble 是否采用事件冒泡（即下层对象修改后，上层对象会接到通知)
         */
        constructor(public Handler:WatchHandler,public isBubble:boolean=true){
            let _this=this;
            let pobj={
                set(target: any, p: PropertyKey, value: any, receiver: any):boolean{
                    //只要有属性更改就加个代理
                    if(p==NoProxy&&p==NoEvent) {
                        target[p]=value;
                        return true;
                    }
                    const desc=Object.getOwnPropertyDescriptor(target,p);
                    if(p in target &&(desc==null||desc.writable==false))
                    {
                        //不代理只读对象
                        return true;
                    }
                    let old=target[p];
                    if(typeof value =='object'&&value[NoProxy]!=true)
                    {
                        //如果此处在修改一个对象的parent，则会导致parent对象被加上Proxy
                        //这使得Parent对象本身的更改也会被此对象监听(重复设置Proxy)
                        //同时下面的代码设置Parent的Parent指针指向此对象导致“循环指向” 出错
                        //因此Parent对象是只读且不可修改的
                        let childProxy=new Proxy(value,pobj);
                        target[p]=childProxy;
                        //在目标对象上记录下parent指针 parent可以为父对象的proxy或直接为对象本身
                        //在value上记录parent则parent的更改不被监视  否则将形成无限递归
                        //即在子对象上记录parent时等同于给子对象加了一个属性
                        //这个属性又需要以子对象为parent 以此类推
                        //故parent不通过代理
                        //value为receiver表示parent指向的是Parent的Proxy对象,因此对其parent的操作
                        //也会被监视
                        Object.defineProperty(value,Parent,{
                            value:receiver,
                            enumerable:false,
                            writable:false,
                            configurable:false
                        });
                        //记录此对象在父对象中的属性名
                        Object.defineProperty(value,SelfName,{
                            value:p,
                            enumerable:false,
                            writable:false,
                            configurable:false
                        });
                    }
                    else
                    {
                        target[p]=value;
                    }
                    if(_this.isListen&&target[NoEvent]!=true){
                        // printChain(target);
                        //通知
                        _this.Changed(receiver,{
                            old:old,
                            new:target[p]},`/${String(p)}`);
                    }
                    return true;
                }
            } as ProxyHandler<any>;
            this.ProxyObject=pobj;
        }
        protected ProxyObject=null as unknown as ProxyHandler<any>;
        /**
         * 应该遵循自顶向下逐层赋值的原则
         * parent已经是Proxy对象或直接为null
         * 转换原始对象 直接在原始对象上转换
         * @param obj 要转换的对象
         * @param parent 父对象（将被赋值给父对象）可以为Proxy化的对象
         * @param key 此对象在父对象中的属性名
         */
        public toProxiedData<T>(obj:T,parent:any=null,key:PropertyKey=""):T{
            try{
                let ret=null as unknown as T;
                //如果父对象不存在 则ret直接为obj的代理
                obj[NoEvent]=true;
                if(parent==null) ret=new Proxy(obj,this.ProxyObject);
                else
                {
                    //赋值给父对象
                    parent[key]=obj;
                    //从父对象中得到处理过的子对象
                    ret=parent[key];
                }
                //处理下级对象 转换所有object
                for(let key in obj)
                {
                    if(obj[key]!=null&&typeof obj[key]=="object")
                        this.toProxiedData(obj[key],ret,key);
                }
                //为避免触发读取事件 这里直接操作原始对象
                delete obj[NoEvent];
                return ret;
            }catch(e)
            {
                return obj;
            }
        }


        
    }
    /**
     * 写入器 接受更改信息 对监控对象进行修改
     */
    export class Writer
    {

    }
}



