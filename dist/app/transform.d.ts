import { IContentMeta } from './Interface/IContentMeta';
import { IArticleMeta } from "./Interface/IArticleMeta";
import { TransformResult } from './Interface/IS_Transform';
export declare function ensureTransformTable(): Promise<void>;
export declare function getAllowFileExts(): Promise<string[]>;
declare function transform(filepath: string, destpath: string, configname?: string, ...args: any[]): Promise<TransformResult>;
export declare function readMetaFromArticle(articlePathOrSrcPath: string): Promise<IArticleMeta>;
declare type TransformFileResult = {
    res: TransformResult;
    content_meta: IContentMeta;
};
export declare function getFileFromDest(destpath: string, filename: string): string;
export declare function getFilesDir(destpath: string): string;
export declare function transformFile(srcfile: string, destfilename: string): Promise<TransformFileResult>;
export default transform;
