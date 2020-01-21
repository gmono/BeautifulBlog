class EventHub<P>
{
    public cbks=[];
    /**
     * register
     */
    public register(cbk:(pars:P)=>void) {
        this.cbks.push(cbk);
    }
    public send(pars:P)
    {
        this.cbks.forEach((v)=>{
            v(pars);
        });
    }
}
type TopMessageType="system"|"custom";
/**
 * 顶层消息
 * 带有发送者id 消息类型 和 数据负载
 */
interface Message
{
    sender:string;
    typeid:TopMessageType;
    data:any;
}
/**
 * 组 id和组件名约定 *代表未知  sys代表系统 其他自定义
 */
class MessageHub
{
    public id_lst:string[]=[];
    //id->MessageClient
    public id_map={};
    constructor()
    {

    }
    public send(id:string,selfid:string,obj:any)
    {
        this.getClient(id).Source.send({
            sender:selfid,
            typeid:"custom",
            data:obj});
    }
    public getClient(id:string)
    {
        if(id in this.id_map) return this.id_map[id] as MessageClient;
        return null;
    }
    public register(client:MessageClient)
    {
        client.Core=this;
        if(client.id in this.id_map) return false;
        this.id_lst.push(client.id);
        this.id_map[client.id]=client;
    }
}


/**
 * 基本Message客户端，只负责传递消息，不解释data的含义
 * 提供基本的对特定组件/组/id 发送消息的功能
 * 提供组件自身的基本信息 包括自身的id 组件name 和组id
 * 允许客户端获取只读Core对象并使用其与全局交互
 */
class MessageClient
{
    constructor(protected core:MessageHub,
                public readonly id:string,
                public readonly componentname:string="*",
                public readonly groupid:string="*")
                {
                    this.sendids=core.id_lst;
                }
    
    protected sendids:Array<string>=null;
    public set Core(value:Readonly<MessageHub>)
    {
        this.core=value;
        this.sendids=this.core.id_lst;
    }
    public get Core():Readonly<MessageHub>
    {
        return this.core;
    }
    /**
     * 直接调用等于广播消息
     * @param obj 发送的对象
     */
    public send<T>(obj:T)
    {
        this.sendids.forEach((value,idx)=>{
            this.core.send(value,this.id,obj);
        });
    }
    public group(groupid:string):Readonly<MessageClient>
    {
        let ret=new MessageClient(this.core,this.id,this.componentname,this.groupid);
        ret.sendids=this.sendids.filter((value,idx)=>{
            if(this.core.getClient(value).groupid==groupid) return true;
            return false;
        });
        return ret;

    }
    public component(componentname:string):Readonly<MessageClient>
    {
        let ret=new MessageClient(this.core,this.id,this.componentname,this.groupid);
        ret.sendids=this.sendids.filter((value,idx)=>{
            if(this.core.getClient(value).componentname==componentname) return true;
            return false;
        });
        return ret;
    }
    public ids(...ids:string[]):Readonly<MessageClient>
    {
        let ret=new MessageClient(this.core,this.id,this.componentname,this.groupid);
        //过滤不存在的
        ret.sendids=ids.filter((value,idx)=>{
            if(this.core.getClient(value)!=null) return true;
            return false;
        });;
        return ret;
    }
    public except(...ids:string[]):Readonly<MessageClient>
    {
        let ret=new MessageClient(this.core,this.id,this.componentname,this.groupid);
        //过滤不存在的
        ret.sendids=this.sendids.filter((value,idx)=>{
            //如果在排除列表
            if(ids.indexOf(value)!=-1) return false;
            return true;
        });;
        return ret;
    }
    public exceptSelf():Readonly<MessageClient>
    {
        return this.except(this.id);
    }
    /**
     * 事件Hub 允许组件监听事件
     */
    public Source:EventHub<Message>=new EventHub<Message>();
    
}