/**
 * 初始化数据库
 */
const db = require("./db/db.js")
global.db = db
/** 
* 初始化状态码并设置为全局变量 
*/
const resp = require("./model/resp.js")
// 返回给用户信息的方法
global.RespSucess = resp.RespSucess
global.RespError = resp.RespError
global.RespData = resp.RespData
/**
 * 初始化路由
 */
var expressWs = require('express-ws');
var app = require('./app/app');
/**
 * 读取https证书文件
 */
let fs = require("fs");
const httpsOption = {
    key: fs.readFileSync('./mkcert/server.key'),
    cert: fs.readFileSync('./mkcert/server.crt')
}
/**
 * 初始化https
 */
let server = require("https").createServer(httpsOption, app);
/**
 * 设置最大传输文件大小
 */
// expressWs(app);
// 通过执行以上的方法，会在现有的 app 实例上绑定 
//     ws.send('你连接成功了')websocket 协议的封装方法，在调用该方法时，其语法类似 express 提供的 get、post、put 等方法：
// app.ws('/socketTest', function (ws, req){
//     ws.on('message', function (msg) {
//         // 业务代码
//         ...
//     })
// })
expressWs(app, server, { wsOptions: { maxPayload: 5 * 1024 * 1024 * 1024, } })
let displayRoutes = require('express-routemap');

//启动服务
server.listen("8888", "0.0.0.0", function () {
    // 显示所有 路由api
    displayRoutes(app);
    console.log(`http running at https://127.0.0.1:8888`);
});