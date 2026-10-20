# 默认站点构建指南

本文说明 `sites/default` 的职责、当前构建方式和建议的目录演进方向。站点是展示层：文章源文件和内容生成由仓库根目录的程序负责，主题读取生成后的 `content`，并通过 `hooks.ts` 接入主题生命周期。

## 当前目录

```text
sites/default/
├── index.html              # 站点 HTML 外壳和样式入口
├── back.jpg                # 默认背景图
├── hooks.ts                # 主题生命周期钩子源码
├── hooks.js                # 编译产物，由 nowSite 加载
├── tsconfig.json           # 主题 TypeScript 检查配置
└── scripts/
    ├── index.tsx           # React 页面入口、数据读取和页面组件
    └── index.js            # esbuild 生成的浏览器 bundle
```

`index.html` 引用 `scripts/index.js`。开发时修改 `.ts`、`.tsx` 和静态资源；不要直接编辑 `hooks.js` 或 `scripts/index.js`。

## 数据与运行流程

```text
articles/ 源文章
    -> pnpm blog generate
content/{文章路径}.json + .html + 附件目录
content/files.json 文章索引
    -> nowSite/scripts/index.js 读取索引和文章
站点页面显示文章摘要
```

- `content/files.json` 的 `fileList` 以文章元数据 URL 为键，包含标题、源文章标识和附件目录 URL。主题用它生成文章列表。
- 每篇文章有同路径的 `.json` 元数据和 `.html` 内容。`IContentMeta` 包含标题、日期、front matter 自定义字段、长度和源路径等信息。
- `base_url` 是站点部署前缀；页面请求、资源链接和附件链接都应保留这个前缀。不要把开发机绝对路径写进主题。
- `sites/default` 是主题源码；`nowSite` 是当前主题的运行副本，由 `pnpm blog changesite default` 或同步流程覆盖，不应手工维护。
- `hooks.ts` 实现 `ISiteHooks`。钩子在主题切换、文章生成及文章变更时由服务端调用；保持钩子快速、可重复执行，并避免将临时进程状态写入主题文件。
- 主题可以在 `hooks.ts` 的导出对象上设置 `metainfo.articleExtensions`，例如 `['.note', '.foo']`，声明需要自己处理的原始格式；同时实现 `interceptArticle(context)`。`context.sourcePath` 是原始文件绝对路径，`context.destinationPath` 是不带扩展名的 content 目标绝对路径，`context.extension` 是小写扩展名，另有 `config` 和 `globalConfig`。返回 `TransformResult` 会阻止默认 transformer 并由生成器写出结果；返回 `undefined` 会继续默认转换。
- 主题切换或强制刷新会重新加载 hooks 并重新评估格式能力。生成器会先保留上一轮索引和产物：已有文章格式未被新主题支持时跳过处理，拦截器抛错时本轮失败但保留旧 HTML、JSON、附件和 `files.json`；已删除文章的旧产物只会在整轮生成成功后清理。

## 构建与运行

在仓库根目录执行：

```sh
pnpm install
pnpm exec tsc -p sites/default/tsconfig.json --noEmit
pnpm build
pnpm test
```

`pnpm build` 会检查主题 TypeScript，并将 `scripts/index.tsx` bundle 到 `scripts/index.js`。`pnpm test` 会先构建，再运行仓库测试。

需要本地查看完整生成结果时，先构建，再启动同步服务器：

```sh
pnpm build
pnpm blog sync 8080
```

服务器启动信息会显示访问地址；按 `config/default.json` 的 `base_url` 打开站点。同步程序会生成文章内容、切换当前主题并监视文章和主题目录。只改 React 页面源码时，先运行 `pnpm build` 重新 bundle，再刷新页面。

部署前确认 `base_url` 与最终挂载路径一致，并确认站点外壳、bundle、背景图、`content/files.json`、文章 `.json/.html` 和附件均包含在发布内容中。

## API 命名

React 组件的回调 props 使用小驼峰，并以 `on` 表示事件：`onTitleClick`、`onSummaryClick`、`onEnter`。普通方法使用动词开头的小驼峰，例如 `loadArticle`、`toggleSummary`。React 生命周期方法必须保留 React 规定的名称；组件和 TypeScript 类型使用 PascalCase。

主题接管原始格式的最小示例：

```ts
class Hooks implements ISiteHooks {
  metainfo = { articleExtensions: ['.note'] };

  async interceptArticle(context) {
    if (context.extension !== '.note') return;
    const raw = await fs.readFile(context.sourcePath, 'utf8');
    return {
      html: `<article>${escapeHtml(raw)}</article>`,
      meta: { title: path.basename(context.sourcePath, '.note'), date: new Date() },
    };
  }
}
```

返回对象遵守生成器的 `TransformResult` 约定。`raw` 可以省略，生成器会从 `sourcePath` 读取它用于计算文章长度；附件通过 `files` 返回。主题应自行完成输入格式校验，并让异常冒泡到生成命令，使失败不会被静默写成空文章。

## 结构演进计划

当前 `scripts/index.tsx` 同时承担目录获取、文章请求、页面状态和多个组件的职责。建议按以下顺序拆分，保持最终入口仍由 esbuild 合并成单一 `scripts/index.js`：

1. **稳定数据契约**：从刚取到的 `files.json` 直接派生文章元数据路径，处理空目录和请求失败；不要从 React 旧 state 读取新目录。当前首屏初始化存在使用旧 state 派生路径的问题，因此不会自动选中第一篇文章。
2. **分离数据访问**：新增 `scripts/data/contentRepository.ts`，集中读取目录索引、文章元数据和 HTML，并统一检查 HTTP 错误、部署前缀及加载状态。
3. **拆分展示组件**：将文章列表、摘要项、文章摘要/正文和页面布局放到 `scripts/components/`；让入口只负责组装页面及路由状态。
4. **补齐文章导航**：当前 `onEnter` 的父级实现为空，点击标题没有完整的文章阅读/返回流程。确定基于 hash 的最小路由后，再实现直接链接、浏览器返回和刷新恢复。
5. **整理样式与资源**：把 `index.html` 中的内联样式移到 `styles/`，图片统一放在 `assets/`，并针对 `base_url` 验证所有 URL。
6. **加入端到端验证**：覆盖空内容目录、首篇默认选中、列表切换、文章打开/返回、资源前缀和加载失败状态；通过后再考虑主题配置化和更多页面。

建议目标目录：

```text
sites/default/
├── assets/
├── styles/
├── hooks.ts
├── index.html
├── tsconfig.json
└── scripts/
    ├── index.tsx
    ├── data/contentRepository.ts
    ├── pages/HomePage.tsx
    ├── pages/ArticlePage.tsx
    └── components/
```

拆分过程保持 `IContentMeta`、`IFiles` 和站点 hook 合约单一来源；不要在主题中复制一套文章元数据接口，也不要让展示组件直接依赖 `articles/` 源目录。
