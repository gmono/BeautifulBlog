"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const execa = require("execa");
const generator_1 = require("./generator");
const changesite_1 = require("./changesite");
const utils_1 = require("./lib/utils");
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
async function getChangeInfoText() {
    //获取更改信息文本 主要用于合成提交消息
    //这里需要generator和watch等程序做log操作 因此这里展示只返回固定的消息
    return "更新文章";
}
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
/**
 * 用于初始化一个blog的git相关内容
 * 包括 创建仓库 初次提交和push（包括设置trach branch)  创建.gitignore
 * 此函数执行后blog才可以进行后续manage操作
 */
async function initGit(dirpath) {
    console.log("开始创建git仓库");
    //创建git仓库
    await utils_1.runInDir(dirpath, async () => {
        // console.log(process.cwd())
        await execa("git init", {
            stdio: "inherit",
        });
        ////此处需要添加复制.gitignore的操作
        await execa("git add .", { stdio: "inherit" });
        await execa(`git commit -m "创建博客" `, { stdio: "inherit" });
        ////此处需要添加初次提交操作
    });
    console.log("创建完毕");
}
exports.initGit = initGit;
/**
 * 提交到某个仓库
 * @param name 仓库名
 */
async function pushToRemote(name) {
    let push = async (name) => {
        //提交到某个仓库 generate changesite add commit push 一条龙
        //自动读取名称相同的配置文件
        await generator_1.default(name);
        const config = await utils_1.readConfig(name);
        await changesite_1.default(config.site);
        //add 由于存在默认的.gitignore 会自动跳过添加articles sites config目录
        await execa("git add .");
        //合成提交消息
        await execa(`git commit -m "${await getChangeInfoText()}"`);
        //此处只提供提交到master分支 假设已经设置了trach branch
        await execa(`git push ${name} master`);
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