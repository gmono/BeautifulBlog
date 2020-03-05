"use strict";
const transform_1 = require("../transform");
const fse = require("fs-extra");
const template = require("art-template");
const path = require("path");
async function transformTXT(filepath, destpath, config, globalconfig, ...args) {
    //转换txt文件到html txt如果没有yaml的元数据则把第一行当作标题其余元数据为null
    //txt文件的meta由同名yaml提供
    let txt = (await fse.readFile(filepath)).toString();
    //读取元数据
    let read = async (filepath) => {
        //如果不存在则把txt的第一行做标题 第二行当作时间(yyyy-MM-dd hh:mm:ss) 第三行往下当作正文
        //如果存在则把txt整个当作正文
        let meta = await transform_1.readMetaFromArticle(filepath);
        if (meta == null) {
            meta = {
                title: txt.split("\n")[0],
                date: new Date(txt.split("\n")[1])
            };
            txt = txt.split("\n").slice(2).join("\n");
        }
        //返回元数据与正文
        return {
            meta: meta,
            content: txt
        };
    };
    //读取
    let obj = await read(filepath);
    let html = template(path.resolve(__dirname, "../../static/txt_template.html"), {
        content: obj.content
    });
    //返回
    return {
        html: html,
        raw: Buffer.from(txt),
        meta: obj.meta
    };
}
module.exports = {
    ext: ".txt",
    transformer: transformTXT
};
//# sourceMappingURL=transformTXT.js.map