import ISiteHooks from '../../app/Interface/ISiteHooks';
import IContextInfo from '../../app/Interface/IContextInfo';
//钩子系统 会被server端程序调用 当

class Hooks implements ISiteHooks{
    unloaded(context: IContextInfo) {
        throw new Error("Method not implemented.");
    }
    install(context: IContextInfo, installName: string) {
        throw new Error("Method not implemented.");
    }
    uninstall(context: IContextInfo, installName: string) {
        throw new Error("Method not implemented.");
    }
    loaded(context: IContextInfo) {
        console.log(context);
    }    
    generated(context: IContextInfo) {
        console.log(context);
    }
    articleChanged(context: IContextInfo, type: "change" | "add" | "remove", dest: string) {
        throw new Error("Method not implemented.");
    }




}

export default new Hooks();