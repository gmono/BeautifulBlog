import * as fse from 'fs-extra';
import { IConfig } from '../Interface/IConfig';
import path = require("path");

export function readConfig(name:string){
    return fse.readJson(path.resolve(__dirname,`../../config/${name}.json`)) as Promise<IConfig>;
}

export async function runInDir(dirpath:string,func:Function){
    const s=process.cwd()
    process.chdir(dirpath);
    await func();
    process.chdir(s);
}