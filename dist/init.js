"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBlog = void 0;
const fs_extra_1 = require("fs-extra");
const fse = require("fs-extra");
const del = require("del");
const changesite_1 = require("./changesite");
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
            fs_extra_1.mkdir(`${dirpath}/articles`),
            fs_extra_1.mkdir(`${dirpath}/content`),
            fs_extra_1.mkdir(`${dirpath}/nowSite`),
            fs_extra_1.mkdir(`${dirpath}/config`),
            fs_extra_1.mkdir(`${dirpath}/sites`),
            fs_extra_1.mkdir(`${dirpath}/assets`),
        ]);
    };
    try {
        await createSubDir();
    }
    catch (e) {
        if (autoreplace) {
            console.log("创建子目录失败，删除重建中");
            await del(dirpath);
            await fs_extra_1.mkdir(dirpath);
            await createSubDir();
        }
        else {
            console.log("创建子目录失败，此目录中可能已存在Blog");
            return;
        }
    }
    console.log("目录创建完毕");
    await Promise.all([
        utils_2.innerCopy(`${__dirname}/../sites/default`, `${dirpath}/sites/default`),
        utils_2.innerCopy(`${__dirname}/../config/default.json`, `${dirpath}/config/default.json`),
        utils_2.innerCopy(`${__dirname}/../assets`, `${dirpath}/assets`),
        utils_2.innerCopy(`${__dirname}/../index.html`, `${dirpath}/index.html`),
        utils_2.innerCopy(`${__dirname}/../global.json`, `${dirpath}/global.json`),
        utils_2.innerCopy(`${__dirname}/../articles/about.md`, `${dirpath}/articles/about.md`)
    ]);
    console.log("文件复制完毕");
    console.log("切换到默认site");
    await utils_1.runInDir(dirpath, async () => await changesite_1.default("default"));
    await manager_1.initGit(dirpath);
}
exports.createBlog = createBlog;
if (require.main == module) {
    createBlog("./tst", true, true);
}
//# sourceMappingURL=init.js.map