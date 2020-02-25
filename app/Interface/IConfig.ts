//声明全局配置文件的接口

export interface IConfig{
    //文章内支持的语言列表
    code_languages:string[];
    //网站相对路径 如果直接在域名下 则为/
    base_url:string;
    //配置使用哪个网站 名字为保存在sites目录的文件夹名字
    site:string;
    //设置使用new创建文章时要启动用于编辑的编辑器(exe)
    editor:""
}
