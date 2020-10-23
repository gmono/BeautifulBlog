import IContextInfo from './IContextInfo';
export default interface ISiteHooks {
    init(basepath: string, context: IContextInfo): any;
    loaded(context: IContextInfo): any;
    generated(context: IContextInfo): any;
    articleChanged(context: IContextInfo, type: "change" | "add" | "remove", dest: string): any;
    beforeUnload(context: IContextInfo): any;
    install(context: IContextInfo, installName: string): any;
    uninstall(context: IContextInfo, installName: string): any;
}
