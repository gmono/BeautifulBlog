//文章元信息的接口声明 这里的信息由transform直接返回

export interface IArticleMeta
{
    //这里允许配置文件自定义属性 其自动被加入到contentmeta中 可以被site读取 
    [index:string]:any;
    title:string;
    date:Date;
}