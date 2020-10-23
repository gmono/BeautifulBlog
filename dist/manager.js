"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.add = exports.pushUp = exports.listRemote = exports.changeUserAndPass = exports.removeRepos = exports.addRepos = exports.pushToRepos = exports.initGit = exports.getRemoteList = exports.getRemote = exports.getNames = void 0;
const execa = require("execa");
const generator_1 = require("./generator");
const path = require("path");
const utils_1 = require("./lib/utils");
const prompts = require("prompts");
async function getNames() {
    let res = await execa("git remote", { all: true });
    let output = res.all;
    return output.trim().split("\n").map(v => v.trim());
}
exports.getNames = getNames;
async function getRemote(name) {
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
    return "当前为manager提交";
}
async function initGit(dirpath) {
    console.log("开始创建git仓库");
    await utils_1.runInDir(dirpath, async () => {
        await execa("git init", {
            stdio: "inherit",
        });
        await utils_1.innerCopy(path.resolve(__dirname, "../static/template_gitignore.txt"), "./.gitignore");
        await execa("git add .", { stdio: "inherit" });
        await execa(`git commit -m "创建博客" `, { stdio: "inherit" });
    }, null);
    console.log("创建完毕");
}
exports.initGit = initGit;
async function pushToRepos(name) {
    await generator_1.default(name);
    await execa("git add .");
    await execa(`git commit -m "${await getChangeInfoText()}"`);
    await execa(`git push ${name} master`);
}
exports.pushToRepos = pushToRepos;
async function addRepos(reposname, giturl) {
    await execa(`git remote add ${reposname} ${giturl}`);
    await execa(`git push -u ${reposname} master`);
}
exports.addRepos = addRepos;
async function removeRepos(reposname) {
    await execa(`git remove ${reposname}`);
}
exports.removeRepos = removeRepos;
async function changeUserAndPass(name, username, password) {
}
exports.changeUserAndPass = changeUserAndPass;
async function listRemote() {
    console.log("发布地址列表:");
    (await getRemoteList()).forEach(v => {
        console.log(`Name:${v.name} URL:${v.url}`);
    });
}
exports.listRemote = listRemote;
async function pushUp() {
    const allrepos = await getRemoteList();
    let allc = allrepos.map(v => ({ title: v.name, value: v.name }));
    let choices = [{ title: "所有", value: "all" }];
    choices.push(...allc);
    const res = await prompts({
        type: "autocompleteMultiselect",
        name: "select",
        message: "请选择你要提交到的仓库",
        choices: choices,
        initial: "all"
    });
    if (res.select == undefined)
        return;
    if (res.select == "all") {
        const tasks = allrepos.map(v => v.name).map(v => pushToRepos(v));
        await Promise.all(tasks);
    }
    else {
        await pushToRepos(res.select);
    }
}
exports.pushUp = pushUp;
async function add() {
    const response = await prompts([{
            type: "text",
            name: "name",
            message: "请输入Remote仓库名:"
        }, {
            type: "text",
            name: "url",
            message: "请输入Remote仓库地址(GIT地址):"
        }]);
    if (utils_1.hasUndefined(response, ["name", "url"]))
        return;
    let url = response.url.trim();
    if (url.startsWith("https://")) {
        const userinfo = await prompts([{
                type: "text",
                name: "username",
                message: "请输入用户名:"
            }, {
                type: "password",
                name: "password",
                message: "请输入密码:"
            }]);
        if (utils_1.hasUndefined(response, ["username", "password"]))
            return;
        let username = userinfo.username.replace(/@/g, "%40");
        let password = userinfo.password.replace(/@/g, "%40");
        const urlwithOutProc = url.slice(8);
        url = `https://${username}:${password}${urlwithOutProc}`;
    }
    await addRepos(response.name, url);
    console.log `成功添加仓库${response.name}`;
}
exports.add = add;
async function remove(repos = null) {
    if (repos == null) {
        const reposes = (await getRemoteList()).map(v => ({ title: v.name, value: v.name }));
        const res = await prompts({
            type: "autocompleteMultiselect",
            name: "removes",
            message: "请输入要删除的仓库",
            choices: reposes
        });
        if (utils_1.hasUndefined(res, ["removes"]))
            return;
        repos = res.removes;
    }
    await Promise.all(repos.map(v => removeRepos(v)));
    console.log("删除成功");
}
exports.remove = remove;
if (require.main == module) {
    listRemote();
}
//# sourceMappingURL=manager.js.map