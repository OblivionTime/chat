//初始化数据
const db = require("./db/db.js")
const resp = require("./model/resp.js")
var expressWs = require('express-ws');
var app = require('./app/app');
let fs = require("fs");
const httpsOption = {
    key: fs.readFileSync('./mkcert/server.key'),
    cert: fs.readFileSync('./mkcert/server.crt')
}
server = require("https").createServer(httpsOption, app);
expressWs(app, server, { wsOptions: { maxPayload: 5 * 1024 * 1024 * 1024, } })
let displayRoutes = require('express-routemap');
global.db = db
global.RespSucess = resp.RespSucess
global.RespError = resp.RespError
global.RespData = resp.RespData
//启动服务
server.listen("8888", "0.0.0.0", function () {
    displayRoutes(app);
    console.log(`http running at https://127.0.0.1:8888`);
});