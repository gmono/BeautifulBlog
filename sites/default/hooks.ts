import ISiteHooks from '../../app/Interface/ISiteHooks';
import IContextInfo from '../../app/Interface/IContextInfo';
//钩子系统 会被server端程序调用 当

class Hooks implements ISiteHooks{
    init(context:IContextInfo){

    }
    OnSiteChanged() {
        throw new Error("Method not implemented.");
    }    
    OnAllGenerated() {
        throw new Error("Method not implemented.");
    }
    OnArticleChange(type: "change" | "add" | "remove", changelist: import("../../app/Interface/IContentMeta").IContentMeta[]) {
        throw new Error("Method not implemented.");
    }


}

export default new Hooks();