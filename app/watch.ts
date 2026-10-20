import * as path from "path";
import generate from "./generator";
import { Subject } from "rxjs";
import { pathMap } from "./lib/utils";
import { changed } from "./hooks";
import changesite from "./changesite";
import * as fse from "fs-extra";

export const OnArticleGenerated: Subject<void> = new Subject();
export const OnSiteSynced: Subject<void> = new Subject();

async function createWatcher(root: string) {
  const { watch } = await import("chokidar");
  const watcher = watch(root, {
    ignoreInitial: true,
    awaitWriteFinish: { stabilityThreshold: 150, pollInterval: 50 },
  });
  await new Promise<void>((resolve, reject) => {
    watcher.once("ready", resolve);
    watcher.once("error", reject);
  });
  return watcher;
}

export default async function watchArticles(configName = "default") {
  const root = path.resolve("./articles");
  await fse.ensureDir(root);
  const watcher = await createWatcher(root);
  let queue = Promise.resolve();
  const enqueue = (articlePath: string, type: "change" | "add" | "remove") => {
    queue = queue.then(async () => {
      console.log(`${type}: ${articlePath}`);
      await generate(configName);
      const destination = pathMap(articlePath, root, path.resolve("./content"));
      await changed(destination, type);
      OnArticleGenerated.next();
    }).catch(error => console.error("文章更新失败:", error));
  };
  watcher.on("add", file => enqueue(file, "add"));
  watcher.on("change", file => enqueue(file, "change"));
  watcher.on("unlink", file => enqueue(file, "remove"));
  watcher.on("error", error => console.error("文章监视器错误:", error));
  return watcher;
}

export async function watchSite(siteName: string) {
  const sitePath = path.resolve("./sites", siteName);
  if (!(await fse.pathExists(sitePath))) {
    console.log(`网站 ${siteName} 不存在`);
    return null;
  }
  console.log("正在初始化网站...");
  await changesite(siteName);
  const watcher = await createWatcher(sitePath);
  let queue = Promise.resolve();
  const update = () => {
    queue = queue.then(async () => {
      console.log("正在同步网站更改");
      await changesite(siteName);
      OnSiteSynced.next();
    }).catch(error => console.error("网站同步失败:", error));
  };
  watcher.on("add", update);
  watcher.on("change", update);
  watcher.on("unlink", update);
  watcher.on("addDir", update);
  watcher.on("unlinkDir", update);
  watcher.on("error", error => console.error("网站监视器错误:", error));
  return watcher;
}

if (require.main === module) watchArticles();
