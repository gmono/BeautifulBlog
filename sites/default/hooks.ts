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
        console.log("正在切换出默认主题");
    }
    install(context: IContextInfo, installName: string) {
        // throw new Error("Method not implemented.");
        console.log("安装，默认主题？");
    }
    uninstall(context: IContextInfo, installName: string) {
        console.log("卸载：默认主题");
    }
    loaded(context: IContextInfo) {
        console.log("默认主题，瞎几把写的，将就着用吧.");
    }    
    generated(context: IContextInfo) {
        console.log(`生成文章了，已经，这里可以写一些代码，比如把文章自动加随即配图然后放到主页${context.version}`);
    }
    articleChanged(context: IContextInfo, type: "change" | "add" | "remove", dest: string) {
        console.log("文章更改，这时候网站应该立刻响应，如果没事就算了 当然");
    }




}

export =new Hooks();