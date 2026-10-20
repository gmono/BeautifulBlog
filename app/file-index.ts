import { IFiles } from "./Interface/IFiles";

/** 从发布索引中去除本轮扫描已不存在的文章。 */
export function pruneFileIndex(files: IFiles, existingArticlePaths: Set<string>): IFiles {
  const fileList = Object.fromEntries(
    Object.entries(files.fileList).filter(([, entry]) => existingArticlePaths.has(entry.article_path)),
  );
  return { ...files, fileList };
}
