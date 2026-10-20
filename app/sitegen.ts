
import changesite from "./changesite"

//生成内容
import generate from "./generator";
import { IConfig } from "./Interface/IConfig";
import * as fse from 'fs-extra';

async function sitegen(configname:string="default")
{
    // 强制重新处理文章，但采用非破坏式刷新，避免主题切换失败清空旧内容。
    await generate(configname, false, true)
    let config=(await fse.readJSON(`./config/${configname}.json`)) as IConfig
    await changesite(config.site);
    console.log("全部刷新完成");
}
if(require.main==module)
    sitegen();

export default sitegen;
