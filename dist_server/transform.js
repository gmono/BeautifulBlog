"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformFile = exports.getFilesDir = exports.getFileFromDest = exports.readMetaFromArticle = exports.getAllowFileExts = exports.ensureTransformTable = void 0;
const fs = require("fs");
const toml = require("toml");
let readAsync = async (fpath) => {
    return new Promise((r) => {
        fs.readFile(fpath, (e, d) => {
            r(d);
        });
    });
};
const fse = require("fs-extra");
const path = require("path");
const utils_1 = require("./lib/utils");
const ld = require("lodash");
const walk = require("walk");
/**
 * 从transforms目录加载所有脚本并返回转换表
 */
async function getTransformers() {
    //此处basedir决定了从哪里加载transform，这里使用__dirname的方式
    //因此打包后是虚拟路径，如果是用nodejsapi的话，就可以工作
    //如果是基于shell命令如rm cp 之类 就无法工作
    //因此程序最好有内聚性 不要依赖其他外部程序特别是其他平台编写的程序完成功能
    //这里改成基于当前工作目录 ./transformers  这样就可以从blog目录动态加载文件
    //但不能加载ts文件只能加载转换后的js，可以考虑引用typescript包来动态编译ts
    //但如果插件在发布时编译一次就可以了 所以不做
    //在更改完成后，需要让init命令创建博客时自动复制几个基本的transformer以免到时候用户
    //没东西用 还可以考虑建立transformer市场
    //广泛的 可以建立插件市场，插件里就可有transformer
    //目前想到的最好的插件形式是目录合并
    //这样，任何可以通过blog目录文件修改做到的插件都可以做
    //如果把各种功能都做成从工作目录实时加载，就可以让插件做越来越u都的是
    //这里只能二选一 其实可以考虑联合遍历
    //这里试着 如果blog目录下的transforms目录存在 就用 不然就还用自己的
    let basedir = "./transforms";
    if (await fse.pathExists(basedir) == false)
        basedir = path.resolve(__dirname, "./transforms");
    let mon = walk.walk(basedir);
    //ext->转换函数
    let ret = {};
    //独立的装载函数 同一个文件可装载多个transformer
    //异步初始化 转载时等待init函数完成
    const loadTransformer = async (obj) => {
        //暂时取消输出
        if (ld.has(ret, obj.ext)) {
            //警告 存在文件类型重复的transformer
            console.warn("警告:存在文件类型重复的转换器脚本(已跳过加载),文件类型:", obj.ext);
            //取消加载
            return;
        }
        //加载
        //加入表中
        ret[obj.ext] = obj.transformer;
        //输出加载信息
        console.log(`转换器:${obj.desc.name}已加载,可处理 ${obj.ext} 文件`);
        //初始化
        await obj.init();
    };
    //扫描并加载transformer目录的所有脚本文件（包括子目录)
    mon.on("file", async (base, name, next) => {
        //跳过非js文件
        // console.log((path.extname(name.name)));
        if (path.extname(name.name) != ".js") {
            next();
            return;
        }
        //生成脚本文件名 加载脚本 放入表中 此处name于parse中的不同 为全名
        const jspath = path.resolve(basedir, name.name);
        //动态加载脚本 如果导出非ITransformer类型则会出错
        //未来可使用reflect metadata解决 或通过ts自带的反射库解决
        const obj = require(jspath);
        if (obj instanceof Array) {
            //这里是数组情况
            //等待所有加载任务完成
            await Promise.all(obj.map(v => loadTransformer(v)));
        }
        else {
            await loadTransformer(obj);
        }
        //调用next
        next();
    });
    //异步返回 当加载结束时调用resolve返回实际值
    return new Promise((r, j) => {
        mon.on("end", () => r(ret));
    });
}
//文章后缀名到转换器的映射表
//其中 yaml json toml ini 是配置文件保留格式
//此为Promise
let transformTable = null;
async function ensureTransformTable() {
    //保证转换器表已加载
    if (transformTable == null)
        transformTable = await getTransformers();
}
exports.ensureTransformTable = ensureTransformTable;
//外部使用的用于得到此程序可转换的文件类型后缀
// export const allowFileExts=ld.keys(transformTable);
async function getAllowFileExts() {
    await ensureTransformTable();
    return ld.keys(transformTable);
}
exports.getAllowFileExts = getAllowFileExts;
//调用代理 会自动根据文件后缀名选择调用的转换器函数
//transform系列函数只负责转换数据并返回转换结果，不负责提供其他信息
async function transform(filepath, destpath, configname = "default", ...args) {
    let config = await utils_1.readConfig(configname);
    let globalconfig = await utils_1.readGlobalConfig();
    //最后传递可能的附加参数
    const ext = path.parse(filepath).ext;
    //确保转换器加载完成
    await ensureTransformTable();
    const func = transformTable[ext];
    return func(filepath, destpath, config, globalconfig, ...args);
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
exports.readMetaFromArticle = readMetaFromArticle;
//工具函数区域
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
//主函数
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