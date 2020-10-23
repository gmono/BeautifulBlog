import { IConfig } from "../Interface/IConfig";
import { IGlobalConfig } from '../Interface/IGlobalConfig';
import { TransformResult, ITransformer, TransformerExports } from '../Interface/IS_Transform';
import { readMetaFromArticle } from '../transform';
import * as fse from 'fs-extra';
import * as template from "art-template";
import path = require("path");
import dateFormat = require("dateformat");
async function transformTXT(filepath: string, destpath: string, config: IConfig, globalconfig: IGlobalConfig, ...args) {
  //转换txt文件到html txt如果没有yaml的元数据则把第一行当作标题其余元数据为null
  //txt文件的meta由同名yaml提供
  let txt = (await fse.readFile(filepath)).toString();
  //读取元数据
  let read = async (filepath: string) => {
    //如果不存在则把txt的第一行做标题 第二行当作时间(yyyy-MM-dd hh:mm:ss) 第三行往下当作正文
    //如果存在则把txt整个当作正文
    let meta = await readMetaFromArticle(filepath);
    if (meta == null) {
      meta = {
        title: txt.split("\n")[0],
        date: new Date(txt.split("\n")[1])
      };
      txt = txt.split("\n").slice(2).join("\n");
    }
    //返回元数据与正文
    return {
      meta: meta,
      content: txt
    };
  };
  //读取
  let obj = await read(filepath);
  let html = template(path.resolve(__dirname, "../../../static/txt_template.html"), {
    content: obj.content
  }) as string;
  //返回
  return <TransformResult>{
    html: html,
    raw: Buffer.from(txt),
    meta: obj.meta
  };
}

export=<TransformerExports>{
  ext:".txt",
  transformer:transformTXT,
  desc:{
    name:"Txt转换器",
    description:`官方转换器，转换TXT文件(.txt),可添加toml格式元数据配置（配置标题等）
否则自动以第一行为标题，第二行为时间`
  },
  init(){
    console.log("作者:上清");
  },
  async templateContent(title,date){
    //返回模板
    const str= template(path.resolve(__dirname,"../../../static/transformer_files/md.md"),{
      title:title,
      date:dateFormat(date,"yyyy-mm-dd hh:MM:ss"),
      simple:"模板内容"
    });
    return Buffer.from(str);
  }
}