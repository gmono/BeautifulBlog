import { IConfig } from './IConfig';
import { IGlobalConfig } from './IGlobalConfig';
//程序内部上下文信息 比如此程序的版本号 nodejs版本号 typescript版本号 等


export default interface IContextInfo{
    version:string;
    node_version:string;
    //当前使用的配置文件
    config:IConfig;
    //全局配置文件
    globalConfig:IGlobalConfig;
}