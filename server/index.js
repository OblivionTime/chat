/**
 * 初始化所有的全局变量和全局方法
 */
const initGlobal = require('./global');
initGlobal()
/**
 * 初始化路由
 */
var expressWs = require('express-ws');
var app = require('./app/app');
/**
 * 读取https证书文件
 */
let fs = require("fs");
const path = require('path');
const httpsOption = {
    key: fs.readFileSync(path.join(__dirname, 'mkcert/server.key')),
    cert: fs.readFileSync(path.join(__dirname, '/mkcert/server.crt'))
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