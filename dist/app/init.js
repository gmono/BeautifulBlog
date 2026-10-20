"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBlog = createBlog;
const tslib_1 = require("tslib");
const fs_extra_1 = require("fs-extra");
const fse = tslib_1.__importStar(require("fs-extra"));
const path = tslib_1.__importStar(require("path"));
const changesite_1 = tslib_1.__importDefault(require("./changesite"));
const manager_1 = require("./manager");
const utils_1 = require("./lib/utils");
const utils_2 = require("./lib/utils");
async function createBlog(dirpath, autocreate = true, autoreplace = false) {
    if (!(await fse.pathExists(dirpath)))
        if (autocreate)
            await fse.ensureDir(dirpath);
        else
            console.warn("目录不存在！");
    let createSubDir = async () => {
        await Promise.all([
            (0, fs_extra_1.mkdir)(`${dirpath}/articles`),
            (0, fs_extra_1.mkdir)(`${dirpath}/content`),
            (0, fs_extra_1.mkdir)(`${dirpath}/nowSite`),
            (0, fs_extra_1.mkdir)(`${dirpath}/config`),
            (0, fs_extra_1.mkdir)(`${dirpath}/sites`),
            (0, fs_extra_1.mkdir)(`${dirpath}/assets`),
        ]);
    };
    try {
        await createSubDir();
    }
    catch (e) {
        if (autoreplace) {
            console.log("创建子目录失败，删除重建中");
            await fse.remove(dirpath);
            await (0, fs_extra_1.mkdir)(dirpath);
            await createSubDir();
        }
        else {
            console.log("创建子目录失败，此目录中可能已存在Blog");
            return;
        }
    }
    console.log("目录创建完毕");
    await Promise.all([
        (0, utils_2.innerCopy)(path.resolve(__dirname, "../../sites/default"), `${dirpath}/sites/default`),
        (0, utils_2.innerCopy)(path.resolve(__dirname, "../../config/default.json"), `${dirpath}/config/default.json`),
        (0, utils_2.innerCopy)(path.resolve(__dirname, "../../assets"), `${dirpath}/assets`),
        (0, utils_2.innerCopy)(path.resolve(__dirname, "../../index.html"), `${dirpath}/index.html`),
        (0, utils_2.innerCopy)(path.resolve(__dirname, "../../global.json"), `${dirpath}/global.json`),
        (0, utils_2.innerCopy)(path.resolve(__dirname, "../../static/article_templates/about.md"), `${dirpath}/articles/about.md`)
    ]);
    console.log("文件复制完毕");
    console.log("切换到默认site");
    await (0, utils_1.runInDir)(dirpath, async () => await (0, changesite_1.default)("default"));
    await (0, manager_1.initGit)(dirpath);
}
if (require.main == module) {
    createBlog("./tst", true, true);
}
//# sourceMappingURL=init.js.map