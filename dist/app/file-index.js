"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pruneFileIndex = pruneFileIndex;
function pruneFileIndex(files, existingArticlePaths) {
    const fileList = Object.fromEntries(Object.entries(files.fileList).filter(([, entry]) => existingArticlePaths.has(entry.article_path)));
    return { ...files, fileList };
}
//# sourceMappingURL=file-index.js.map