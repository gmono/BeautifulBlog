import { IContentMeta } from './IContentMeta';
import IContextInfo from './IContextInfo';
//网站Hooks接口定义
//site被指定导出一个ISiteHook类型的对象


export default interface ISiteHooks{
    init(context:IContextInfo);
    OnSiteChanged();
    //全部重新生成
    OnAllGenerated();
    //增删改
    OnArticleChange(type:"change"|"add"|"remove",changelist:IContentMeta[]);
}