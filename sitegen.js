"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 网站生成器 生成内容并复制网站
 *
 */
var path = require("path");
var config = require("./config.json");
var spath = path.resolve("./sites", config.site);
//删除nowSite目录复制spath指向的目录并命名为nowSite 
