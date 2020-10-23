export declare function createArticle(basepath: string, title: string): Promise<void>;
export declare function createClass(basepath: string, name: string): Promise<void>;
export declare function createVersion(basepath: string, name: string): Promise<void>;
export declare function createTag(basepath: string, name: string): Promise<void>;
export declare let createArticleByClasses: (classes: string[], ...args: any[]) => Promise<void>;
export declare let createClassByClasses: (classes: string[], ...args: any[]) => Promise<void>;
export declare let createVersionByClasses: (classes: string[], ...args: any[]) => Promise<void>;
export declare let createTagByClass: (classes: string[], ...args: any[]) => Promise<void>;
