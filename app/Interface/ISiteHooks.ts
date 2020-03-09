import { IContentMeta } from './IContentMeta';
import IContextInfo from './IContextInfo';
//网站Hooks接口定义
//site被指定导出一个ISiteHook类型的对象


export default interface ISiteHooks{
    //执行changesit装载此site后触发，只有loaded的site才会被触发其他事件
    loaded(context:IContextInfo);
    //文章重新生成 
    generated(context:IContextInfo);
    //文章增删改并生成内容后 dest为目标文章生成地址（不带后缀名)
    //此事件并不会在new命令执行时触发，而是在watch或sync监视到改动并同步到content后触发
    articleChanged(context:IContextInfo,type:"change"|"add"|"remove",dest:string);
    //切换到其他site前调用
    unloaded(context:IContextInfo);

    //以下为备用的插件式安装和卸载site到sites目录时调用
    install(context:IContextInfo,installName:string);
    uninstall(context:IContextInfo,installName:string);
}