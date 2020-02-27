"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fse = require("fs-extra");
const path = require("path");
function readConfig(name) {
    return fse.readJson(path.resolve(__dirname, `../../config/${name}.json`));
}
exports.readConfig = readConfig;
async function runInDir(dirpath, func) {
    const s = process.cwd();
    process.chdir(dirpath);
    await func();
    process.chdir(s);
}
exports.runInDir = runInDir;
//# sourceMappingURL=utils.js.map