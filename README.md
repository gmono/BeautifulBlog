# 说明
博客系统，用于解决现有静态博客系统的弊端比如自定义网站和使用动态网站困难生成麻烦等
状态：**目前基本可用**
现状说明：**当前已经支持独立程序和创建独立blog目录，自动生成blog模板，blog程序已经可以打包但二进制文件只在release中发布，独立bin程序没有外部依赖直接放入PATH中即可使用**

# 使用说明（clone仓库法）
前提：
* 本地安装有 nodejs>=12.14.0
* 全局安装 npm yarn
使用步骤：
1. 克隆此仓库到本地目录，并在仓库目录执行yarn安装全部依赖
2. 在sites目录里放置自己的主题（例 default)
3. 在config文件夹里放置自己的配置文件(可省略这一步)
4. 使用yarn blog -h 查看说明并使用
开发服务器使用说明：
* 开发服务器启动为 yarn blog sync
* 开发服务器默认使用default.json配置
* 开发服务器启动会使用指定配置文件重新生成所有内容
* 如果提交到github且网站的地址中带有path，请将path加入base_url中，github.json 配置文件有此示例

# 使用说明（独立程序）
1. 单文件版：下载release下对应系统版本的程序文件（单文件）放到一个目录，把这个目录加入PATH环境变量中，运行blog -h
2. 绿色安装版:下载安装包并解压压缩包到一个目录，执行install脚本执行安装，执行uninstall脚本卸载
3. 安装版：下载安装包，双击启动安装程序，按提示安装

# 设计理念
* site优先，site为主体，主动加载内容，程序只生成内容信息，不生成网站，这样前端可使用各种技术比如spa框架，好套模板，随便一个网站模板都可以拿来用
* json优先，方便修改，与js同构（特别是方便程序员）
* typescript based，所有程序使用typescript构建
* 目录同构，通过gitignore来选择性提交 避开提交原始内容
* 基于frontmatter，后期可自定义transformer以选择文章内容书写格式（甚至自定义格式）
* site的配置与网站config分开，一个网站一个独立的配置,内容配置不变
* 其他有待补充

# 目录说明
1. sites：保存所有可用主题（site），文件夹名即主题名
2. nowSite：生成时会把当前主题复制到这个目录，当前主题在config中配置
3. app：程序目录，ts文件
4. articles：内容文章目录，目录分层结构会自动包含到files.json中
5. content:生成的文章内容包括:
   * 每个文章对应一个 文章名.html和一个文章名.json
   * 总目录：files.json 其中包含了文章对应的目录层次结构，可能有多重目录

# 开发说明
> 开发说明为有意为此项目做贡献的人准备
开发目前主要通过dev程序进行，dev程序可启动tsc监视app app/Helper 目录的代码文件改动并实时编译  
同时启动sync程序，启动服务器和内容生成程序，开发者可实时在浏览器实时查看文章内容更改  
对同样配置文件中配置的site进行监视，自动编译ts文件并监控其改动，实时同步到nowSite目录，这样开发者可在浏览器中实时看到对主题（site）的修改，方便测试开发  
使用流程：
* clone仓库
* 启动 yarn blog dev    （使用default配置文件，可查看帮助-h 以自定义配置文件）
* 修改程序代码或其他文件
* 在浏览器中或shell中查看或使用
## 如何打包
执行yarn pkg打包为独立可执行文件，默认配置为只生成windows版本的exe，可在package.json中配置

# Site说明
1. 网站入口，index.html
2. 服务端事件钩子（尚未实现）  在本地切换网站时 生成内容时 调用对应的钩子脚本
**重要：请勿直接修改nowSite目录的内容，目前采用复制方式，所有更改都不会被保存，应该修改sites中的对应内容，日后可能切换为符号链接方式**



# Helper说明
app/Helper目录下的所有内容都会被编译到helpers.js，模块解决方案使用amd,其向HelperManager全局对象注册自己（name-obj)，site可通过其获取各种helper,helper全部在浏览器运行因此不能使用nodejs库


# 附加
hooks机制可用于使主题（site）可以在文章生成和修改时得到通知并做出一些自定义的反应  
例如可筛选出最新提交的4篇文章并随机配图放到首页  
由此可提供高于普通静态博客生成器主题的高自由度

# blog目录说明
blog目录中包含基本的blog相关内容如content和articles目录，同时也包含可由用户自定义的transforms目录
此目录如果存在，就使用此目录，否则使用程序自带的transform（3个标准格式）  
一旦有自己的transforms目录会自动忽略程序自带，因此自定义transforms目录不能无文件