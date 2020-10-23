declare type RemoteItem = {
    name: string;
    url: string;
};
export declare function getNames(): Promise<string[]>;
export declare function getRemote(name: string): Promise<RemoteItem>;
export declare function getRemoteList(): Promise<RemoteItem[]>;
export declare function initGit(dirpath: string): Promise<void>;
export declare function pushToRepos(name: string): Promise<void>;
export declare function addRepos(reposname: string, giturl: string): Promise<void>;
export declare function removeRepos(reposname: string): Promise<void>;
export declare function changeUserAndPass(name: string, username: string, password: string): Promise<void>;
export declare function listRemote(): Promise<void>;
export declare function pushUp(): Promise<void>;
export declare function add(): Promise<void>;
export declare function remove(repos?: string[]): Promise<void>;
export {};
