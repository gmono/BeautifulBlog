//目录的files.json匹配的元数据定义


export interface IDirMeta
{
    //子目录列表
    num_dirs:number;
    //目录名->目录路径
    dirs:{[index:string]:string};
    num_files:number;
    //本目录的文章列表; 文件名(原始markdown文件名)
    files:{[index:string]:{
        title:string;
        //指向文章的元数据 路径
        path:string;
        //指向文章的内容路径
        contentpath:string;
    }};
    //本目录和下级目录的所有文章
    all_files:{
        title:string;
        path:string;
    }[];
    //总字数
    all_words:number;
    //自己的路径
    self_path:string;
}

export function newDirMeta(){
    return {
        dirs:{},
        files:{},
        all_files:{},
        all_words:0,
        self_path:"",
        num_dirs:0,
        num_files:0
    } as IDirMeta;
}
