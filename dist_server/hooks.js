"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./lib/utils");
const fse = require("fs-extra");
const path = require("path");
/**
 * site事件钩子调用代理
 * 所有程序通过给此程序通知事件，借由此程序调用对应site的事件钩子
 * 此程序明确定义所有的事件类型和事件钩子类型 数据类型等
 *
 * 本程序主要作用为对外提供事件触发机制
 * 功能如下：
 * * 自动生成context并调用nowSite的hooks.js文件
 * * 自动让hook函数在其本目录下运行
 */
/**
 * 获取上下文信息对象
 * @param configname 当前使用的配置文件名，主要用于提供config参数
 */
const getContext = utils_1.cached(async (configname) => {
    let ret = {
        node_version: process.version,
        version: "0.6-alpha",
        config: configname == null ? null : await utils_1.readConfig(configname),
        globalConfig: await utils_1.readGlobalConfig()
    };
    return ret;
});
//site hooks对象加载函数
const getNowSiteHooks = utils_1.cached(() => {
    //加载nowsite的hooks.js文件并得到其导出的ISiteHooks接口对象
    //统一使用export={} 方式导出
    let obj = require("../nowSite/hooks");
    return obj;
});
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
    //在其本目录调用loaded钩子
    const ctx = await getContext();
    const obj = getNowSiteHooks();
    utils_1.runInDir("./nowSite", () => {
        obj.loaded(ctx);
    });
}
exports.changedSite = changedSite;
/**
 * 重新生成所有内容时调用
 *
 */
async function refresh() {
    const ctx = await getContext();
    const obj = getNowSiteHooks();
    utils_1.runInDir("./nowSite", () => {
        obj.generated(ctx);
    });
}
exports.refresh = refresh;
/**
 * 声明某个文章更改 可以是增删改
 * 程序自动合成判断类型
 * @param articlepath 更改的文章
 * @param destpath 生成目的地址（不带后缀名）
 */
async function changed(articlepath, destpath) {
    const ctx = await getContext();
    const obj = getNowSiteHooks();
    //这里通过一些方法判断更改类型
    //destpath件信息中 修改时间与创建时间一致 为创建，destpath不存在 为删除
    //如果destpath的信息中 修改时间与创建时间不一致为修改
    //destpath取元数据文件和html为观察对象
    const info = await fse.stat(`${path.resolve(destpath)}.json`);
    utils_1.runInDir("./nowSite", () => {
        //obj.articleChanged(ctx)
    });
}
exports.changed = changed;
//# sourceMappingURL=hooks.js.map