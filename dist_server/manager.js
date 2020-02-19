"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function getRemoteList() {
    return Promise.all((await getNames()).map(v => getRemote(v)));
}
exports.getRemoteList = getRemoteList;
let lst = {
    "测试": "http://helloworld",
    "hello": "http://baidu.com"
};
const ld = require("lodash");
async function getNames() {
    return ld.keys(lst);
}
exports.getNames = getNames;
//临时如此 实际使用时类型为
async function getRemote(name) {
    return { name: name, url: lst[name] };
}
exports.getRemote = getRemote;
/**
 * 显示所有可用的RemoteItem
 */
async function listRemote() {
    console.log("发布地址列表:");
    (await getRemoteList()).forEach(v => {
        console.log(`Name:${v.name} URL:${v.url}`);
    });
}
exports.listRemote = listRemote;
async function addRemote(name, url) {
}
exports.addRemote = addRemote;
async function removeRemote(name) {
}
exports.removeRemote = removeRemote;
async function pushToRemote(name) {
    let push = async (url) => {
        //提交到url
    };
    if (name != null) {
        await push((await getRemote(name)).url);
        console.log(`成功提交到:${name}`);
    }
    else {
        //提交到所有
        (await getRemoteList()).map(v => ({ name: v.name, res: push(v.url) })).forEach(async (v) => {
            await v.res;
            console.log(`成功提交到:${v.name}`);
        });
    }
}
exports.pushToRemote = pushToRemote;
//# sourceMappingURL=manager.js.map