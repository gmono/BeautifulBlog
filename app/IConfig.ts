//声明全局配置文件的接口

export interface IConfig{
    //文章内支持的语言列表
    code_languages:string[];
    //网站相对路径 如果直接在域名下 则为/
    base_url:string;
}