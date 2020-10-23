"use strict";
const transform_1 = require("../transform");
const fse = require("fs-extra");
const template = require("art-template");
const utils_1 = require("../lib/utils");
const path = require("path");
async function transformPDF(filepath, destpath, config, globalconfig, ...args) {
    let raw = await fse.readFile(filepath);
    const destpdf = transform_1.getFileFromDest(destpath, "article.pdf");
    const pdfurl = utils_1.getUrlFromPath(destpdf, config.base_url);
    let html = template(path.resolve(__dirname, "../../../static/pdf_template.html"), {
        pdfurl: pdfurl
    });
    let meta = await transform_1.readMetaFromArticle(filepath);
    if (meta == null) {
        meta = {
            title: path.parse(filepath).name,
            date: (await fse.stat(filepath)).mtime
        };
    }
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