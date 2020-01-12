"use strict";
//文件生成器
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
Object.defineProperty(exports, "__esModule", { value: true });
//遍历articles目录 生成content目录的文章文件
//每个文章一个html内容文件和一个json信息文件（从frontmatter提取）
//content根目录有files.json 生成，保存网站的配置信息，和所有文章的索引
var walk = require("walk");
var path = require("path");
/*
 * 获取文件名 path.basename
 * 获取目录名 path.dirname
 * 获取完整信息 path.parse:{
 * root dir base ext name
 * }
 * 获取路径中除了最前面的目录的路径: getRel(path)
 */
function getRel(p) {
    //得到相对于第一个目录的相对路径
    var ar = p.replace("\\", "/").split("/").filter(function (v) { return v != "."; }).slice(1);
    var np = ar.join("/");
    // console.log(np);
    return np;
    //从 ./a/b/c ->b/c
}
/**
 * 获取contentdir的对应路径
 * @param p 原始articles目录的路径
 * @param content content目录的路径
 */
function getContentPath(p, content) {
    var np = getRel(p);
    np = np != "" ? content + "/" + np : content;
    return np;
}
function getContentFile(root, filestat) {
    //从文件信息中得到相对于content的文件完整路径
    //合成文件路径
    var apath = root + "/" + filestat.name;
    //获取相对于content的路径
    var cpath = getContentPath(apath, "./content");
    return cpath;
}
function changeExt(fpath, ext) {
    if (ext === void 0) { ext = ".html"; }
    var obj = path.parse(fpath);
    obj.ext = ext;
    obj.base = obj.name + obj.ext;
    var npath = path.format(obj);
    return npath;
}
function getArticleFile(root, filestat) {
    //从文件信息中得到相对于content的文件完整路径
    //合成文件路径
    var apath = root + "/" + filestat.name;
    //获取相对于content的路径
    var cpath = getContentPath(apath, "./articles");
    return cpath;
}
var transform_1 = require("./transform");
var fs = require("fs");
var ensurePath = require("@wrote/ensure-path");
var format = require("dateformat");
var IDirMeta_1 = require("./IDirMeta");
/**
 *
 * @param articlemeta 元信息
 * @param from_dir 来源目录 为完整的article base目录（不包括文件名）
 * @param html 内容字符串
 * @param text 文章原文
 */
function getContentMeta(articlemeta, from_dir, html, text) {
    //从文章信息提取得到内容附加信息
    //去掉最前面的 ./articles
    from_dir = getRel(from_dir);
    var cmeta = JSON.parse(JSON.stringify(articlemeta));
    cmeta.datetime_str = {
        date: format(articlemeta.date, "yyyy-mm-dd"),
        datetime: format(articlemeta.date, "yyyy-mm-dd hh:mm:ss"),
        time: format(articlemeta.date, "hh:mm:ss")
    };
    cmeta.time_order = {
        time_ticks: articlemeta.date.getTime(),
        year: articlemeta.date.getFullYear(),
        month: articlemeta.date.getMonth(),
        day: articlemeta.date.getDate(),
        wday: articlemeta.date.getDay()
    };
    cmeta.from_dir = from_dir.split("/");
    cmeta.article_length = text.length;
    cmeta.content_length = html.length;
    return cmeta;
}
var config = require("./config.json");
// console.log(ensurePath)
//ensurePath(string)->Promise
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        var walker, dirtable;
        return __generator(this, function (_a) {
            walker = walk.walk("./articles");
            dirtable = {};
            walker.on("directories", function (base, names, next) {
                //前置 生成各种路径 以及确保存在表项
                var tbase = getContentPath(base, "./content");
                if (!(tbase in dirtable)) {
                    //记录
                    dirtable[tbase] = IDirMeta_1.newDirMeta();
                }
                //相对baseurl的路径（内容)
                var curl = config.base_url + "content";
                //添加
                var obj = dirtable[tbase];
                obj.dirs = {};
                try {
                    for (var names_1 = __values(names), names_1_1 = names_1.next(); !names_1_1.done; names_1_1 = names_1.next()) {
                        var v = names_1_1.value;
                        //得到目录相对于content的目录
                        var contpath = getContentFile(base, v);
                        //得到相对于baseurl的path
                        obj.dirs[v.name] = getContentPath(contpath, curl);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (names_1_1 && !names_1_1.done && (_a = names_1.return)) _a.call(names_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                obj.num_dirs = names.length;
                obj.self_path = getContentPath(base, curl);
                next();
                var e_1, _a;
            });
            walker.on("file", function (base, names, next) { return __awaiter(_this, void 0, void 0, function () {
                var articlepath, contentpath, _a, html, meta, text, cmeta, confpath, tbase, curl;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            articlepath = getArticleFile(base, names);
                            contentpath = getContentFile(base, names);
                            contentpath = changeExt(contentpath);
                            console.log(articlepath, contentpath);
                            return [4 /*yield*/, transform_1.default(articlepath)];
                        case 1:
                            _a = _b.sent(), html = _a.html, meta = _a.meta, text = _a.text;
                            cmeta = getContentMeta(meta, base, html, text);
                            //输出转换进度
                            console.log("\u6587\u7AE0:" + meta.title + "\n\u8F6C\u6362" + articlepath + "\u5230" + contentpath);
                            return [4 /*yield*/, ensurePath(contentpath)];
                        case 2:
                            _b.sent();
                            fs.writeFile(contentpath, html, function (e) {
                                e && console.log(e);
                            });
                            confpath = changeExt(contentpath, ".json");
                            fs.writeFile(confpath, JSON.stringify(cmeta), function (e) {
                                e && console.log(e);
                            });
                            tbase = getContentPath(base, "./content");
                            if (!(tbase in dirtable)) {
                                //记录
                                dirtable[tbase] = IDirMeta_1.newDirMeta();
                            }
                            curl = config.base_url + "content";
                            dirtable[tbase].self_path = getContentPath(base, curl);
                            //不带后缀名的 
                            dirtable[tbase].files[names.name] = {
                                path: getContentPath(confpath, curl),
                                title: meta.title,
                                contentpath: getContentPath(contentpath, curl)
                            };
                            next();
                            return [2 /*return*/];
                    }
                });
            }); });
            walker.on("end", function () {
                //写入dirmetafadsf
                console.log("fadf");
                for (var k in dirtable) {
                    fs.writeFile(k + "/files.json", JSON.stringify(dirtable[k]), function (e) { return console.log(e); });
                }
            });
            return [2 /*return*/];
        });
    });
}
main();
