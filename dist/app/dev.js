"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const tscCompileOK = (outcontent) => outcontent.indexOf("Watching for file changes.") != -1;
const ld = require("lodash");
const fse = require("fs-extra");
function hasError(outcontent) {
    return outcontent.indexOf("error TS") != -1;
}
function isInNodeModules(errorline) {
    let reg = /.*\/?node_modules\/.*/;
    let result = errorline.match(reg);
    if (result == null)
        return false;
    return true;
}
const tscCompileError = (outcontent) => {
    let errorlines = outcontent.split("\n").filter((line) => (line.indexOf("error TS") != -1));
    if (errorlines.length == 0)
        return null;
    let errors = errorlines.map((line, i) => {
        let fileer_regex = /(.*)\((\d+),(\d+)\):\s*error\sTS(\d+):(.+)/;
        let syser_regex = /\s*error\sTS(\d+):(.+)/;
        let result = line.match(fileer_regex);
        if (result == null)
            return null;
        let info = {
            errorCode: parseInt(result[4]),
            errorDesc: result[5],
            errors: [{
                    filepath: result[1],
                    errorPoints: [[parseInt(result[2]), parseInt(result[3])]]
                }]
        };
        return info;
    }).filter(v => v != null);
    let conErrors = ld.groupBy(errors, (e) => e.errorCode);
    let result = ld.reduce(conErrors, (result, value, key) => {
        let allpoints = ld.groupBy(value.map(v => v.errors[0]), v => v.filepath);
        let ninfos = ld.reduce(allpoints, (result, value, key) => {
            let points = value.map(v => v.errorPoints).flat();
            let ninfo = {
                filepath: key,
                errorPoints: points
            };
            result.push(ninfo);
            return result;
        }, []);
        let info = ld.cloneDeep(value[0]);
        info.errors = ninfos;
        result.push(info);
        return result;
    }, []);
    return result;
};
async function tscWatch(name, dirpath) {
    let child = child_process_1.exec("tsc -w", {
        cwd: dirpath
    }, (error, stdout, stderr) => {
        if (error != null) {
            console.log(`${name}输出:`, stdout);
            console.log(`${name}ERROR:`, stderr);
        }
    });
    console.log(`[${name}] `, "已启动,正在等待完成......");
    return new Promise((resolve) => {
        let outcontent = "";
        child.stdout.on("data", (chunk) => {
            if (hasError(chunk)) {
                let lines = chunk.split("\n");
                lines.forEach(v => {
                    if (!isInNodeModules(v)) {
                        outcontent += v + "\n";
                    }
                });
            }
            if (tscCompileOK(chunk)) {
                console.log(`[${name}] `, "编译完成");
                let errors = tscCompileError(outcontent);
                if (errors != null) {
                    errors.forEach((v) => {
                        console.error(`\t[${name}] `, `错误 ${v.errorCode}:${v.errorDesc} 文件数:${v.errors[0].filepath} 总位置数:${ld.sumBy(v.errors, v => v.errorPoints.length)}`);
                    });
                }
                console.log(`[${name}] `, "监视中");
                outcontent = "";
                resolve(child);
            }
        });
        child.stderr.on("data", (c) => {
            console.log(`[${name}] `, `错误:`, c);
        });
        child.on("close", (code, signal) => {
            console.log(`[${name}] `, "已退出", `退出代码${code}`);
        });
    });
}
async function dev(configname = "default") {
    const allowvers = ["3.8.2", "2.6.4"];
    const ver = child_process_1.execSync("tsc -v").toString();
    console.log("typescript 版本", ver);
    if (allowvers.filter(v => ver.indexOf(v) != -1).length == 0) {
        const desc = allowvers.reduce((prev, curr) => `${prev}\n${curr}`);
        console.log(`正在使用未经测试的typescript版本,测试通过版本:${desc}\n`);
    }
    console.log("正在启动处理进程......");
    let config = (await fse.readJSON(`./config/${configname}.json`));
    let sitename = config.site;
    let getsitepath = (sitename) => `./sites/${sitename}`;
    let childs = await Promise.all([
        tscWatch("App ts监视器", "."),
        tscWatch("Helper ts监视器", "./app/Helper"),
        tscWatch(`当前网站[${sitename}]`, getsitepath(sitename))
    ]);
    console.log("输入ctrl+c结束所有监视任务");
}
exports.default = dev;
if (require.main == module) {
    dev();
}
//# sourceMappingURL=dev.js.map