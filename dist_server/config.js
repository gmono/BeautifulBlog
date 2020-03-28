"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./lib/utils");
const fse = require("fs-extra");
const path = require("path");
/**
 * config程序 用于管理配置文件
 * 功能有
 * * 添加配置文件，包括从现有配置文件衍生
 * * 切换配置文件(use命令)
 * * 删除配置文件
 * * 设置某个配置文件或当前配置文件的某个项（自带autocomplete）
 */
async function useConfig(configname) {
    //切换配置文件
    //验证configname存在
    if (await fse.pathExists(path.resolve("./config", configname + ".json"))) {
        let global = await utils_1.readGlobalConfig();
        global.configName = configname;
        //写入到global
    }
    else {
        throw new Error("错误，指定的配置文件不存在");
    }
}
exports.useConfig = useConfig;
//# sourceMappingURL=config.js.map