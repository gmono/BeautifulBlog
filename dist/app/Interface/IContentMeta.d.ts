import { IArticleMeta } from './IArticleMeta';
export interface IContentMeta extends IArticleMeta {
    content_length: number;
    article_length: number;
    modify_time: Date;
    article_path: string;
}
