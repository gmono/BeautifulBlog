"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const changesite_1 = require("./changesite");
//生成内容
const generator_1 = require("./generator");
async function main() {
    await generator_1.default();
    let config = require("./config.json");
    await changesite_1.default(config.site);
    console.log("网站生成完成");
}
main();
