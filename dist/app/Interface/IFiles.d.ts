export interface IFiles {
    useConfig: string;
    fileList: {
        [index: string]: {
            title: string;
            article_path: string;
            filesDir_url: string;
        };
    };
}
