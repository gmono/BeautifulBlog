"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTagByClass = exports.createVersionByClasses = exports.createClassByClasses = exports.createArticleByClasses = exports.createTag = exports.createVersion = exports.createClass = exports.createArticle = void 0;
const fse = require("fs-extra");
const path = require("path");
const execa = require("execa");
let makeToClassBase = (func) => {
    return (classes, ...args) => {
        let p = path.resolve("./articles", ...classes);
        return func(p, ...args);
    };
};
async function createArticle(basepath, title) {
    let filename = `${title}.md`;
    let p = path.resolve(basepath, filename);
    if (await fse.pathExists(p)) {
        throw new Error(`错误，目录${basepath}存在同名文章`);
    }
    let templateContent = `---
title: "${title}"
date: ${JSON.stringify(new Date())}
draft: true
---
    `;
    await fse.ensureDir(path.parse(p).dir);
    await fse.writeFile(p, templateContent);
    console.log(`创建文章完成，文章路径:${p}`);
    const gconfig = (await fse.readJson(path.resolve(__dirname, "../global.json")));
    if (gconfig.editor != null) {
        execa(gconfig.editor, [p]);
    }
}
exports.createArticle = createArticle;
async function createClass(basepath, name) {
    let p = path.resolve(basepath, name);
    if (await fse.pathExists(p)) {
        throw new Error("错误，子类已存在");
    }
    await fse.mkdir(p);
    console.log(`创建子类完成，子类文件夹路径:${p}`);
}
exports.createClass = createClass;
async function createVersion(basepath, name) {
    throw new Error("尚未实现此功能");
}
exports.createVersion = createVersion;
async function createTag(basepath, name) {
    throw new Error("尚未实现此功能");
}
exports.createTag = createTag;
exports.createArticleByClasses = makeToClassBase(createArticle);
exports.createClassByClasses = makeToClassBase(createClass);
exports.createVersionByClasses = makeToClassBase(createVersion);
exports.createTagByClass = makeToClassBase(createTag);
if (require.main == module) {
    console.log("本程序不支持直接运行,请在程序中引用");
}
//# sourceMappingURL=create.js.map