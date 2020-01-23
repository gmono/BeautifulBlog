"use strict";
/**
 * 总和程序 通过commander构建
 */
Object.defineProperty(exports, "__esModule", { value: true });
const pro = require("commander");
const transform_1 = require("./transform");
const path = require("path-extra");
const fs = require("fs-extra");
const generator_1 = require("./generator");
const changesite_1 = require("./changesite");
const sitegen_1 = require("./sitegen");
const server_1 = require("./server");
pro.command("transform <filename> [dest]")
    .description("执行转换器程序")
    .action(async (filename, dest) => {
    let res = await transform_1.default(filename);
    //生成输出文件名
    dest || (dest = filename);
    let hpath = path.replaceExt(dest, ".html");
    let mpath = path.replaceExt(dest, ".json");
    await Promise.all([fs.writeFile(hpath, res.html),
        fs.writeFile(mpath, res.meta)]);
    console.log("转换完成");
});
pro.command("generate [configname] [verbose]")
    .description("执行生成器程序(verbose 可选择v和verbose 不填默认不显示生成详情)")
    .action(async (config, verbose) => {
    let v = verbose == "v" || verbose == "verbose";
    await generator_1.default(config, v);
});
pro.command("changesite [sitename]")
    .description("切换网站")
    .action(async (sitename = "default") => {
    await changesite_1.default(sitename);
});
pro.command("watch [configname]")
    .description("监视文件改动并实时生成")
    .action(async (configname) => {
    await sitegen_1.default(configname);
});
pro.command("server [port]")
    .description("启动开发服务器（未完成）")
    .action(async (port = "8080") => {
    let p = parseInt(port);
    await server_1.default(p);
});
pro.command("help").description("输出帮助").action(() => pro.outputHelp());
pro.parseAsync(process.argv);
