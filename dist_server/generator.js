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
    let ar = p.replace("\\", "/").split("/").filter((v) => v != ".").slice(1);
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
    return np;
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
/**
 * 修改一个路径的扩展名并返回
 * @param fpath 文件路径
 * @param ext 扩展名 .xxx
 */
function changeExt(fpath, ext = ".html") {
    let obj = path.parse(fpath);
    obj.ext = ext;
    obj.base = obj.name + obj.ext;
    let npath = path.format(obj);
    npath = npath.replace("\\", "/");
    return npath;
}
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
    url = url.replace("\\", "/");
    return url;
}
/**
 * 用法 articles_path|content_path|url_path ->
 * getContentFile:相对于content目录的路径
 * getArticleFile:相对于articles目录的路径
 * getUrlFile:相对于base_url的路径（可直接做为网站链接）
 */
const transform_1 = require("./transform");
const fs = require("fs-extra");
const ensurePath = require("@wrote/ensure-path");
const del = require("del");
/**
 *
 * @param articlemeta 元信息
 * @param from_dir 来源目录 为完整的article base目录（不包括文件名）
 * @param html 内容字符串
 * @param text 文章原文
 */
function getContentMeta(articlemeta, from_dir, html, text, articlefile) {
    //从文章信息提取得到内容附加信息
    //去掉最前面的 ./articles
    from_dir = getRel(from_dir);
    let cmeta = JSON.parse(JSON.stringify(articlemeta));
    cmeta.from_dir = from_dir.split("/");
    cmeta.article_length = text.length;
    cmeta.content_length = html.length;
    cmeta.modify_time = articlefile.mtime;
    return cmeta;
}
// console.log(ensurePath)
//ensurePath(string)->Promise
/**
 * 从articles生成content
 * @param configname 配置文件名
 * @param verbose 是否输出详细文件转换列表
 * @param refresh 是否执行全部重新生成（当前未完成）
 */
async function generate(configname = "default", verbose = false, refresh = false) {
    const config = require(`../config/${configname}.json`);
    //主函数
    let walker = walk.walk("./articles");
    //文件表 key:元数据路径  value:文章标题  key相对于content目录 后期考虑换为 相对于base_url的路径
    let files = { useConfig: configname, fileList: {} };
    if (await fs.pathExists("./content/files.json")) {
        //require基于模块路径
        let t = require("../content/files.json");
        //如果上次生成使用的配置文件与这次不相等就维持初始化，等于全部重新生成 相等则把files初始化为上次内容
        if (files.useConfig == configname) {
            //输出提示
            console.log("增量生成模式");
            files = t;
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
        let hpath = changeExt(cpath, ".html");
        let jpath = changeExt(cpath, ".json");
        console.log("文章已删除：", hpath);
        dtasks.push(del(hpath));
        dtasks.push(del(jpath));
    }
    await Promise.all(dtasks); //等待所有任务完成
    //转换每个文件
    walker.on("file", async (base, name, next) => {
        //转换文件
        let articlepath = getArticleFile(base, name);
        let contentpath = getContentFile(base, name);
        //内容路径
        contentpath = changeExt(contentpath, ".html");
        //内容元数据路径
        let confpath = changeExt(contentpath, ".json");
        //生成函数
        let generate = async () => {
            //开始转换
            let { html, meta, text } = await transform_1.default(articlepath);
            //得到contentmeta
            let cmeta = getContentMeta(meta, base, html, text, name);
            cmeta.article_path = articlepath;
            //输出转换进度
            if (verbose)
                console.log(`文章:${meta.title}\n转换${articlepath}到${contentpath}`);
            await ensurePath(contentpath);
            fs.writeFile(contentpath, html, (e) => {
                e && console.log(e);
            });
            //写入文章元文件
            fs.writeFile(confpath, JSON.stringify(cmeta), (e) => {
                e && console.log(e);
            });
            //记录文章记录到files.json 修bug 替换//
            let url = getUrlFile(base, name, config.base_url);
            url = changeExt(url, ".json");
            files.fileList[url] = {
                title: cmeta.title,
                article_path: articlepath
            };
        };
        //获取articles的时间戳 如果不存在或不同就生成并写入元数据到files.json
        if (await fs.pathExists(confpath)) {
            let amtime = name.mtime.getTime();
            //这里直接读入时date是string格式
            let meta = require(getContentPath(confpath, "../content"));
            let cmtime = new Date(meta.modify_time).getTime();
            if (amtime != cmtime)
                await generate(); //如果修改时间不一样则重新生成
            else if (verbose)
                console.log(`文章:${meta.title}:修改时间一致，跳过生成`);
        }
        else
            await generate(); //如果元数据不存在则生成
        next();
    });
    walker.on("end", () => {
        //写入files.json
        fs.writeFile("./content/files.json", JSON.stringify(files), (e) => {
            e && console.log(e);
        });
        console.log("生成完毕");
    });
}
if (require.main == module) {
    generate("default", true);
}
exports.default = generate;
