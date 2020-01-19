import { IConfig } from './Interface/IConfig';
/**
 * 网站生成器 生成内容并复制网站
 * 
 */

import * as path from "path"
 let config=require("./config.json") as IConfig;

 let spath=path.resolve("./sites",config.site);
 //删除nowSite目录复制spath指向的目录并命名为nowSite