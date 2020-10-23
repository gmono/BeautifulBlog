import { Subject } from "rxjs";
export declare const OnArticleGenerated: Subject<void>;
export declare const OnSiteSynced: Subject<void>;
export default function watchArticles(configname?: string): Promise<void>;
export declare function watchSite(sitename: string): Promise<void>;
