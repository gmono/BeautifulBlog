"use strict";
//目录的files.json匹配的元数据定义
Object.defineProperty(exports, "__esModule", { value: true });
function newDirMeta() {
    return {
        dirs: {},
        files: {},
        all_files: {},
        all_words: 0,
        self_path: "",
        num_dirs: 0,
        num_files: 0
    };
}
exports.newDirMeta = newDirMeta;
