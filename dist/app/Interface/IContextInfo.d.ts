import { IConfig } from './IConfig';
import { IGlobalConfig } from './IGlobalConfig';
export default interface IContextInfo {
    blogPath: string;
    version: string;
    node_version: string;
    config?: IConfig;
    globalConfig: IGlobalConfig;
}
