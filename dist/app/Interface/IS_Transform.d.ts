/// <reference types="node" />
import { IArticleMeta } from "./IArticleMeta";
import { IConfig } from "./IConfig";
import { IGlobalConfig } from "./IGlobalConfig";
export interface TransformResult {
    html: string;
    meta: IArticleMeta;
    raw: Buffer;
    files?: {
        [idx: string]: Buffer;
    };
}
export declare type TransformFunc = ((filepath: string, destpath: string, config: IConfig, globalconfig: IGlobalConfig, ...args: any[]) => Promise<TransformResult>);
export interface ITransformer {
    ext: string;
    transformer: TransformFunc;
    desc: {
        name: string;
        description: string;
    };
    templateContent?(title: string, date: Date): Promise<Buffer>;
    init(): Promise<void>;
}
export declare type TransformerExports = ITransformer | ITransformer[];
