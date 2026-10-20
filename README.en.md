# BeautifulBlog

English documentation: [README.en.md](README.en.md) · 默认中文文档：[README.md](README.md)

BeautifulBlog is a static website generator. Like Hexo and similar tools, it produces files that can be deployed to an ordinary static file server. Its key difference is that a theme is not a page template applied by the generator. A theme is an independent website program controlled by its author.

The generator provides article transformation results, indexes, and lifecycle notifications. The theme decides how to read these data, organize pages, implement navigation, choose its presentation, and add browser-side interactions. The generator does not require a particular home page, article page, or URL layout; it only requires compatibility with the agreed data and hook interfaces.

## How it differs from template-based generators

| Template-based generators | BeautifulBlog |
| --- | --- |
| The generator reads a theme template and inserts articles into it | The theme is independent website code with its own structure and runtime logic |
| A theme mainly describes layout, styling, and template syntax | A theme can implement its own home page, routing, search, catalog, recommendations, and interactions |
| The generator controls how articles enter pages | The generator provides article data and change notifications; the theme decides how to use them |
| A theme works inside the generator's template lifecycle | A theme can contain a browser application; Node hooks coordinate with the generator |

The published result is still a static site. A theme may use JavaScript in the browser to load articles or provide interactions, but the production site does not need to run BeautifulBlog's Node server.

## How it works

```text
articles/                  article source files
    │
    ├── format transformers read articles and front matter
    ▼
content/                   normalized data, HTML, attachments, and files.json
    │
    ├── the generator notifies the active theme hooks
    ▼
sites/<theme>/             theme source: browser website + Node lifecycle hooks
    │
    └── copied to nowSite/  active theme runtime copy
                               │
                               └── built-in static server or external hosting
```

The article transformers convert Markdown, TXT, PDF, and other inputs into the agreed intermediate result. A theme can use the generated HTML and metadata, or combine them in its own way. The generator never inserts articles into a theme home page or template automatically.

A theme contains two kinds of code:

- **Browser website**: usually `index.html` plus scripts, styles, and static assets. This is the website itself and decides how to present `content/`.
- **Node hooks**: `hooks.js` is loaded by the generator to receive theme changes, full generation, and article change events. It is not a browser script or page template.

## Integration contract

The site currently integrates with the generator through three main conventions:

1. **Content files**: each article produces a JSON metadata file and an HTML file at the same path, and may have an attachment directory. Metadata includes the title, date, front matter fields, lengths, modification time, and source article identifier.
2. **Article index**: `content/files.json` contains `fileList`, which records metadata URLs, titles, source identifiers, and attachment directory URLs. A theme can use it to build lists or maintain its own index.
3. **Lifecycle hooks**: a theme exports an object implementing `ISiteHooks`. The current implementation calls `beforeUnload` and `loaded` when switching themes, `generated` after `blog generate y` completes, and `articleChanged(context, type, dest)` after watched article additions, changes, or deletions are regenerated. Some other regeneration paths do not currently call `generated`.

A theme can also declare the raw article extensions it supports with `metainfo.articleExtensions` exported from its hooks and optionally implement `interceptArticle(context)`. The generator passes `sourcePath`, `destinationPath`, `extension`, the current config, and the global config. Returning a `TransformResult` gives the theme full control of that article; the generator only writes the result as standard HTML, JSON, and attachments. Returning `undefined` falls back to the default transformer. This lets a theme handle formats unknown to the generator and choose its own parsing and metadata logic.

Theme switching and forced refresh reload hooks and re-evaluate format support. Refreshing is non-destructive: if the new theme does not support an existing format, or an interceptor fails, existing HTML, JSON, attachments, and `files.json` remain available. Outputs for deleted articles are removed only after the complete generation round succeeds.

`init`, `install`, and `uninstall` exist in the interface definitions, but the generator does not yet invoke all of them through a complete lifecycle. A theme should not depend on these events. Content files also do not yet have an independent schema version; new or changed fields should remain backwards-readable until versioning is formalized.

`base_url` is the deployment path prefix. Theme requests for articles, scripts, styles, and attachments must preserve this prefix, must work when the site is not mounted at the domain root, and must never contain development-machine absolute paths.

## Directory layout

A standalone blog directory normally contains:

```text
articles/       article source files
content/        generated content, metadata, attachments, and index
config/         base_url, active theme, and other configuration
sites/          optional theme sources
nowSite/        active theme copy, overwritten by synchronization
assets/         blog-level shared assets
```

See the [default theme build guide](sites/default/README.md) for the default theme's responsibilities, build process, data contract, and evolution plan.

## Quick start

The development environment requires Node.js 24.12 or later and pnpm 10:

```sh
pnpm install
pnpm build
pnpm test
pnpm blog -h
```

Create a standalone blog directory from the CLI:

```sh
pnpm blog init ./my-blog
```

Inside the blog directory, start the synchronization server with the installed `blog` command:

```sh
blog sync 8080
```

The command regenerates `content/` according to the configuration, synchronizes the selected theme to `nowSite/`, starts the static server, and watches article and theme changes. The startup log prints the address. The path prefix comes from `base_url` in `config/<name>.json`. Use `blog -h` for the complete CLI help.

## Theme development

Theme authors own the website structure and behavior. You can start from `sites/default` or create a completely new theme directory. Typical responsibilities include:

- Designing the home page, reading view, navigation, and URL structure.
- Choosing how to present article lists, categories, tags, search, archives, and recommendations.
- Using the agreed content index and metadata, or building a theme-specific data layer.
- Responding to theme loading, full generation, and individual article changes in Node hooks.
- Building the theme into browser-runnable files and ensuring the `nowSite/` copy contains all resources required by the site.

See the [default theme build guide](sites/default/README.md) for theme TypeScript, hook signatures, and the default build process. Do not edit `nowSite/` manually; the tool generates it as a runtime copy.

## Common CLI commands

- `blog init <directory>`: create a standalone blog and the default theme.
- `blog generate [y|n] [verbose]`: generate article content; `y` forces regeneration.
- `blog changesite [theme]`: switch the active theme.
- `blog sync [port]`: start the static server and watch article and theme changes.
- `blog refresh`: regenerate content and synchronize the active theme.
- `blog new <a|c> <relative-directory> <name>`: create an article or subdirectory.
- `blog config <add|del|use> <parameter>`: manage configuration.

## Build, test, and release

```sh
pnpm build
pnpm test
pnpm pack
```

`pnpm build` compiles the generator, checks the default theme, and bundles its browser entry. `pnpm test` builds first and then runs the repository tests. `pnpm pack` creates an npm package. Standalone builds are available through `pnpm pkgwin`, `pnpm pkglinux`, and `pnpm pkgall`.

## Current boundaries and future work

- A theme is a website program, not a general-purpose template; the default theme is an example and does not define the generator's page shape.
- The built-in transformers provide general HTML and metadata, while the transformer plugin system is still evolving.
- Raw article interception is supported. Theme switching and forced refresh use non-destructive commits, preserving existing output when a format is unsupported or an interceptor fails.
- Some `ISiteHooks` installation lifecycle events are not yet wired into the full call flow.
- Content indexes and metadata need schema versions and an explicit backwards-compatibility policy.
- EJS/Hexo template compatibility was previously considered as an optional adapter direction; it must not change the core model in which the theme controls its own website.
