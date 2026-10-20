"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const changesite_1 = tslib_1.__importDefault(require("./changesite"));
const generator_1 = tslib_1.__importDefault(require("./generator"));
const fse = tslib_1.__importStar(require("fs-extra"));
async function sitegen(configname = "default") {
    await (0, generator_1.default)(configname, false, true);
    let config = (await fse.readJSON(`./config/${configname}.json`));
    await (0, changesite_1.default)(config.site);
    console.log("全部刷新完成");
}
if (require.main == module)
    sitegen();
exports.default = sitegen;
//# sourceMappingURL=sitegen.js.map