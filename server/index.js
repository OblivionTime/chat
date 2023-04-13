/**
 * 初始化数据库
 */
const db = require("./db/db.js")
global.db = db
/** 
* 初始化状态码并设置为全局变量 
*/
const resp = require("./model/resp.js")
global.RespSuccess = resp.RespSuccess
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
expressWs(app, server, { wsOptions: { maxPayload: 5 * 1024 * 1024 * 1024, } })
let displayRoutes = require('express-routemap');

//启动服务
server.listen("8888", "0.0.0.0", function () {
    // 显示所有 路由api
    displayRoutes(app);
    console.log(`http running at https://127.0.0.1:8888`);
});