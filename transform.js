"use strict";
//转换器，用于把一个markdown转换为一个指定格式内容
//html内容+json对象
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
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var fm = require("front-matter");
var fs = require("fs");
var mk = require("marked");
// import * as h from "highlight.js"
var Prism = require("prismjs");
var loadLanguages = require("prismjs/components/");
// import * as config from "../config.json"
//如果使用ts加载config会直接被编译到js文件里 这里使用node加载json模块
var config = require("./config.json");
var langs = config.code_languages;
//加载语言高亮支持
console.log("\u8BBE\u5B9A\u8BED\u8A00\u652F\u6301\uFF1A" + langs);
console.log("加载语言中.....");
loadLanguages(langs);
var template = require("art-template");
var readAsync = function (fpath) { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (r) {
                fs.readFile(fpath, function (e, d) {
                    r(d);
                });
            })];
    });
}); };
var cheerio = require("cheerio");
function htmlProcessing(html) {
    //解析html并在code的pre标签添加class
    var $ = cheerio.load(html);
    var codeblocks = $("code[class]");
    codeblocks.each(function (i, e) {
        //对每个code节点
        var parent = $(e).parent("pre");
        parent.attr("class", ($(e).attr("class")));
    });
    return $.html();
}
function transform(filepath) {
    return __awaiter(this, void 0, void 0, function () {
        var str, res, content, html, meta;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, readAsync(filepath)];
                case 1:
                    str = (_a.sent()).toString();
                    res = fm(str);
                    // console.log(res);
                    mk.setOptions({
                        renderer: new mk.Renderer(),
                        highlight: function (code, lang, cbk) {
                            var ret = Prism.highlight(code, Prism.languages[lang], lang);
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
                    content = mk(res.body);
                    html = template(__dirname + "/test_transform.html", {
                        content: content
                    });
                    //添加html处理
                    html = htmlProcessing(html);
                    meta = res.attributes;
                    return [2 /*return*/, { html: html, meta: meta, text: res.body }];
            }
        });
    });
}
fs.writeFileSync("test.html", transform("./articles/about.md"));
//打开浏览器查看
exports.default = transform;
