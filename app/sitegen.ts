
import changesite from "./changesite"

//生成内容
import generate from "./generator";
import { IConfig } from "./Interface/IConfig";
import * as fse from 'fs-extra';
import del = require("del");

async function sitegen(configname:string="default")
{
    //临时全部重新生成处理策略
    del("./content");
    await generate()
    let config=(await fse.readJSON(`./config/${configname}.json`)) as IConfig
    await changesite(config.site);
    console.log("全部刷新完成");
}
if(require.main==module)
    sitegen();

export default sitegen;
