#  目录
此目录用于保存转换各种文件格式的transform
# transformer规范
一个transformer提供两个函数接口
1. transform函数返回4个变量，内容元数据(meta)，内容本身(raw)，内容转换得到的html文件（可被加载显示）(html)，转换得到的附加文件（kv对，k为文件路径，相对于文件名同名目录，k可以包含目录路径）(files)
2. init函数返回一个列表，表示需要在全局额外引入的js和css（其会被去重，本地化后插入文章页模板中，且每个只加载一次）

如何优雅地处理全局js css引入还有待商榷
* 当前PageLoader库可以处理css并添加作用域
* 目前PageLoader可以把页面的js（包括外部引入）在一个局部作用域内运行
目前考虑是否可以利用webpack或browserify的打包技术，在生成阶段对生成的html进行打包操作，这样并使用pageloader加载，这样可以比较完美地利用npm包管理器管理引入资源

# 目前状态
1. 插件式transformer正在积极建设中，尚不可用  
2. 考虑到transformer的功能与webpack的loader有雷同，未来会考虑将其与webpack整合，以便利用webpack的loader和插件生态和打包功能