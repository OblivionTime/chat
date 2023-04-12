// 1. 导入 mysql和fs 模块
const mysql = require('mysql')
const fs = require('fs')
/**
 * 初始化参数
 */
let host = '127.0.0.1'
let port = 3306
let user = 'root'
let password = '123456'
let database = 'mychat'
/**
 * 如果配置文件存在,则读取配置文件,不存在则默认
 */
if (fs.existsSync("config.json")) {
    var res = JSON.parse(fs.readFileSync(`config.json`))
    host = res.host
    port = res.port
    user = res.user
    password = res.password
    database = res.database
}
// 2. 建立与 MySQL 数据库的连接关系
const db = mysql.createPool({
    host, // 数据库的 IP 地址
    port, //端口
    user, // 登录数据库的账号
    password, // 登录数据库的密码
    database, // 指定要操作哪个数据库
    multipleStatements: true,
    charset: 'utf8mb4'
})
//创建user表
function initUserTable() {
    let sql = `CREATE TABLE
    IF
        NOT EXISTS USER (
            id INT ( 11 ) NOT NULL AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR ( 255 ) NOT NULL UNIQUE,
            password VARCHAR ( 255 ) NOT NULL,
            avatar VARCHAR ( 255 ) NULL,
            phone VARCHAR ( 50 ) NULL,
            name VARCHAR ( 255 ) NULL,
            signature LONGTEXT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    ENGINE = INNODB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

    `
    db.query(sql, (error, results, fields) => {
        if (error) return console.log(error);
        initGroupTable()
        initMessageTable()

    });
}
//创建firend表
function initFirendTable() {
    const sql = `CREATE TABLE   IF NOT EXISTS friend (
        id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
        user_id INT(11) NOT NULL,
        username VARCHAR(50) NOT NULL,
        avatar VARCHAR(255),
        online_status ENUM('online', 'offline') DEFAULT 'offline',
        remark VARCHAR(50),
        group_id INT(11),
        room  VARCHAR(255),
        unread_msg_count INT(11) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_group_id (group_id),
        FOREIGN KEY (group_id) REFERENCES friend_group(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;      
      `
    db.query(sql, (error, results, fields) => {
        if (error) return console.log(error);
    });
}
//创建分组表
function initGroupTable() {
    const sql = `CREATE TABLE  IF NOT EXISTS friend_group (
        id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
        user_id INT(11) NOT NULL,
        username VARCHAR ( 255 ) NOT NULL,
        name VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `
    db.query(sql, (error, results, fields) => {
        if (error) return console.log(error);
        initFirendTable()
        initGroupChatTable()
    });
}
//创建群聊表
function initGroupChatTable() {
    const sql = `
    CREATE TABLE IF NOT EXISTS group_chat (
        id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        creator_id INT(11) NOT NULL,
        avatar VARCHAR(255),
        announcement TEXT,
        room  VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_creator_id (creator_id),
        FOREIGN KEY (creator_id) REFERENCES user(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `
    db.query(sql, (error, results, fields) => {
        initGroupMembersTable()
        if (error) return console.log(error);
    });
}
//创建群成员
function initGroupMembersTable() {
    const sql = `
    CREATE TABLE IF NOT EXISTS group_members (
        id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
        group_id INT(11) NOT NULL,
        user_id INT(11) NOT NULL,
        nickname VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_group_id (group_id),
        FOREIGN KEY (group_id) REFERENCES group_chat(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `
    db.query(sql, (error, results, fields) => {
        if (error) return console.log(error);
    });
}

//创建消息表
function initMessageTable() {
    const sql = `
    CREATE TABLE IF NOT EXISTS  message (
        id int(11) NOT NULL AUTO_INCREMENT,
        sender_id int(11) NOT NULL,
        receiver_id int(11) NOT NULL,
        content longtext NOT NULL,
        room  VARCHAR(255) NOT NULL,
        type enum('private','group') NOT NULL,
        media_type enum('text','image','video','file') NOT NULL,
        status int(1) NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        FOREIGN KEY (sender_id) REFERENCES user(id) ON DELETE CASCADE ON UPDATE CASCADE
      )ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `
    db.query(sql, (error, results, fields) => {
        initmessageStatisticsTable()
        if (error) return console.log(error);
    });
}
//创建消息统计表
function initmessageStatisticsTable() {
    const sql = `
    CREATE TABLE IF NOT EXISTS  message_statistics (
        id int(11) NOT NULL AUTO_INCREMENT,
        room  VARCHAR(255) NOT NULL,
        total int(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      )ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `
    db.query(sql, (error, results, fields) => {
        if (error) return console.log(error);
    });
}
//初始化表格
function initTables() {
    initUserTable()

}
// 测试 mysql 模块能否正常工作
db.query('select 1', (err, results) => {
    // mysql 模块工作期间报错了，就进入这个if判断语句，打印这个错误信息
    if (err) {
        console.log("连接失败", err.message)
        process.exit(1);
    }
    console.log("连接成功")
    initTables()

})
//将连接好的数据库对象向外导出,供外界使用
module.exports = db