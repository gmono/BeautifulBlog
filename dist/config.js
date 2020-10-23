"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useConfig = exports.deleteConfig = exports.createConfig = void 0;
const utils_1 = require("./lib/utils");
const fse = require("fs-extra");
const path = require("path");
const del = require("del");
async function createConfig(baseConfigname, newname) {
    fse.writeJSON(`./config/${newname}.json`, await utils_1.readConfig(baseConfigname));
}
exports.createConfig = createConfig;
async function deleteConfig(configname) {
    await del(`./config/${configname}.json`);
}
exports.deleteConfig = deleteConfig;
async function useConfig(configname) {
    if (await fse.pathExists(path.resolve("./config", configname + ".json"))) {
        let global = await utils_1.readGlobalConfig();
        global.configName = configname;
        await utils_1.writeToGlobalConfig(global);
    }
    else {
        throw new Error("错误，指定的配置文件不存在");
    }
}
exports.useConfig = useConfig;
//# sourceMappingURL=config.js.map