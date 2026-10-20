# 更新记录

## 主题切换与原始文章处理

- `hooks.ts` 可通过 `metainfo.articleExtensions` 声明主题支持的原始文章扩展名。
- `interceptArticle(context)` 可接收原始文件绝对路径和目标路径，并返回自定义 `TransformResult` 接管生成。
- 返回 `undefined` 时继续使用默认 transformer；主题声明但无法处理且没有默认 transformer 时不会覆盖已有结果。
- 主题切换、服务器启动和 `sitegen` 的强制刷新都会重新加载 hooks，并以已有 `content/files.json` 为基线。
- 新主题不支持旧文章格式、或自定义拦截器抛出异常时，旧 HTML、JSON、附件和索引保持不变。
- 已删除文章的 HTML、JSON、附件目录仅在整轮生成成功后清理，避免生成中途失败造成发布内容丢失。

## 验证

- `pnpm typecheck` 通过。
- `pnpm test` 通过，11 项测试全部通过。
