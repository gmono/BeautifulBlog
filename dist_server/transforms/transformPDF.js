"use strict";
const transform_1 = require("../transform");
const fse = require("fs-extra");
const template = require("art-template");
const utils_1 = require("../lib/utils");
const path = require("path");
/**
 * 转换pdf文件的转换函数
 * 采取直接复制pdf文件并提取元数据（当前未实现）
 * 并直接在文章页中嵌入pdf embed节点的方式处理
 */
async function transformPDF(filepath, destpath, config, globalconfig, ...args) {
    //读取pdf文件原始数据
    let raw = await fse.readFile(filepath);
    //确定复制地址 并转换为相对blog根目录的url
    const destpdf = transform_1.getFileFromDest(destpath, "article.pdf");
    const pdfurl = utils_1.getUrlFromPath(destpdf, config.base_url);
    //生成html
    let html = template(path.resolve(__dirname, "../../static/pdf_template.html"), {
        pdfurl: pdfurl
    });
    //生成元数据
    //pdf可从配置文件中读取
    let meta = await transform_1.readMetaFromArticle(filepath);
    if (meta == null) {
        //这里在没有配置文件的情况下推断元数据
        //标题为文件名 日期为修改日期
        meta = {
            title: path.parse(filepath).name,
            date: (await fse.stat(filepath)).mtime
        };
    }
    //附加一个附件 把原始的pdf文件复制到附件目录
    return {
        html, meta, raw, files: {
            "article.pdf": raw
        }
    };
}
module.exports = {
    ext: ".pdf",
    transformer: transformPDF,
    desc: {
        name: "PDF转换器",
        description: "官方转换器，转换PDF文件(.pdf),pdf文件可以toml同名文件配置元数据，否则以文件名为标题，修改时间为发布时间"
    },
    init() {
        console.log("作者:上清");
    }
};
//# sourceMappingURL=transformPDF.js.map