//转换器，用于把一个markdown转换为一个指定格式内容
//html内容+json对象

import * as fm from "front-matter"
import * as fs from "fs"
import * as mk from "marked"

let str=fs.readFileSync("./articles/about.md").toString();
let res=fm(str);
console.log(res);
console.log(mk(res.body));
fs.writeFileSync("./test.html",mk(res.body));