"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNames = getNames;
exports.getRemote = getRemote;
exports.getRemoteList = getRemoteList;
exports.initGit = initGit;
exports.pushToRepos = pushToRepos;
exports.addRepos = addRepos;
exports.removeRepos = removeRepos;
exports.changeUserAndPass = changeUserAndPass;
exports.listRemote = listRemote;
exports.pushUp = pushUp;
exports.add = add;
exports.remove = remove;
const tslib_1 = require("tslib");
const runCommand_1 = require("./lib/runCommand");
const generator_1 = tslib_1.__importDefault(require("./generator"));
const path = tslib_1.__importStar(require("path"));
const utils_1 = require("./lib/utils");
const prompts = require("prompts");
async function getNames() {
    let res = await (0, runCommand_1.runCommand)("git", ["remote"]);
    let output = res.all;
    return output.trim().split("\n").map(v => v.trim());
}
async function getRemote(name) {
    return {
        name: name,
        url: (await (0, runCommand_1.runCommand)("git", ["remote", "get-url", name])).all
    };
}
async function getRemoteList() {
    let names = getNames();
    let res = (await names).map(v => getRemote(v));
    return Promise.all(res);
}
async function getChangeInfoText() {
    return "当前为manager提交";
}
async function initGit(dirpath) {
    console.log("开始创建git仓库");
    await (0, utils_1.runInDir)(dirpath, async () => {
        await (0, runCommand_1.runCommand)("git", ["init"], {
            stdio: "inherit",
        });
        await (0, utils_1.innerCopy)(path.resolve(__dirname, "../../static/template_gitignore.txt"), "./.gitignore");
        await (0, runCommand_1.runCommand)("git", ["add", "."], { stdio: "inherit" });
        await (0, runCommand_1.runCommand)("git", ["commit", "-m", "创建博客"], { stdio: "inherit" });
    }, null);
    console.log("创建完毕");
}
async function pushToRepos(name) {
    await (0, generator_1.default)(name);
    await (0, runCommand_1.runCommand)("git", ["add", "."]);
    await (0, runCommand_1.runCommand)("git", ["commit", "-m", await getChangeInfoText()]);
    await (0, runCommand_1.runCommand)("git", ["push", name, "master"]);
}
async function addRepos(reposname, giturl) {
    await (0, runCommand_1.runCommand)("git", ["remote", "add", reposname, giturl]);
    await (0, runCommand_1.runCommand)("git", ["push", "-u", reposname, "master"]);
}
async function removeRepos(reposname) {
    await (0, runCommand_1.runCommand)("git", ["remote", "remove", reposname]);
}
async function changeUserAndPass(name, username, password) {
}
async function listRemote() {
    console.log("发布地址列表:");
    (await getRemoteList()).forEach(v => {
        console.log(`Name:${v.name} URL:${v.url}`);
    });
}
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
    if ((0, utils_1.hasUndefined)(response, ["name", "url"]))
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
        if ((0, utils_1.hasUndefined)(response, ["username", "password"]))
            return;
        let username = userinfo.username.replace(/@/g, "%40");
        let password = userinfo.password.replace(/@/g, "%40");
        const urlwithOutProc = url.slice(8);
        url = `https://${username}:${password}${urlwithOutProc}`;
    }
    await addRepos(response.name, url);
    console.log `成功添加仓库${response.name}`;
}
async function remove(repos = null) {
    if (repos == null) {
        const reposes = (await getRemoteList()).map(v => ({ title: v.name, value: v.name }));
        const res = await prompts({
            type: "autocompleteMultiselect",
            name: "removes",
            message: "请输入要删除的仓库",
            choices: reposes
        });
        if ((0, utils_1.hasUndefined)(res, ["removes"]))
            return;
        repos = res.removes;
    }
    await Promise.all(repos.map(v => removeRepos(v)));
    console.log("删除成功");
}
if (require.main == module) {
    listRemote();
}
//# sourceMappingURL=manager.js.map