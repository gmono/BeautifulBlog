"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTagByClass = exports.createVersionByClasses = exports.createClassByClasses = exports.createArticleByClasses = void 0;
exports.createArticle = createArticle;
exports.createClass = createClass;
exports.createVersion = createVersion;
exports.createTag = createTag;
const tslib_1 = require("tslib");
const fse = tslib_1.__importStar(require("fs-extra"));
const path = tslib_1.__importStar(require("path"));
const child_process_1 = require("child_process");
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
    const gconfig = (await fse.readJson(path.resolve(__dirname, "../../global.json")));
    if (gconfig.editor != null) {
        const editor = (0, child_process_1.spawn)(gconfig.editor, [p], { detached: true, stdio: "ignore" });
        editor.once("error", error => console.warn(`无法启动编辑器 ${gconfig.editor}: ${error.message}`));
        editor.unref();
    }
}
async function createClass(basepath, name) {
    let p = path.resolve(basepath, name);
    if (await fse.pathExists(p)) {
        throw new Error("错误，子类已存在");
    }
    await fse.mkdir(p);
    console.log(`创建子类完成，子类文件夹路径:${p}`);
}
async function createVersion(basepath, name) {
    throw new Error("尚未实现此功能");
}
async function createTag(basepath, name) {
    throw new Error("尚未实现此功能");
}
exports.createArticleByClasses = makeToClassBase(createArticle);
exports.createClassByClasses = makeToClassBase(createClass);
exports.createVersionByClasses = makeToClassBase(createVersion);
exports.createTagByClass = makeToClassBase(createTag);
if (require.main == module) {
    console.log("本程序不支持直接运行,请在程序中引用");
}
//# sourceMappingURL=create.js.map