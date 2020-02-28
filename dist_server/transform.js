"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//转换器，用于把一个markdown转换为一个指定格式内容
//html内容+json对象
const fm = require("front-matter");
const fs = require("fs");
const mk = require("marked");
// import * as h from "highlight.js"
const Prism = require("prismjs");
//这行问题导致pkg打包时运行失败
const loadLanguages = require("prismjs/components/");
// import * as config from "../config.json"
//如果使用ts加载config会直接被编译到js文件里 这里使用node加载json模块
const template = require("art-template");
let readAsync = async (fpath) => {
    return new Promise((r) => {
        fs.readFile(fpath, (e, d) => {
            r(d);
        });
    });
};
const cheerio = require("cheerio");
const fse = require("fs-extra");
const path = require("path");
const utils_1 = require("./lib/utils");
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
//文章后缀名到转换器的映射表
const transformTable = {
    ".md": transformMD
};
//调用代理 会自动根据文件后缀名选择调用的转换器函数
async function transform(filepath, configname = "default", ...args) {
    let config = await utils_1.readConfig(configname);
    let globalconfig = await utils_1.readGlobalConfig();
    //最后传递可能的附加参数
    const ext = path.parse(filepath).ext;
    const func = transformTable[ext];
    return func(filepath, config, globalconfig, ...args);
}
async function transformTXT(filepath, config, globalconfig, ...args) {
    //转换txt文件到html
    let txt = (await fse.readFile(filepath)).toString();
    let html = template(path.resolve(__dirname, "../static/txt_template.html"), {
        content: txt
    });
    //返回
}
let first = true;
let baseurl = "/";
async function transformMD(filepath, config, globalconfig, ...args) {
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
    let str = (await readAsync(filepath)).toString();
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
    let html = template(fs.realpathSync(path.resolve(__dirname, "../static/article_template.html")), {
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
if (require.main == module)
    transform("./articles/about.md").then((obj) => {
        fs.writeFileSync("test.html", obj.html);
    });
//打开浏览器查看
exports.default = transform;
//# sourceMappingURL=transform.js.map