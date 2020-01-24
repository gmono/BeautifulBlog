//files.json的格式


export interface IFiles
{
    //记录使用的哪个配置文件
    useConfig:string;
    fileList:{
        [index:string]:{
            title:string,
            article_path:string
        }
    }
}