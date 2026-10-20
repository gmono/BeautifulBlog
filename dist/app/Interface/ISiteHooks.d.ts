import IContextInfo from './IContextInfo';
import { IConfig } from './IConfig';
import { IGlobalConfig } from './IGlobalConfig';
import { TransformResult } from './IS_Transform';
export interface SiteArticleContext {
    sourcePath: string;
    destinationPath: string;
    extension: string;
    config: IConfig;
    globalConfig: IGlobalConfig;
}
export interface SiteMetaInfo {
    articleExtensions?: string[];
}
export default interface ISiteHooks {
    metainfo?: SiteMetaInfo;
    interceptArticle?(context: SiteArticleContext): Promise<TransformResult | undefined> | TransformResult | undefined;
    init(basepath: string, context: IContextInfo): any;
    loaded(context: IContextInfo): any;
    generated(context: IContextInfo): any;
    articleChanged(context: IContextInfo, type: "change" | "add" | "remove", dest: string): any;
    beforeUnload(context: IContextInfo): any;
    install(context: IContextInfo, installName: string): any;
    uninstall(context: IContextInfo, installName: string): any;
}
