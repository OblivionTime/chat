
module.exports = {
    Login,
    Register,
    ForgetPassword,
    LoginCode,
    updateInfo,
    initUserNotification
};
const jwt = require('jsonwebtoken');
const secretKey = 'xWbiNA3FqnK77MnVCj5CAcfA-VlXj7xoQLd1QaAme6l_t0Yp1TdHbSw';
let codeRooms = {}
let { RespUserOrPassErr, RespParamErr, RespServerErr, RespUserExitErr, RespUpdateErr, RespUserNotExitErr } = require('../../model/error');
const { RespData, RespSuccess ,RespError} = require('../../model/resp');
const { Query } = require('../../db/query');
const crypto = require('crypto'); 

/**
 * 登录基本逻辑
 * 1.获取到前端传来的username和password
 * 2.查询数据库,判断用户名和密码是否正确
 * 3.正确后生成jwt,并返回想要token给前端去保存
 */
async function Login(req, res) {
    const { username, password } = req.body
    if (!(username && password)) {
        return RespError(res, RespParamErr)
    }
    //const salt = crypto.randomBytes(3).toString('hex')
    
    const sql = 'select * from user where username=?'
    let { err, results } = await Query(sql, [username])
    // 查询数据失败
    if (err) return RespError(res, RespServerErr)
    // 查询数据成功
    // 注意：如果执行的是 select 查询语句，则执行的结果是数组
    if (results.length != 0) {
        const payload = {
            id: results[0].id,
            avatar: results[0].avatar,
            username: results[0].username,
            password: results[0].password,
            name: results[0].name,
            phone: results[0].phone,
            salt: results[0].salt
        }
        //加盐
        let M = payload.salt.slice(0, 3) + password + payload.salt.slice(3);
        // 将M进行MD5哈希，得到哈希值
        let hash = crypto.createHash('md5').update(M).digest('hex');
        if (hash != payload.password) {
            return RespError(res, RespUserOrPassErr)
        }
        const token = jwt.sign(payload, secretKey);
        let data = {
            token: token,
            info: {
                id: results[0].id,
                avatar: results[0].avatar,
                username: results[0].username,
                name: results[0].name,
                phone: results[0].phone,
                created_at: new Date(results[0].created_at).toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
                signature: results[0].signature,
            }
        }
        return RespData(res, data)
    }
    return RespError(res, RespUserOrPassErr)
}
/**
 * 注册的基本逻辑
 * 1.获取到前端传来的username和password
 * 2.先判断用户名是否已经注册
 * 3.未注册则插入user表中
 * 4.给新用户添加一个好友分组
 * 5.生成jwt,把token返回给前端要前端进行保存 
 */
async function Register(req, res) {
    const { username, password } = req.body
    if (!(username && password)) {
        return RespError(res, RespParamErr)
    }
    //3个字节的字节码转化成16进制字符串，生成一个6位的salt
    const salt = crypto.randomBytes(3).toString('hex')
    const sql = 'select username,password from user where username=?'
    //判断用户名是否已注册
    let { err, results } = await Query(sql, [username])
    // 查询数据失败
    if (err) return RespError(res, RespServerErr)
    // 查询数据成功
    // 注意：如果执行的是 select 查询语句，则执行的结果是数组
    if (results.length != 0) {
        return RespError(res, RespUserExitErr)
    }
    //加盐
    let M = salt.slice(0, 3) + password + salt.slice(3);
    // 将M进行MD5哈希，得到哈希值
    let hash = crypto.createHash('md5').update(M).digest('hex');
    let user = {
        avatar: "",
        username: username,
        password: hash,
        name: username,
        phone: "",
        signature: "",
        salt: salt
    }
    const sqlStr = 'insert into user set ?'
    let res2 = await Query(sqlStr, user)
    err = res2.err
    let result2 = res2.results
    // 执行 SQL 语句失败了
    if (err) return RespError(res, RespServerErr)
    if (result2.affectedRows === 1) {
        getUserInfo(username, (info) => {
            let friend_group = {
                user_id: info.id,
                username: username,
                name: "我的好友",
            }
            //创建一个新的分组
            let sqlStr2 = 'insert into friend_group  set ?'
            db.query(sqlStr2, friend_group, (err, results3) => {
                if (err) return RespError(res, RespServerErr)
                const payload = {
                    id: info.id,
                    avatar: info.avatar,
                    username: info.username,
                    name: info.name,
                    phone: info.phone,
                }
                const token = jwt.sign(payload, secretKey);
                let data = {
                    token: token,
                    info: info
                }
                return RespData(res, data)
            })

        })

    }
}
/**
 * 修改用户信息
 * 1.判断用户是否上传了头像,如果上传了则获取文件名
 * 2.获取用户名,phone,个性签名
 * 3.当头像存在,则设置头像路径
 * 4.将修改user表中的数据
 */
async function updateInfo(req, res) {
    let fileName
    if (req.file) {
        fileName = req.file.filename;
    }
    const { username, phone, signature } = req.body
    let info = {
        phone, signature
    }
    if (fileName) {
        info.avatar = `/uploads/avatar/${fileName}`
    }
    const sql = 'update user set ? where username=?'
    let { err, results } = await Query(sql, [info, username])
    // 执行 SQL 语句失败了
    if (err) return RespError(res, RespServerErr)
    if (results.affectedRows === 1) {
        return RespData(res, { avatar: info.avatar })
    }
    return RespError(res, RespUpdateErr)
}
/**
 * 忘记密码
 * 1.判断用户手机号和用户名是否存在
 * 2.如果数据符合则修改user表的数据
 */
async function ForgetPassword(req, res) {
    const { username, phone, password } = req.body
    if (!(username && phone && password)) {
        return RespError(res, RespParamErr)
    }
    const sql = 'select username,phone,salt from user where username=? and phone=?'
    //判断用户手机号和用户名是否存在
    let { err, results } = await Query(sql, [username, phone])
    // 查询数据失败

    if (err) return RespError(res, RespServerErr)
    // 查询数据成功
    // 注意：如果执行的是 select 查询语句，则执行的结果是数组
    if (results.length == 0) {
        return RespError(res, RespUserNotExitErr)
    }
    const salt = results[0].salt
    const M = salt.slice(0, 3) + password + salt.slice(3);
    // 将M进行MD5哈希，得到哈希值
    const hash = crypto.createHash('md5').update(M).digest('hex');
    const sqlStr = 'update user set password=? where username=?'
    db.query(sqlStr, [hash, username], (err, results) => {
        // 执行 SQL 语句失败了
        if (err) return RespError(res, RespServerErr)
        if (results.affectedRows === 1) {
            return RespSuccess(res)
        }
        return RespError(res, RespUpdateErr)

    })
}
function LoginCode(ws, req) {
    //获取name
    let url = req.url.split("?")[1];
    let params = new URLSearchParams(url)
    let room = params.get("room")
    let name = params.get("name")
    if (name == 'device') {
        codeRooms[room] = {}
        codeRooms[room][name] = ws
    } else if (codeRooms[room] && name == 'user') {
        codeRooms[room][name] = ws
    } else {
        ws.close()
    }
    ws.on('message', function (Resp_data) {
        let data = JSON.parse(Resp_data)
        if (name == 'user') {
            if (data.operation == "connect") {
                codeRooms[room]['device'].send(JSON.stringify(data))
            } else if (data.operation == "login") {
                let username = data.username
                const sql = 'select * from user where username=?'
                db.query(sql, [username], (err, results) => {
                    // 查询数据成功
                    // 注意：如果执行的是 select 查询语句，则执行的结果是数组
                    if (results.length != 0) {
                        const payload = {
                            avatar: results[0].avatar,
                            username: results[0].username,
                            name: results[0].name,
                            phone: results[0].phone,
                        }
                        const token = jwt.sign(payload, secretKey);
                        let data = {
                            token: token,
                            info: {
                                avatar: results[0].avatar,
                                username: results[0].username,
                                name: results[0].name,
                                phone: results[0].phone,
                            }
                        }
                        codeRooms[room]['device'].send(JSON.stringify(data))
                    } else {
                        ws.send(JSON.stringify({ operation: "error", error: "登录失败" }))
                    }
                })
            }
        } else {
            codeRooms[room]['user'].send(Resp_data)
        }
    });
    ws.on('close', function () {
        if (name == 'device') {
            delete codeRooms[room][name]
            for (const key in codeRooms[room]) {
                codeRooms[room][key].close()
            }
            delete codeRooms[room]
        } else {
            if (codeRooms[room]) {
                delete codeRooms[room][name]
            }
        }
    })
}
function getUserInfo(username, callback) {
    const sql = 'select * from user where username=?'
    db.query(sql, [username], (err, results) => {
        // 注意：如果执行的是 select 查询语句，则执行的结果是数组
        if (results.length != 0) {
            const data = {
                id: results[0].id,
                avatar: results[0].avatar,
                username: results[0].username,
                name: results[0].name,
                phone: results[0].phone,
                created_at: new Date(results[0].created_at).toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
                signature: results[0].signature,
            }
            return callback(data)
        }
    })
}

/**
 * 初始化用户的通知管道,接收一些对方的消息
 */
function initUserNotification(ws, req) {
    //获取name
    let url = req.url.split("?")[1];
    let params = new URLSearchParams(url)
    let username = params.get("username")
    //如果用户已经登录则强制退出当前用户
    // if (LoginRooms[username]) {
    //     LoginRooms[username].send(JSON.stringify({ name: "logout" }))
    //     LoginRooms[username].close()
    // }
    LoginRooms[username] = {
        ws: ws,
        status: false,
    }
    ws.on('message', async (Resp_data) => {
        let data = JSON.parse(Resp_data)
        //接收者
        let receiver_username = data.receiver_username
        if (data.name == 'audio' || data.name == 'video') {
            if (!LoginRooms[receiver_username]) {
                ws.send(JSON.stringify({ name: "reject", message: "对方当前不在线!!!" }))
                return
            }
            if (LoginRooms[receiver_username].status) {
                ws.send(JSON.stringify({ name: "reject", message: "对方正在通话中!!!" }))
                return
            }
            //当用户已经在音视频通话了则需要告知发送方
            if (LoginRooms[username].status) {
                ws.send(JSON.stringify({ name: "reject", message: "你正在通话中,请勿发送其他通话请求...." }))
                return
            }
            LoginRooms[username].status = true
            //对方在线
            if (LoginRooms[receiver_username]) {
                LoginRooms[receiver_username].ws.send(Resp_data)
                data.method = data.name
                data.name = 'peer'
                ws.send(JSON.stringify(data))
                return
            }
        } else if (data.name == 'group_audio' || data.name == 'group_video') {
            if (LoginRooms[username].status || (group_rooms[data.room] && Object.keys(group_rooms[data.room]).length != 0)) {
                ws.send(JSON.stringify({ name: "reject", message: "无法创建群音视频...." }))
                return
            }
            /**
             * 群视频逻辑处理
             * 
            */
            group_rooms[data.room] = {}
            group_rooms[data.room][username] = ""
            LoginRooms[username].status = true
            for (const user of data.userList) {
                if (user == data.sender_name) {
                    continue
                }
                //对方在线且并未通话
                if (LoginRooms[user] && !LoginRooms[user].status) {
                    group_rooms[data.room][user] = ""
                    LoginRooms[user].ws.send(Resp_data)
                }
            }
            data.method = data.name
            data.name = 'group_peer'
            ws.send(JSON.stringify(data))
            return
        }
        //拒绝通话
        if (data.name == 'reject') {
            LoginRooms[username].status = false
            return
        }
        //对方在线
        if (LoginRooms[receiver_username]) {
            LoginRooms[receiver_username].ws.send(Resp_data)
        }
    });
    ws.on('close', function () {
        if (LoginRooms[username]) {
            delete LoginRooms[username]
        }
    })
}
