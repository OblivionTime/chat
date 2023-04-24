/*
 * @Description: 
 * @Version: 1.0
 * @Autor: solid
 * @Date: 2023-04-14 17:16:36
 * @LastEditors: solid
 * @LastEditTime: 2023-04-24 10:05:39
 */
const os = require('os');
function initGlobal() {
    /**
 * 初始化数据库
 */
    const db = require("./db/db.js")
    const { Query } = require("./db/query.js")
    global.db = db
    global.Query = Query

    /** 
    * 初始化状态码并设置为全局变量 
    */
    const resp = require("./model/resp.js")
    global.RespSuccess = resp.RespSuccess
    global.RespError = resp.RespError
    global.RespData = resp.RespData
    /**
     * 定义全局登录用户房间
     */
    global.LoginRooms = {}
    /**
     * 定义全局用户发送通知方法
     */
    const { NotificationUser } = require("./utils/notification.js")
    global.NotificationUser = NotificationUser
    /**
     * 音视频房间
     */
    global.rooms={}
    global.group_rooms={}
    /**
     * 初始化new bing中的可执行文件
     */
    if(os.platform() === 'win32'){
        ExitDir()
    }
}
function ExitDir() {
    const path = require('path');
    const fs = require('fs');
    if (!fs.existsSync("bin")) {
        fs.mkdirSync("bin", { recursive: true });
    }
    const Static = path.resolve(__dirname, './bin');
    if (!fs.existsSync("bin/decryption.exe")) {
        fs.writeFileSync("bin/decryption.exe", fs.readFileSync(Static + "/decryption.exe"));
    }
}
module.exports = initGlobal