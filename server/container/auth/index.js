
module.exports = {
    Login,
    Register,
    ForgetPassword,
    LoginCode,
    updateInfo
};
const jwt = require('jsonwebtoken');
const secretKey = 'xWbiNA3FqnK77MnVCj5CAcfA-VlXj7xoQLd1QaAme6l_t0Yp1TdHbSw';
let rooms = {}
let { RespUserOrPassErr, RespParamErr, RespServerErr, RespUserExitErr, RespUpdateErr, RespUserNotExitErr } = require('../../model/error');
const { RespData, RespSucess } = require('../../model/resp');
const { getIpAddress } = require('../../utils/ipaddr');
const { Query } = require('../../db/query');
function Login(req, res) {
    const { username, password } = req.body
    if (!(username && password)) {
        return RespError(res, RespParamErr)
    }
    const sql = 'select * from user where username=? and password=?'
    db.query(sql, [username, password], (err, results) => {
        // 查询数据失败
        if (err) return RespError(res, RespServerErr)
        // 查询数据成功
        // 注意：如果执行的是 select 查询语句，则执行的结果是数组
        if (results.length != 0) {
            const payload = {
                id: results[0].id,
                avatar: results[0].avatar,
                username: results[0].username,
                name: results[0].name,
                phone: results[0].phone,
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
    })
}
function Register(req, res) {
    const { username, password } = req.body
    if (!(username && password)) {
        return RespError(res, RespParamErr)
    }
    const sql = 'select username,password from user where username=?'
    //判断用户名是否已注册
    db.query(sql, [username], (err, results) => {
        // 查询数据失败
        if (err) return RespError(res, RespServerErr)
        // 查询数据成功
        // 注意：如果执行的是 select 查询语句，则执行的结果是数组
        if (results.length != 0) {
            return RespError(res, RespUserExitErr)
        }
        let user = {
            avatar: "",
            username: username,
            password: password,
            name: username,
            phone: "",
            signature: "",
        }
        const sqlStr = 'insert into user set ?'
        db.query(sqlStr, user, (err, results2) => {
            // 执行 SQL 语句失败了
            if (err) return RespError(res, RespServerErr)
            if (results2.affectedRows === 1) {

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
        })
    })
}

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
        info.avatar = `https://${getIpAddress()}:8888/uploads/avatar/${fileName}`
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
function ForgetPassword(req, res) {
    const { username, phone, password } = req.body
    if (!(username && phone && password)) {
        return RespError(res, RespParamErr)
    }
    const sql = 'select username,phone from user where username=? and phone=?'
    //判断用户手机号和用户名是否存在
    db.query(sql, [username, phone], (err, results) => {
        // 查询数据失败

        if (err) return RespError(res, RespServerErr)
        // 查询数据成功
        // 注意：如果执行的是 select 查询语句，则执行的结果是数组
        if (results.length == 0) {
            return RespError(res, RespUserNotExitErr)
        }
        const sqlStr = 'update user set password=? where username=?'
        db.query(sqlStr, [password, username], (err, results) => {
            // 执行 SQL 语句失败了
            if (err) return RespError(res, RespServerErr)
            if (results.affectedRows === 1) {
                return RespSucess(res)
            }
            return RespError(res, RespUpdateErr)

        })
    })
}
function LoginCode(ws, req) {
    //获取name
    let url = req.url.split("?")[1];
    let params = new URLSearchParams(url)
    let room = params.get("room")
    let name = params.get("name")
    if (name == 'device') {
        rooms[room] = {}
        rooms[room][name] = ws
    } else if (rooms[room] && name == 'user') {
        rooms[room][name] = ws
    } else {
        ws.close()
    }
    ws.on('message', function (Resp_data) {
        let data = JSON.parse(Resp_data)
        if (name == 'user') {
            if (data.operation == "connect") {
                rooms[room]['device'].send(JSON.stringify(data))
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
                        rooms[room]['device'].send(JSON.stringify(data))
                    } else {
                        ws.send(JSON.stringify({ operation: "error", error: "登录失败" }))
                    }
                })
            }
        } else {
            rooms[room]['user'].send(Resp_data)
        }
    });
    ws.on('close', function () {
        if (name == 'device') {
            delete rooms[room][name]
            for (const key in rooms[room]) {
                rooms[room][key].close()
            }
            delete rooms[room]
        } else {
            if (rooms[room]) {
                delete rooms[room][name]
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


