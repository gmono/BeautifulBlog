import ISiteHooks from '../../app/Interface/ISiteHooks';
import IContextInfo from '../../app/Interface/IContextInfo';
//钩子系统 会被server端程序调用 当

class Hooks implements ISiteHooks{
    beforeUnload(context: IContextInfo) {
        console.log("unloading");
    }
    install(context: IContextInfo, installName: string) {
        
    }
    uninstall(context: IContextInfo, installName: string) {
        
    }
    loaded(context: IContextInfo) {
        console.log("loaded");
    }    
    generated(context: IContextInfo) {
        console.log("generated");
    }
    articleChanged(context: IContextInfo, type: "change" | "add" | "remove", dest: string) {
        
    }




}

export =new Hooks();