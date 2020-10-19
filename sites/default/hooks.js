"use strict";
//钩子系统 会被server端程序调用 当
///aaa
var Hooks = /** @class */ (function () {
    function Hooks() {
        //脚本执行路径 一般为{blogPath}/nowSite
        this.basepath = null;
    }
    Hooks.prototype.init = function (basepath, context) {
        this.basepath = basepath;
    };
    Hooks.prototype.beforeUnload = function (context) {
        console.log("正在切换出默认主题");
    };
    Hooks.prototype.install = function (context, installName) {
        // throw new Error("Method not implemented.");
        console.log("安装，默认主题？");
    };
    Hooks.prototype.uninstall = function (context, installName) {
        console.log("卸载：默认主题");
    };
    Hooks.prototype.loaded = function (context) {
        console.log("默认主题，瞎几把写的，将就着用吧.");
    };
    Hooks.prototype.generated = function (context) {
        console.log("\u751F\u6210\u6587\u7AE0\u4E86\uFF0C\u5DF2\u7ECF\uFF0C\u8FD9\u91CC\u53EF\u4EE5\u5199\u4E00\u4E9B\u4EE3\u7801\uFF0C\u6BD4\u5982\u628A\u6587\u7AE0\u81EA\u52A8\u52A0\u968F\u5373\u914D\u56FE\u7136\u540E\u653E\u5230\u4E3B\u9875" + context.version);
    };
    Hooks.prototype.articleChanged = function (context, type, dest) {
        console.log("文章更改，这时候网站应该立刻响应，如果没事就算了 当然");
    };
    return Hooks;
}());
module.exports = new Hooks();
