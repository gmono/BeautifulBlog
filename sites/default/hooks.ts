import ISiteHooks from '../../app/Interface/ISiteHooks';
import IContextInfo from '../../app/Interface/IContextInfo';
//钩子系统 会被server端程序调用 当
///aaa
class Hooks implements ISiteHooks{
    //脚本执行路径 一般为{blogPath}/nowSite
    public basepath:string=null;
    init(basepath: string, context: IContextInfo) {
        this.basepath=basepath;
    }
    
    beforeUnload(context: IContextInfo) {
        console.log("unloading");
    }
    install(context: IContextInfo, installName: string) {
        // throw new Error("Method not implemented.");
    }
    uninstall(context: IContextInfo, installName: string) {
        // throw new Error("Method not implemented.");
    }
    loaded(context: IContextInfo) {
        console.log("this is default theme");
    }    
    generated(context: IContextInfo) {
        // console.log("generated");
    }
    articleChanged(context: IContextInfo, type: "change" | "add" | "remove", dest: string) {
        // throw new Error("Method not implemented.");
    }




}

export =new Hooks();