import { IArticleMeta } from "./IArticleMeta";

import { IConfig } from "./IConfig";

import { IGlobalConfig } from "./IGlobalConfig";

export interface TransformResult
{
  html:string;
  meta:IArticleMeta;
  raw:Buffer;
  //用于提供额外文件用于html中的代码使用(文件名可以包含相对路径如 ./aa/bb 或aa/bb)
  files?:{[idx:string]:Buffer}
}


export type TransformFunc=((filepath:string,destpath:string,config:IConfig,globalconfig:IGlobalConfig,...args)=>Promise<TransformResult>);

/**
 * 转换器导出接口
 */
export interface ITransformer{
    //声明可以处理的文件扩展名 如 .md .pdf .xls等
    ext:string;
    //转换函数
    transformer:TransformFunc;
}