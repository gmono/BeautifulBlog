"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
/**
 * 主要用于在一个目录中创建基本的博客目录结构
 * 功能：
 * 在目录中创建博客
 * 如果目录不存在可自动创建目录（可选）
 */
const fse = require("fs-extra");
const del = require("del");
// import { fork } from 'child_process';
const changesite_1 = require("./changesite");
const manager_1 = require("./manager");
const utils_1 = require("./lib/utils");
const utils_2 = require("./lib/utils");
/**
 * 在目录中创建博客
 * @param dirpath 要创建博客的目录
 * @param autocreate 是否在不存在目录时自动创建目录
 * @param autoreplace 是否在创建子目录出现冲突时自信replace策略，删除dirpath后重建，请谨慎使用
 */
async function createBlog(dirpath, autocreate = true, autoreplace = false) {
    if (!(await fse.pathExists(dirpath)))
        if (autocreate)
            await fse.ensureDir(dirpath);
        else
            console.warn("目录不存在！");
    /**
     *
     */
    let createSubDir = async () => {
        await Promise.all([
            fs_extra_1.mkdir(`${dirpath}/articles`),
            fs_extra_1.mkdir(`${dirpath}/content`),
            fs_extra_1.mkdir(`${dirpath}/nowSite`),
            fs_extra_1.mkdir(`${dirpath}/config`),
            fs_extra_1.mkdir(`${dirpath}/sites`),
            fs_extra_1.mkdir(`${dirpath}/assets`)
        ]);
    };
    //当前直接程序创建
    //未来考虑使用模板解压
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
        utils_2.innerCopy(`${__dirname}/../global.json`, `${dirpath}/global.json`)
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