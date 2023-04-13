/*
 * @Description: 
 * @Version: 1.0
 * @Autor: solid
 * @Date: 2022-08-19 11:46:56
 * @LastEditors: solid
 * @LastEditTime: 2022-11-01 15:47:52
 */
/**
 * 服务器
 */
var express = require('express');
var expressWs = require('express-ws');
var app = express();
expressWs(app)
const path = require('path');
/**
 * 解决跨域
 */
// app.all("*", function );
app.use("/uploads", express.static('uploads'));
const cors = (req, res, next) => {
    //设置允许跨域的域名，*代表允许任意域名跨域
    res.header("Access-Control-Allow-Origin", "*");
    //允许的header类型
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Credentials", true);
    //跨域允许的请求方式
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("Content-Type", "application/json;charset=utf-8")
    if (req.method.toLowerCase() == 'options')
        res.sendStatus(200);  //让options尝试请求快速结束
    else
        next();
}
const bodyParser = require("body-parser");
app.use(bodyParser.json({ limit: '100mb' })); //parse application/json
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true })); //parse application/json

let indexRouter = require('./routes/auth')();
let friendRouter = require('./routes/friend')();
let groupRouter = require('./routes/group')();
let messageRouter = require('./routes/message')();
let rtcRouter = require('./routes/rtc')();
let bingRouter = require('./routes/bing')();

app.use('/api/chat/v1/auth', cors, indexRouter);
app.use('/api/chat/v1/friend', cors, friendRouter);
app.use('/api/chat/v1/group', cors, groupRouter);
app.use('/api/chat/v1/message', cors, messageRouter);
app.use('/api/chat/v1/rtc', cors, rtcRouter);
app.use('/api/chat/v1/bing', cors, bingRouter);

module.exports = app