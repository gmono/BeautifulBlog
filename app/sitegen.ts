
import changesite from "./changesite"

//生成内容
import generate from "./generator";
import { IConfig } from "./Interface/IConfig";

async function sitegen(configname:string="default")
{
    await generate()
    let config=require(`../config/${configname}.json`) as IConfig
    await changesite(config.site);
    console.log("网站生成完成");
}
if(require.main==module)
    sitegen();

export default sitegen;
