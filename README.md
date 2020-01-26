# 说明
博客系统，用于解决现有静态博客系统的弊端比如自定义网站和使用动态网站困难生成麻烦等
#使用说明
前提：
* 本地安装有 nodejs>=12.14.0
* 全局安装 npm yarn
使用步骤：
1. 克隆此仓库到本地目录，并在仓库目录执行yarn安装全部依赖
2. 在sites目录里放置自己的主题（例 default)
3. 在config文件夹里放置自己的配置文件(可省略这一步)
4. 使用yarn blog -h 查看说明并使用
开发服务器使用说明：
* 开发服务器启动为 yarn blog server
* 开发服务器默认使用default.json配置，请勿修改default.json 中的baseurl否则server目前不能工作
* 开发服务器启动会使用指定配置文件重新生成所有内容
# 设计
* site优先，site为主体，主动加载内容，程序只生成内容信息，不生成网站，这样前端可使用各种技术比如spa框架，好套模板，随便一个网站模板都可以拿来用
* json优先，方便修改，与js同构（特别是方便程序员）
* typescript based，所有程序使用typescript构建
* 目录同构，即不需要专门的public目录，直接在根目录进行所有操作包括git提交
* 基于frontmatter，后期可自定义transformer
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
# Site说明
site有两个入口文件：
1. 网站入口，index.html
2. 内容初始化回调,initcontent.js generator程序执行完毕后在nowSite目录调用  
   约定：initcontent.js 不能修改nowSite目录外的东西也即不能有".."的引用,init.js在node环境下执行
3. 网站初始化回调:initsite.js ,changesite程序执行完毕后调用，与初始化入口约定一致
4. 初始化入口:init.js sitegen程序执行完成后（也即一切就绪后调用），正常情况下只需要这一文件
入口文件如果没有就不调用，同时sitegen程序还会在此之前执行initsite和initcontent 也即全套初始化流程
全套初始化顺序为initsite->initcontent->init
**可使用init程序进行全套初始化
**重要：请勿直接修改nowSite目录的内容，所有更改都不会被保存，应该修改sites中的对应内容**



# Helper说明
app/Helper目录下的所有内容都会被编译到helpers.js，模块解决方案使用amd,其向HelperManager全局对象注册自己（name-obj)，site可通过其获取各种helper,helper全部在浏览器运行因此不能使用nodejs库