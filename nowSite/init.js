import * as fs from "fs-extra"

async function main()
{
    await fs.writeJson("./记录一下.json",fs.readdir("../content"));
}
main()
