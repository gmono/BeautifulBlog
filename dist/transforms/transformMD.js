"use strict";
const fm = require("front-matter");
const cheerio = require("cheerio");
const path = require("path");
const loadLanguages = require("prismjs/components/");
const fse = require("fs-extra");
const Prism = require("prismjs");
const mk = require("marked");
const template = require("art-template");
function htmlProcessing(html) {
    let $ = cheerio.load(html);
    let codeblocks = $("code[class]");
    codeblocks.each((i, e) => {
        let parent = $(e).parent("pre");
        parent.attr("class", ($(e).attr("class")));
    });
    return $.html();
}
let first = true;
let baseurl = "/";
async function transformMD(filepath, destpath, config, globalconfig, ...args) {
    if (first) {
        let langs = config.code_languages;
        baseurl = config.base_url == "/" ? "" : config.base_url;
        console.log(`设定语言支持：${langs}`);
        console.log("加载语言中.....");
        loadLanguages(langs);
        first = false;
    }
    let str = (await fse.readFile(filepath)).toString();
    let res = fm(str);
    mk.setOptions({
        renderer: new mk.Renderer(),
        highlight: (code, lang, cbk) => {
            const ret = Prism.highlight(code, Prism.languages[lang], lang);
            return ret;
        },
        pedantic: false,
        gfm: true,
        breaks: false,
        sanitize: false,
        smartLists: true,
        smartypants: false,
        xhtml: false
    });
    let content = mk(res.body);
    let html = template(fse.realpathSync(path.resolve(__dirname, "../../static/article_template.html")), {
        content: content,
        cssurl: `${baseurl}/assets/prism.css`
    });
    html = htmlProcessing(html);
    let meta = res.attributes;
    return { html, meta, raw: Buffer.from(res.body) };
}
module.exports = [{
        ext: ".md",
        transformer: transformMD,
        desc: {
            name: "Markdown转换器",
            description: "官方转换器，转换Markdown文件(.md)"
        },
        init() {
            console.log("作者:上清");
        },
        async templateContent(title, date) {
            const str = template(path.resolve(__dirname, "../../static/transformer_files/md.md"), {
                title: title,
                date: JSON.stringify(date),
                simple: "模板内容"
            });
            return Buffer.from(str);
        }
    }];
//# sourceMappingURL=transformMD.js.map