
import copysite from "./changesite"

//生成内容
import generate from "./generator";
import { IConfig } from "./Interface/IConfig";

async function main()
{
    await generate()
    let config=require("./config.json") as IConfig
    await copysite(config.site);
    console.log("网站生成完成");
}
main();