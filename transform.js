"use strict";
//转换器，用于把一个markdown转换为一个指定格式内容
//html内容+json对象
Object.defineProperty(exports, "__esModule", { value: true });
var fm = require("front-matter");
var fs = require("fs");
var mk = require("marked");
var str = fs.readFileSync("./articles/about.md").toString();
var res = fm(str);
console.log(res);
console.log(mk(res.body));
fs.writeFileSync("./test.html", mk(res.body));
