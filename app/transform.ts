//转换器，用于把一个markdown转换为一个指定格式内容
//html内容+json对象

import * as fm from "front-matter"
import * as fs from "fs"
import * as mk from "marked"
import * as h from "highlight.js"
import * as template from "art-template"
let readAsync=async (fpath:string)=>{
  return new Promise<Buffer>((r)=>{
    fs.readFile(fpath,(e,d)=>{
      r(d);
    })
  })
};

async function transform(filepath:string){
    
    let str=(await readAsync(filepath)).toString();
    let res=fm(str);
    // console.log(res);
    mk.setOptions({
        renderer:new mk.Renderer(),
    
        highlight: (code,lang,cbk)=>{
            return h.highlightAuto(code).value;
          },
          pedantic: false,
          gfm: true,
          breaks: false,
          sanitize: false,
          smartLists: true,
          smartypants: false,
          xhtml: false
    })
    let content=mk(res.body);
    let html=template(__dirname+"/test_transform.html",{
        content:content
    });
    return html;
  
}
fs.writeFileSync("test.html",transform("./articles/about.md"));
//打开浏览器查看

export default transform;
