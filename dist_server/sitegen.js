"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const changesite_1 = require("./changesite");
//生成内容
const generator_1 = require("./generator");
const fse = require("fs-extra");
const del = require("del");
async function sitegen(configname = "default") {
    //临时全部重新生成处理策略
    del("./content");
    await generator_1.default();
    let config = (await fse.readJSON(`./config/${configname}.json`));
    await changesite_1.default(config.site);
    console.log("全部刷新完成");
}
if (require.main == module)
    sitegen();
exports.default = sitegen;
//# sourceMappingURL=sitegen.js.map