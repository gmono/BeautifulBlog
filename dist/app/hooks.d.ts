import ISiteHooks, { SiteArticleContext, SiteMetaInfo } from './Interface/ISiteHooks';
export declare const getSiteHooks: (sitename?: string) => ISiteHooks;
export declare function getSiteArticleSupport(sitename: string): Promise<{
    metainfo: SiteMetaInfo;
    intercept?: ISiteHooks["interceptArticle"];
} | null>;
export declare function interceptSiteArticle(sitename: string, context: SiteArticleContext): Promise<any>;
export declare function changedSite(): AsyncGenerator<any, void, unknown>;
export declare function afterRefresh(): Promise<void>;
export declare function changed(destpath: string, changeType?: "change" | "add" | "remove"): Promise<void>;
