"use strict";
const tslib_1 = require("tslib");
const transform_1 = require("../transform");
const fse = tslib_1.__importStar(require("fs-extra"));
const template = require("art-template");
const path = require("path");
const dateformat_1 = tslib_1.__importDefault(require("dateformat"));
async function transformTXT(filepath, destpath, config, globalconfig, ...args) {
    let txt = (await fse.readFile(filepath)).toString();
    let read = async (filepath) => {
        let meta = await (0, transform_1.readMetaFromArticle)(filepath);
        if (meta == null) {
            meta = {
                title: txt.split("\n")[0],
                date: new Date(txt.split("\n")[1])
            };
            txt = txt.split("\n").slice(2).join("\n");
        }
        return {
            meta: meta,
            content: txt
        };
    };
    let obj = await read(filepath);
    let html = template(path.resolve(__dirname, "../../../static/txt_template.html"), {
        content: obj.content
    });
    return {
        html: html,
        raw: Buffer.from(txt),
        meta: obj.meta
    };
}
module.exports = {
    ext: ".txt",
    transformer: transformTXT,
    desc: {
        name: "Txt转换器",
        description: `官方转换器，转换TXT文件(.txt),可添加toml格式元数据配置（配置标题等）
否则自动以第一行为标题，第二行为时间`
    },
    init() {
        console.log("作者:上清");
    },
    async templateContent(title, date) {
        const str = template(path.resolve(__dirname, "../../../static/transformer_files/md.md"), {
            title: title,
            date: (0, dateformat_1.default)(date, "yyyy-mm-dd hh:MM:ss"),
            simple: "模板内容"
        });
        return Buffer.from(str);
    }
};
//# sourceMappingURL=transformTXT.js.map