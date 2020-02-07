# 开发指南
* 除dev.ts外，其他程序可通过启动yarn blog dev 进行开发，dev程序做如下工作：
  1.  监视app目录和Helper的所有ts文件并实时编译
  2.  根据配置文件设置，监视指定网站中的ts文件并实时编译
  3.  启动启动sync命令，启动开发服务器，并自动同步配置文件指定的site到nowSite目录，同时自动监视文章改动并自动生成content  
   本程序可将一切articles，site，app，helpers的所有改动自动同步部署，用户可在浏览器和shell中直接看到改动结果
* 关于如何编写dev.ts文件的问题：由于编写dev.ts后需要运行测试，其运行又会启动自动编译，为避免重复推荐以下两种方案  
  1. 在测试新的dev.ts前退出之前启动的
  2. 开发dev.ts时使用tsc命令手动编译

# 附加说明
dev.ts设计为全功能开发用辅助程序  
当前dev.ts只使用tsc对typescript文件进行自动编译，未来可能实现：webpack自动打包，VUE单文件组件自动编译等功能
  