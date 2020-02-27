"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const execa = require("execa");
async function getNames() {
    //执行git remote
    //all表示要手机process的所有输出
    let res = await execa("git remote", { all: true });
    let output = res.all;
    return output.trim().split("\n").map(v => v.trim());
}
exports.getNames = getNames;
//临时如此 实际使用时类型为
async function getRemote(name) {
    //执行 git remote 和 git remote get-url
    return {
        name: name,
        url: (await execa(`git remote get-url ${name}`, { all: true })).all
    };
}
exports.getRemote = getRemote;
async function getRemoteList() {
    let names = getNames();
    let res = (await names).map(v => getRemote(v));
    return Promise.all(res);
}
exports.getRemoteList = getRemoteList;
/**
 * 列出所有仓库
 */
async function listRemote() {
    console.log("发布地址列表:");
    (await getRemoteList()).forEach(v => {
        console.log(`Name:${v.name} URL:${v.url}`);
    });
}
exports.listRemote = listRemote;
async function pushToRemote(name) {
    let push = async (name) => {
        //提交到url
    };
    if (name != null) {
        //提交到单个仓库
        await push((await getRemote(name)).url);
        console.log(`成功提交到:${name}`);
    }
    else {
        //提交到所有仓库
        (await getRemoteList()).map(v => ({ name: v.name, res: push(v.url) })).forEach(async (v) => {
            await v.res;
            console.log(`成功提交到:${v.name}`);
        });
    }
}
exports.pushToRemote = pushToRemote;
//# sourceMappingURL=manager.js.map