import { readGlobalConfig } from './lib/utils';
import * as fse from 'fs-extra';
import * as path from 'path';
/**
 * config程序 用于管理配置文件
 * 功能有
 * * 添加配置文件，包括从现有配置文件衍生
 * * 切换配置文件(use命令)
 * * 删除配置文件
 * * 设置某个配置文件或当前配置文件的某个项（自带autocomplete）
 */


export async function useConfig(configname:string)
{
    //切换配置文件
    //验证configname存在
    if(await fse.pathExists(path.resolve("./config",configname+".json")))
    {
        let global=await readGlobalConfig();
        global.configName=configname;
        //写入到global
        
    }
    else
    {
        throw new Error("错误，指定的配置文件不存在");
    }
     
}