"use strict";
/**
 * 总和程序 通过commander构建
 */
Object.defineProperty(exports, "__esModule", { value: true });
const pro = require("commander");
const transform_1 = require("./transform");
const generator_1 = require("./generator");
const changesite_1 = require("./changesite");
const sitegen_1 = require("./sitegen");
const sync_1 = require("./sync");
const dev_1 = require("./dev");
const create_1 = require("./create");
const child_process_1 = require("child_process");
const watch_1 = require("./watch");
const init_1 = require("./init");
const manager_1 = require("./manager");
const utils_1 = require("./lib/utils");
//读取 全局配置文件
const globalconfig = utils_1.readGlobalConfig();
pro.command("transform <filename> [dest]")
    .description("执行转换器程序")
    .action(async (filename, dest) => {
    //生成输出文件名
    dest || (dest = filename);
    await transform_1.transformFile(filename, dest);
    console.log("转换完成");
});
pro.command("generate [refresh] [verbose]")
    .description("执行生成器程序(verbose 可选择v和verbose 不填默认不显示生成详情)")
    .action(async (refresh = "n", verbose) => {
    //使用全局配置
    const config = (await globalconfig).configName;
    let v = verbose == "v" || verbose == "verbose";
    let r = refresh == "y";
    await generator_1.default(config, v, r);
});
pro.command("changesite [sitename]")
    .description("切换网站")
    .action(async (sitename = "default") => {
    await changesite_1.default(sitename);
});
//并不等同于watch程序（watch程序中有监视articles目录和sites目录的函数）
pro.command("watch")
    .description("监视文件改动并实时生成")
    .action(async () => {
    const config = (await globalconfig).configName;
    console.log("正在监视文章改动......");
    await watch_1.default(config);
});
pro.command("sync [port]")
    .description("启动开发服务器(指定端口与配置文件）")
    .action(async (port = null) => {
    const configname = (await globalconfig).configName;
    if (port == null)
        await sync_1.default(null, configname);
    else {
        let p = parseInt(port);
        await sync_1.default(p, configname);
    }
});
pro.command("refresh")
    .description("刷新，切换网站并重新生成内容，相当于changesite与generate的组合")
    .action(async () => {
    const config = (await globalconfig).configName;
    await sitegen_1.default(config);
});
/**
 * 其中usesync 为n时 configname只用于选取要监视的网站(编译并自动复制到nowSite) usesync为y时，configname还用于给
 * sync程序指定配置文件（用于生成内容）
 */
pro.command("dev [usesync] [serverport]")
    .description("启动开发用自动编译器（开发时专用),usesync=y|n （y等同于自动执行sync命令）")
    .action(async (useserver = "y", serverport = "8080") => {
    const configname = (await globalconfig).configName;
    await dev_1.default(configname);
    //考虑在此处启动开发服务器实现自动同步site和自动生成content 以提供完整的开发体验
    if (useserver == "y") {
        console.log("正在启动同步程序...");
        let p = parseInt(serverport);
        let c = child_process_1.fork(`${__dirname}/blog.js`, ["sync", configname, serverport], {
            stdio: "pipe"
        });
        c.stdout.on("data", (str) => {
            console.log("[同步程序] ", str.toString());
        });
    }
});
const ph = require("path");
const config_1 = require("./config");
//new命令与create程序对应
pro.command("new <type> <path> <name> ")
    .description("创建文章或子类 type: a 文章 c 子类 ")
    .action(async (type, p, name) => {
    //合成相对于articles的地址
    let basepath = ph.resolve("./articles", p);
    switch (type) {
        case "a":
            await create_1.createArticle(basepath, name);
            break;
        case "c":
            await create_1.createClass(basepath, name);
            break;
        default:
            console.warn("不存在此创建类型");
            break;
    }
});
pro.command("init <dir> [autoCreateDir]")
    .description("初始化一个目录作为Blog,autoCreateDir指定是否自动创建目录(如果不存在)")
    .action(async (dirpath, autocreate = "y") => {
    let auto = autocreate == "y";
    init_1.createBlog(dirpath, auto);
});
pro.command("manage <cmd> [p1] [p2]").description("管理博客 cmd=list|add|remove|push,p1为name,p2为url")
    .action(async (cmd, p1, p2) => {
    let cmds = {
        list() {
            manager_1.listRemote();
        },
        push() {
            if (p1 != null)
                manager_1.pushToRepos(p1);
            else
                manager_1.pushUp();
        },
        add() {
            manager_1.add();
        },
        remove() {
            manager_1.remove();
        }
    };
    cmds[cmd]();
});
pro.command("config <cmd> <target> [target2]").description("管理配置文件").action((async (cmd, target, target2) => {
    let cmds = {
        add(target, target2, ...args) {
            return config_1.createConfig(target2, target);
        },
        del(target, ...args) {
            return config_1.deleteConfig(target);
        },
        use(target, ...args) {
            return config_1.useConfig(target);
        }
    };
    if (cmd in cmds == false) {
        console.log("命令错误");
        return;
    }
    await cmds[cmd](...[target, target2]);
}));
pro.command("help").description("输出帮助").action(() => pro.outputHelp());
pro.parseAsync(process.argv);
// console.log("hhhh");
//# sourceMappingURL=blog.js.map