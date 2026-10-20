import { IArticleMeta } from "./IArticleMeta";
import { IConfig } from "./IConfig";
import { IGlobalConfig } from "./IGlobalConfig";
export interface TransformResult {
    html: string;
    meta: IArticleMeta;
    raw?: Uint8Array;
    files?: {
        [idx: string]: Uint8Array;
    };
}
export type TransformFunc = ((filepath: string, destpath: string, config: IConfig, globalconfig: IGlobalConfig, ...args: any[]) => Promise<TransformResult>);
export interface ITransformer {
    ext: string;
    transformer: TransformFunc;
    desc: {
        name: string;
        description: string;
    };
    templateContent?(title: string, date: Date): Promise<Uint8Array>;
    init(): void | Promise<void>;
}
export type TransformerExports = ITransformer | ITransformer[];
