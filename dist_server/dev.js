"use strict";
/**
 * 开发服务器 启动根目录的tsconfig.json 编译app目录的程序文件到dist_server
 *            启动Helper目录的tsconfig.json  编译Helper目录的浏览器帮助模块到 app/Helper/helpers.js
 *            启动指定配置文件指定的网站的tsconfig.json 编译其中的ts文件到js
 *            启动 yarn blog server 实时监控内容变化同步到content目录，同时实时监控配置文件配置的site目录的改动并同步到nowSite
 * 开发服务器主要用于本项目本身编写时用，若是终端用户请直接使用yarn blog server
 */
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const tscCompileOK = (outcontent) => outcontent.indexOf("Compilation complete. Watching for file changes") != -1;
const ld = require("lodash");
const fse = require("fs-extra");
function hasError(outcontent) {
    return outcontent.indexOf("error TS") != -1;
}
/**
 * 测试一行错误是否发生在nodemodules目录中
 */
function isInNodeModules(errorline) {
    // console.log(JSON.stringify(errorline));
    //此处有问题 似乎没有起到过滤nodemodules的作用
    let reg = /.*\/?node_modules\/.*/;
    let result = errorline.match(reg);
    //匹配不上说明不是在nodemodules目录中发生
    if (result == null)
        return false;
    return true;
}
const tscCompileError = (outcontent) => {
    //tsc编译器编译出错的情况
    //扫描并检测每行，记录所有错误和错误位置 错误号与 错误表述
    let errorlines = outcontent.split("\n").filter((line) => (line.indexOf("error TS") != -1));
    if (errorlines.length == 0)
        return null;
    //提取每个错误行的信息
    let errors = errorlines.map((line, i) => {
        //把每行转换为一个对象 
        let regex = /(.*)\((\d+),(\d+)\):\s*error\sTS(\d+):(.+)/;
        //1:文件 2:行 3 列 4 错误号 5 错误描述
        let result = line.match(regex);
        //初始只记录一个文件的一个point
        let info = {
            errorCode: parseInt(result[4]),
            errorDesc: result[5],
            //未来合并 此处记录一条 一个文件的一个位置
            errors: [{
                    filepath: result[1],
                    errorPoints: [[parseInt(result[2]), parseInt(result[3])]]
                }]
        };
        return info;
    });
    //合并操作 合并errorFile相同的info对象
    //此处需要groupBy函数 这里可以改变进而改变
    let conErrors = ld.groupBy(errors, (e) => e.errorCode);
    //进行融合 根据errorcode
    let result = ld.reduce(conErrors, (result, value, key) => {
        //展开一组的需要合并的信息 此处为errors数组 每个数组记录一个文件的一个位置
        //把每组中的每个元素映射到其保存的唯一一个错误信息得到一个error列表 然后根据filepath分组
        //得到一个error列表的dict key=filepath value=  filepath==key的error的数组
        let allpoints = ld.groupBy(value.map(v => v.errors[0]), v => v.filepath);
        //合并同filepath的points 把 error组的列表变为error的列表（合并组） value表示一组 key表示这组的filepath
        let ninfos = ld.reduce(allpoints, (result, value, key) => {
            //合并组 合并完成后得到一个包含有同filepath和其所有point的errorfileinfo[]
            //此处value为同filepath的info
            //本质上为把所有info中的points数组合并为一个数组
            //这里考虑把把所有info map为各自的point数组并执行flat 合并数组
            let points = value.map(v => v.errorPoints).flat();
            //创建新的info
            let ninfo = {
                filepath: key,
                errorPoints: points
            };
            result.push(ninfo);
            return result;
        }, []);
        //生成唯一的info
        let info = ld.cloneDeep(value[0]);
        info.errors = ninfos;
        //把融合的info加入结果数组
        result.push(info);
        return result;
    }, []);
    return result;
};
/**
 * 启动tsc -w 来监视一个目录的ts文件实时编译
 * @param dirpath 要监控的目录
 */
async function tscWatch(name, dirpath) {
    //pkg打包后此处仍然会使用本地的tsc   
    //需要调查detached在false时，有监听事件时，会不会被自动结束的问题
    let child = child_process_1.exec("tsc -w", {
        cwd: dirpath
    }, (error, stdout, stderr) => {
        if (error != null) {
            console.log(`${name}输出:`, stdout);
            console.log(`${name}ERROR:`, stderr);
        }
    });
    console.log(`[${name}] `, "已启动,正在等待完成......");
    ///此处等待Subject实现（rxjs）
    return new Promise((resolve) => {
        //等待输出编译完成后返回
        let outcontent = "";
        child.stdout.on("data", (chunk) => {
            //每次重新编译都会触发此检测
            //检测错误
            if (hasError(chunk)) {
                //存储chunk 到outcontent中
                let lines = chunk.split("\n");
                //分割中可能会有空行 空行会一并被记录到outcontent中
                lines.forEach(v => {
                    //每一行如果是在node modules目录中发生的则过滤掉
                    if (!isInNodeModules(v)) {
                        //不是则加到总的错误输出上 等待编译完成后统一处理输出
                        outcontent += v + "\n";
                    }
                });
            }
            if (tscCompileOK(chunk)) {
                //编译完成 统计并输出所有错误
                //表示已经启动监视
                console.log(`[${name}] `, "编译完成");
                let errors = tscCompileError(outcontent);
                if (errors != null) {
                    //输出错误
                    errors.forEach((v) => {
                        //此处考虑追加输出行列
                        console.error(`\t[${name}] `, `错误 ${v.errorCode}:${v.errorDesc} 文件数:${v.errors[0].filepath} 总位置数:${ld.sumBy(v.errors, v => v.errorPoints.length)}`);
                    });
                }
                console.log(`[${name}] `, "监视中");
                outcontent = "";
                //实际返回
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
/**
 * 启动开发监视器，进行自动项目编译部署
 * @param configname 主要用于确定“当前网站”  并对网站目录启动监视（目前为单一的tsc监视)
 */
async function dev(configname = "default") {
    console.log("正在启动处理进程......");
    let config = (await fse.readJSON(`./config/${configname}.json`));
    let sitename = config.site;
    //考虑抽离此函数作为公共工具函数
    let getsitepath = (sitename) => `./sites/${sitename}`;
    let childs = await Promise.all([
        tscWatch("App ts监视器", "."),
        tscWatch("Helper ts监视器", "./app/Helper"),
        tscWatch(`当前网站[${sitename}]`, getsitepath(sitename))
    ]);
    //等待所有任务结束 或输入q 结束所有进程
    console.log("输入ctrl+c结束所有监视任务");
}
exports.default = dev;
if (require.main == module) {
    dev();
}
