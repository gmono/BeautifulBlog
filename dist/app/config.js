"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConfig = createConfig;
exports.deleteConfig = deleteConfig;
exports.useConfig = useConfig;
const tslib_1 = require("tslib");
const utils_1 = require("./lib/utils");
const fse = tslib_1.__importStar(require("fs-extra"));
const path = tslib_1.__importStar(require("path"));
async function createConfig(baseConfigname, newname) {
    fse.writeJSON(`./config/${newname}.json`, await (0, utils_1.readConfig)(baseConfigname));
}
async function deleteConfig(configname) {
    await fse.remove(`./config/${configname}.json`);
}
async function useConfig(configname) {
    if (await fse.pathExists(path.resolve("./config", configname + ".json"))) {
        let global = await (0, utils_1.readGlobalConfig)();
        global.configName = configname;
        await (0, utils_1.writeToGlobalConfig)(global);
    }
    else {
        throw new Error("错误，指定的配置文件不存在");
    }
}
//# sourceMappingURL=config.js.map