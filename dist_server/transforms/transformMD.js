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
    //解析html并在code的pre标签添加class
    let $ = cheerio.load(html);
    let codeblocks = $("code[class]");
    codeblocks.each((i, e) => {
        //对每个code节点
        let parent = $(e).parent("pre");
        parent.attr("class", ($(e).attr("class")));
    });
    return $.html();
}
let first = true;
let baseurl = "/";
async function transformMD(filepath, destpath, config, globalconfig, ...args) {
    if (first) {
        //加载配置文件并加载语法高亮
        let langs = config.code_languages;
        //处理当作root作为baseurl时的问题
        baseurl = config.base_url == "/" ? "" : config.base_url;
        //加载语言高亮支持
        console.log(`设定语言支持：${langs}`);
        console.log("加载语言中.....");
        loadLanguages(langs);
        first = false;
    }
    let str = (await fse.readFile(filepath)).toString();
    let res = fm(str);
    // console.log(res);
    mk.setOptions({
        renderer: new mk.Renderer(),
        highlight: (code, lang, cbk) => {
            const ret = Prism.highlight(code, Prism.languages[lang], lang);
            // console.log(ret)
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
    //实际内容
    let content = mk(res.body);
    //模板化 改为相对于程序文件的目录（加载静态资源）
    let html = template(fse.realpathSync(path.resolve(__dirname, "../../static/article_template.html")), {
        content: content,
        cssurl: `${baseurl}/assets/prism.css`
    });
    //添加html处理
    html = htmlProcessing(html);
    //提取文章元信息
    let meta = res.attributes;
    /**
     * 分别为 html内容
     * 文章元数据
     * 文章markdown原文
     */
    return { html, meta, raw: Buffer.from(res.body) };
}
module.exports = {
    ext: ".md",
    transformer: transformMD
};
//# sourceMappingURL=transformMD.js.map