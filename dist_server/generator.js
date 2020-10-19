"use strict";
//文件生成器
Object.defineProperty(exports, "__esModule", { value: true });
//遍历articles目录 生成content目录的文章文件
//每个文章一个html内容文件和一个json信息文件（从frontmatter提取）
//content根目录有files.json 生成，保存网站的配置信息，和所有文章的索引
const walk = require("walk");
const path = require("path");
/*
 * 获取文件名 path.basename
 * 获取目录名 path.dirname
 * 获取完整信息 path.parse:{
 * root dir base ext name
 * }
 * 获取路径中除了最前面的目录的路径: getRel(path)
 * ../a/b/c->b/c
 */
function getRel(p) {
    //得到相对于第一个目录的相对路径
    let ar = p.replace(/\\/g, "/").split("/").filter((v) => v != ".").slice(1);
    let np = ar.join("/");
    // console.log(np);
    return np;
    //从 ./a/b/c ->b/c
}
/**
 * 获取contentdir的对应路径  ./a/b->{content}/b
 * @param p 原始articles目录的路径
 * @param content content目录的路径
 */
function getContentPath(p, content) {
    let np = getRel(p);
    np = np != "" ? `${content}/${np}` : content;
    return np.replace(/\\/g, "/");
}
/**
 * 获取相对于content目录的路径 {content}=./content
 * @param root 基础路径
 * @param filestat 文件
 */
function getContentFile(root, filestat) {
    //从文件信息中得到相对于content的文件完整路径
    //合成文件路径
    let apath = `${root}/${filestat.name}`;
    //获取相对于content的路径
    let cpath = getContentPath(apath, "./content");
    return cpath;
}
const utils_1 = require("./lib/utils");
/**
 * 替换content=./articles
 */
function getArticleFile(root, filestat) {
    //从文件信息中得到相对于content的文件完整路径
    //合成文件路径
    let apath = `${root}/${filestat.name}`;
    //获取相对于content的路径
    let cpath = getContentPath(apath, "./articles");
    return cpath;
}
function getUrlFile(root, filestat, base_url) {
    let url = `${root}/${filestat.name}`;
    let baseu = base_url == "/" ? "" : base_url;
    let prefix = baseu + "/content"; //相对前缀
    url = getContentPath(url, prefix);
    url = url.replace(/\\/g, "/");
    return url;
}
/**
 * 用法 articles_path|content_path|url_path ->
 * getContentFile:相对于content目录的路径
 * getArticleFile:相对于articles目录的路径
 * getUrlFile:相对于base_url的路径（可直接做为网站链接）
 */
const fs = require("fs-extra");
const transform_1 = require("./transform");
const ld = require("lodash");
const del = require("del");
const hooks_1 = require("./hooks");
/**
 *
 * @param articlemeta 元信息
 * @param from_dir 来源目录 为完整的article base目录（不包括文件名）
 * @param html 内容字符串
 * @param text 文章原文
 */
function getContentMeta(articlemeta, from_dir, html, raw, articlefile) {
    //从文章信息提取得到内容附加信息
    //去掉最前面的 ./articles
    from_dir = getRel(from_dir);
    let cmeta = JSON.parse(JSON.stringify(articlemeta));
    cmeta.from_dir = from_dir.split("/");
    cmeta.article_length = raw.length;
    cmeta.content_length = html.length;
    cmeta.modify_time = articlefile.mtime;
    return cmeta;
}
const filesjsonpath = "./content/files.json";
// console.log(ensurePath)
//ensurePath(string)->Promise
/**
 * 从articles生成content
 * @param configname 配置文件名
 * @param verbose 是否输出详细文件转换列表
 * @param refresh 是否执行全部重新生成（当前未完成）
 */
async function generate(configname = "default", verbose = false, refresh = false) {
    await fs.ensureDir("./content");
    // await ensurePath("");
    //refresh的含义是
    //1 即使存在content元数据依然执行generate 2. 即使配置文件一致依然初始化files
    if (refresh) {
        console.log("已启动全部重新生成");
    }
    /////
    const config = (await fs.readJSON(`./config/${configname}.json`));
    //获取允许的所有文件类型
    const allowFileExts = await transform_1.getAllowFileExts();
    //主函数
    let walker = walk.walk("./articles");
    //文件表 key:元数据路径  value:文章标题  key相对于content目录 后期考虑换为 相对于base_url的路径
    let files = { useConfig: configname, fileList: {} };
    //此处不缩进表示双重条件
    //不刷新才考虑加载此前的配置文件
    if (!refresh) //前缀检查写法
        if (await fs.pathExists("./content/files.json")) {
            //require基于模块路径
            let t = (await fs.readJSON("./content/files.json"));
            //如果上次生成使用的配置文件与这次不相等就维持初始化，等于全部重新生成 相等则把files初始化为上次内容
            if (t.useConfig == configname) {
                //输出提示
                console.log("配置文件一致，清洗并刷新记录数据中......");
                files = t;
            }
            else {
                //这里由于配置文件更改，files中没有记录，无法清理不存在文章
                //可以考虑全部重新生成以不出现文件碎片
                console.log("配置文件更改，刷新记录数据中...");
            }
        }
    ///读入已有的files列表，并清除其中不存在的文件
    //如果已经读入了上次的files则需要首先清除不存在的文件 然后生成缺失的和更改的文件
    //如果重新初始化则此处无用 fileList为空
    let dtasks = [];
    for (let k in files.fileList) {
        //从files中清除此项，同时删除对应的json和html文件
        //k为相对于网站的url
        //读取元数据
        let apath = files.fileList[k].article_path;
        if (await fs.pathExists(apath))
            continue;
        let cpath = getContentPath(apath, "./content");
        let hpath = utils_1.changeExt(cpath, ".html");
        let jpath = utils_1.changeExt(cpath, ".json");
        console.log("文章已删除：", hpath);
        dtasks.push(del(hpath));
        dtasks.push(del(jpath));
    }
    await Promise.all(dtasks); //等待所有任务完成
    //生成有记录文件表
    const recordedFiles = ld.map(files.fileList, (value, key, col) => {
        return path.resolve(value.article_path);
    });
    //文件记录查询函数
    const isRecorded = (articlepath) => recordedFiles.includes(path.resolve(articlepath));
    //转换每个文件
    walker.on("file", async (base, name, next) => {
        //这里应该过滤后缀名（目前允许txt md 以后应该以transformer声明的为主)
        //由于此处原因导致generate漏文件，生成不全 原因不明
        if (allowFileExts.indexOf(path.parse(name.name).ext.trim()) == -1) {
            next();
            return;
            //跳过
        }
        //生成源文件与目的文件地址
        let articlepath = getArticleFile(base, name);
        let contentpath = getContentFile(base, name);
        //去除目的文件地址的后缀名
        contentpath = utils_1.changeExt(contentpath, "");
        //内容元数据路径
        let confpath = utils_1.changeExt(contentpath, ".json");
        //生成函数 生成并写入到文件
        let generate = async () => {
            //开始转换
            let { res, content_meta: meta } = await transform_1.transformFile(articlepath, contentpath);
            //输出转换进度
            if (verbose)
                console.log(`文章:${meta.title}\n转换${articlepath}到${contentpath}`);
            //生成后记录
            CurrFileRecordToFiles(meta.title);
        };
        /**
         * 内部函数，把当前文件记录到记录到files.json
         * @param title 文章标题（一般从元数据中获取或从文章中提取）
         */
        let CurrFileRecordToFiles = (title) => {
            //记录文章记录到files.json 修bug 替换//
            let url = getUrlFile(base, name, config.base_url);
            url = utils_1.changeExt(url, ".json");
            //生成附件文件夹url
            const fdir = transform_1.getFilesDir(contentpath); //附件文件夹本地地址
            const furl = utils_1.getUrlFromPath(fdir, config.base_url); //附加文件夹基本url
            files.fileList[url] = {
                title: title,
                article_path: articlepath.replace(/\\/g, "/"),
                filesDir_url: furl
            };
        };
        /**
        * 这里需要确保如下原则：
        * * 如果refresh设为true则直接调用generate生成每篇文章
        * * 除此之外，保证只有在files列表中的文件（有记录文件）才考虑是否复用，否则直接重新生成
        * 因此使用如下两个前置检查条件
        */
        if (refresh)
            await generate();
        else if (!isRecorded(articlepath))
            await generate();
        else 
        //获取articles的时间戳 如果不存在或不同就生成并写入元数据到files.json
        if (await fs.pathExists(confpath)) {
            let amtime = name.mtime.getTime();
            //这里直接读入时date是string格式
            let meta = await fs.readJSON(getContentPath(confpath, "./content"));
            let cmtime = new Date(meta.modify_time).getTime();
            if (amtime != cmtime)
                await generate(); //如果修改时间不一样则重新生成
            else {
                ////此处导致了不调用generate函数而无法在files中保存记录的问题(如果config修改或之前的files.json文件或信息丢失则发生此问题)
                if (verbose)
                    console.log(`文章:${meta.title}:修改时间一致，跳过生成`);
                //此处从已经存在的元数据中读取title并重新记录当前文件到files.json以保证数据最新
                CurrFileRecordToFiles(meta.title);
            }
        }
        else
            await generate(); //如果元数据不存在则生成并自动记录到files.json
        next();
    });
    //等待写入完成，并调用钩子
    return new Promise((resolve, reject) => {
        walker.on("end", async () => {
            //写入files.json
            //如果已经存在就先删除
            if (await fs.pathExists(filesjsonpath)) {
                await del(filesjsonpath);
            }
            //确定是这里导致的已存在的files.json消失
            await fs.writeFile(filesjsonpath, JSON.stringify(files, null, "\t"));
            console.log("生成完毕");
            //调用钩子
            if (refresh) {
                await hooks_1.afterRefresh();
            }
            resolve();
        });
    });
}
if (require.main == module) {
    generate("default", true);
}
exports.default = generate;
//# sourceMappingURL=generator.js.map