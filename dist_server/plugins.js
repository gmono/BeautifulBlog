/**
 * 插件管理器程序
 * 插件目前认为是一个可合并到blog目录的zip包
 * 其中有一个初始化脚本和一个卸载脚本
 * zip解压到临时目录 执行初始化脚本里的install  然后将修改后的文件树复制到blog目录
 * 执行初始化脚本的init
 * 卸载时执行卸载脚本的uninstall
 *
 * 之后考虑使用虚拟目录映射（把多个目录当一个目录用）来避免使用uninstall清理残余
 * 而直接删除对应的虚拟目录
 */ 
//# sourceMappingURL=plugins.js.map