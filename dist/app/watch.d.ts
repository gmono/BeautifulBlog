import { Subject } from "rxjs";
export declare const OnArticleGenerated: Subject<void>;
export declare const OnSiteSynced: Subject<void>;
export default function watchArticles(configName?: string): Promise<import("chokidar", { with: { "resolution-mode": "import" } }).FSWatcher>;
export declare function watchSite(siteName: string): Promise<import("chokidar", { with: { "resolution-mode": "import" } }).FSWatcher>;
