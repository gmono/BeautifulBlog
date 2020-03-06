//files.json的格式


export interface IFiles
{
    //记录使用的哪个配置文件
    useConfig:string;
    //文件列表
    fileList:{
        [index:string]:{
            //文章标题
            title:string;
            //原始article文件的路径 原则上不可访问 仅做唯一标识使用
            article_path:string;
            //附件文件夹url
            filesDir_url:string;
        }
    }
}