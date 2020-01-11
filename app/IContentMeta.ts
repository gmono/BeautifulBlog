import { IArticleMeta } from './IArticleMeta';
//文章内容元信息 由转换器保存
/**
 * 包含文章的所有元信息 并同时添加了一些方便前端加载使用的信息
 */
export interface IContentMeta extends IArticleMeta{
    //主要用于显示时间日期
    datetime_str:{
        date:string;
        time:string;
        datetime:string;
    };
    time_order:{
        //主要用于排序 为date.getTime()得到
        time_ticks:number;
        //年月日
        year:number;
        month:number;
        day:number;
        //星期几
        wday:number;

    };
    //保存来源目录层次 相对articles目录
    from_dir:string[];
    //html长度
    content_length:number;
    //文章字数
    article_length:number;
    

}