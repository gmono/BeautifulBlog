"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./lib/utils");
/**
 * site事件钩子调用代理
 * 所有程序通过给此程序通知事件，借由此程序调用对应site的事件钩子
 * 此程序明确定义所有的事件类型和事件钩子类型 数据类型等
 *
 * 本程序主要作用为对外提供事件触发机制
 * 自动生成context并调用nowSite的hooks.js文件
 */
async function getContext(configname) {
    let ret = {
        node_version: process.version,
        version: "0.6-alpha",
        config: await utils_1.readConfig(configname),
        globalConfig: await utils_1.readGlobalConfig()
    };
    return ret;
}
function getNowSiteHooks() {
    //加载nowsite的hooks.js文件并得到其导出的ISiteHooks接口对象
    //统一使用export={} 方式导出
    let obj = require("../nowSite/hooks");
    return obj;
}
//代理函数部分
//代理函数主要完成：
/**
 * 保证单实例，即nowSite的hooks函数不会同时在多个程序中执行以免引起混乱
 * 自动获取context
 * 加载nowSite的hookds对象并调用对应事件
 */
/**
 * 切换网站完成后调用
 * @param sitename 新load的网站名
 */
async function changedSite(sitename) {
}
exports.changedSite = changedSite;
/**
 *
 */
async function refresh() {
}
exports.refresh = refresh;
/**
 * 声明某个文章更改 可以是增删改
 * 程序自动合成判断类型
 * @param articlepath 更改的文章
 * @param destpath 生成目的地址（不带后缀名）
 */
async function changed(articlepath, destpath) {
}
exports.changed = changed;
//# sourceMappingURL=hooks.js.map