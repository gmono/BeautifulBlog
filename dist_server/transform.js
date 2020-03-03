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
const toml = require("toml");
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
//其中 yaml json toml ini 是配置文件保留格式
const transformTable = {
    ".md": transformMD,
    ".txt": transformTXT,
    ".pdf": transformPDF
};
const ld = require("lodash");
//外部使用的用于得到此程序可转换的文件类型后缀
exports.allowFileExts = ld.keys(transformTable);
//调用代理 会自动根据文件后缀名选择调用的转换器函数
//transform系列函数只负责转换数据并返回转换结果，不负责提供其他信息
async function transform(filepath, destpath, configname = "default", ...args) {
    let config = await utils_1.readConfig(configname);
    let globalconfig = await utils_1.readGlobalConfig();
    //最后传递可能的附加参数
    const ext = path.parse(filepath).ext;
    const func = transformTable[ext];
    return func(filepath, destpath, config, globalconfig, ...args);
}
async function transformTXT(filepath, destpath, config, globalconfig, ...args) {
    //转换txt文件到html txt如果没有yaml的元数据则把第一行当作标题其余元数据为null
    //txt文件的meta由同名yaml提供
    let txt = (await fse.readFile(filepath)).toString();
    //读取元数据
    let read = async (filepath) => {
        //如果不存在则把txt的第一行做标题 第二行当作时间(yyyy-MM-dd hh:mm:ss) 第三行往下当作正文
        //如果存在则把txt整个当作正文
        let meta = await readMetaFromArticle(filepath);
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
    let html = template(path.resolve(__dirname, "../static/txt_template.html"), {
        content: obj.content
    });
    //返回
    return {
        html: html,
        raw: Buffer.from(txt),
        meta: obj.meta
    };
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
/**
 * 转换pdf文件的转换函数
 * 采取直接复制pdf文件并提取元数据（当前未实现）
 * 并直接在文章页中嵌入pdf embed节点的方式处理
 */
async function transformPDF(filepath, destpath, config, globalconfig, ...args) {
    //读取pdf文件原始数据
    let raw = await fse.readFile(filepath);
    //确定复制地址 并转换为相对blog根目录的url
    const destpdf = getFileFromDest(destpath, "article.pdf");
    const pdfurl = "/" + path.relative(".", destpdf).replace(/\\/g, "/");
    //生成html
    let html = template(path.resolve(__dirname, "../static/pdf_template.html"), {
        pdfurl: pdfurl
    });
    //生成元数据
    //pdf可从配置文件中读取
    let meta = await readMetaFromArticle(filepath);
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
/**
 * 从转换结果得到content元数据
 * @param res 转换得到的结果，用于计算contentmeta
 */
async function getContentMeta(res, articlePath) {
    //从文章信息提取得到内容附加信息
    //articlePath必须存在
    if (!articlePath)
        return;
    //得到文件信息
    let articlestat = await fse.stat(articlePath);
    //去掉最前面的 ./articles
    //这里考虑去掉form_dir 此属性只在generator中有意义
    let cmeta = JSON.parse(JSON.stringify(res.meta));
    cmeta.article_length = res.raw.length;
    cmeta.content_length = res.html.length;
    //提取原始文章文件信息
    //修改时间
    cmeta.modify_time = articlestat.mtime;
    cmeta.article_path = articlePath;
    return cmeta;
}
/**
 * 读取文章的meta定义文件（同一规范 toml)
 * @param articlePathOrDestPath 给定的来源path（不带后缀名）或article文件地址
 */
async function readMetaFromArticle(articlePathOrSrcPath) {
    const metapath = utils_1.changeExt(articlePathOrSrcPath, ".toml");
    if (!(await fse.pathExists(metapath)))
        return null;
    return toml.parse((await fse.readFile(metapath)).toString());
}
/**
 * 获取附件地址
 * @param destpath 目标地址或目的文章相关文件（比如json和转换后的html文件）
 * @param filename 要获取的附件文件地址或文件名
 */
function getFileFromDest(destpath, filename) {
    return path.resolve(getFilesDir(destpath), filename);
}
exports.getFileFromDest = getFileFromDest;
/**
 * 获取附件文件夹地址
 * @param destpath 目标地址或目的文章相关文件（比如json和转换后的html文件）
 */
function getFilesDir(destpath) {
    return utils_1.changeExt(destpath, "") + ".dir";
}
exports.getFilesDir = getFilesDir;
/**
 * 把一个原始article文件转换为conent（一个html 一个元数据 以及其他文件）
 * @param srcfile 源文件名
 * @param destfilename 目的文件名（不包括扩展名）
 */
async function transformFile(srcfile, destfilename) {
    await fse.ensureDir(path.parse(destfilename).dir);
    let res = await transform(srcfile, destfilename);
    //保存基本内容
    let htmlpath = utils_1.changeExt(destfilename, ".html");
    let jsonpath = utils_1.changeExt(destfilename, ".json");
    //构建contentmeta
    let contentMeta = await getContentMeta(res, srcfile);
    await Promise.all([
        fse.writeFile(htmlpath, res.html),
        fse.writeJson(jsonpath, contentMeta)
    ]);
    //创建同名附件文件夹，保存附件文件(如果不能同名则加_files后缀)
    const dirpath = getFilesDir(destfilename);
    //由于下方有ensure保证路径存在不需要手动mkdir
    // await mkdir(dirpath);
    //写入附件 key允许带有路径 但不能以/开头
    if (res.files != null) {
        //等待所有文件写入完成
        await Promise.all(ld.map(res.files, async (value, key, obj) => {
            //去掉不合法的/
            if (key.startsWith("/"))
                key = key.slice(1);
            //合成目的文件地址
            let p = path.resolve(dirpath, key);
            //确保目的文件目录存在
            let pdir = path.parse(p).dir;
            await fse.ensureDir(pdir);
            await fse.writeFile(p, value);
        }));
    }
    return {
        res, content_meta: contentMeta
    };
}
exports.transformFile = transformFile;
if (require.main == module)
    transformFile("./articles/about.md", "./test");
//打开浏览器查看
exports.default = transform;
//# sourceMappingURL=transform.js.map