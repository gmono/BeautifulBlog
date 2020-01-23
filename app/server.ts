/**
 * 服务器，监控更改并在更改重新生成后发送刷新信号
 */


import * as koa from "koa"
import * as kstatic from "koa-static"

const app=new koa();
app.use(kstatic("."));

export default async function serve(port:number=80){
    console.log(`服务器启动，端口:${port},地址:http://localhost:${port}`);
    app.listen(port);
}

if(require.main==module)
    serve();