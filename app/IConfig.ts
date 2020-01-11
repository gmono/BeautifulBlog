//声明全局配置文件的接口

export interface IConfig{
    //文章内支持的语言列表
    code_languages:string[];
    //transform测试文件输出位置
    test_url:string;
}