module.exports = {
    List,
    AddFriend,
    SearchUser
};
let { RespParamErr, RespServerErr, RespExitFriendErr, RespUpdateErr, RespCreateErr } = require('../../model/error');
const { v4: uuidv4 } = require('uuid');


const { RespError, RespSucess, RespData } = require('../../model/resp');
const { Query } = require('../../db/query');
//获取好友列表
function List(req, res) {
    //根据id获取所有分组下的所有好友
    let id = req.user.id
    console.log(id);
    const sql = 'select id,name from friend_group  where user_id=?'
    db.query(sql, [id], async (err, results) => {
        // 查询数据失败
        if (err) return RespError(res, RespServerErr)
        // 查询数据成功
        // 注意：如果执行的是 select 查询语句，则执行的结果是数组
        let friendList = []
        if (results.length != 0) {
            for (const item of results) {
                let friend = { name: item.name, friend: [] }
                let friends = await getFriendList(item.id)
                for (const item2 of friends) {
                    friend.friend.push(item2)
                }
                friendList.push(friend)
            }
        }
        return RespData(res, friendList)
    })
}
//添加好友
async function AddFriend(req, res) {
    //获取当前登录用户的个人信息
    let user = req.user
    //获取自己的分组所有成员
    let info = await getUserInfo(user.username)
    //查询当前用户的分组下所有好友
    let sql = 'select id,name from friend_group  where user_id=?'
    let { err, results } = await Query(sql, [info.id])
    //获取到要添加的username和其对应的id
    let { username, id } = req.body
    for (const item of results) {
        let group_id = item.id
        //判断用户是否已经是好友
        let friendList = await getFriendList(group_id)
        for (const friend of friendList) {
            if (friend.username == username) {
                return RespError(res, RespExitFriendErr)
            }
        }
    }
    const uuid = uuidv4();

    let friendInfo = {
        username: username,
        avatar: info.avatar,
        remark: username,
        group_id: results[0].id,
        user_id: id,
        room: uuid
    }
    sql = 'insert into friend  set ?'
    //添加好友
    resp = await Query(sql, friendInfo)
    if (resp.err) {
        return RespError(res, RespCreateErr)
    }
    //将自己添加到对方好友列表里
    sql = 'select id,user_id,name from friend_group  where username=?'
    let usr2 = await Query(sql, [username])
    let friendInfo2 = {
        username: user.username,
        avatar: "",
        remark: user.username,
        group_id: usr2.results[0].id,
        user_id: user.id,
        room: uuid
    }
    error = await addFriend(friendInfo2)
    if (error) {
        return RespError(res, RespCreateErr)
    }
    //发送消息
    let message = {
        sender_id: user.id,
        receiver_id: usr2.results[0].user_id,
        type: 'private',
        media_type: 'text',
        status: 0,
        content: "我们已经是好友了!!",
        room: uuid
    }
    sql = 'insert into message set ?'
    await Query(sql, message)
    sql = 'insert into message_statistics set ?'
    await Query(sql, { room: uuid, total: 1 })
    return RespSucess(res)
}
//查询用户
async function SearchUser(req, res) {
    const { username } = req.query
    let sql = 'select * from user where username like ?'
    let { err, results } = await Query(sql, [`%${username}%`])
    // 查询数据失败
    if (err) return RespError(res, RespServerErr)
    let searchList = []
    if (results.length != 0) {
        let { id, username } = req.user
        sql = 'select id from friend_group  where user_id=?'
        for (const userInfo of results) {
            let flag = false
            if (userInfo.username == username) {
                continue
            }
            let res = await Query(sql, [id])
            let err2 = res.err, results2 = res.results
            // 查询数据失败
            if (err2) return RespError(res, RespServerErr)
            for (const item of results2) {
                let friends = await getFriendList(item.id)
                for (const item2 of friends) {
                    if (item2.username == userInfo.username) {
                        flag = true
                        //已经是朋友了
                        break
                    }
                }
                if (flag == true) {
                    break
                }
            }
            searchList.push({ name: userInfo.name, username: userInfo.username, status: flag, id: userInfo.id })
        }
    }
    RespData(res, searchList)
}
//查询好友信息
function getFriendList(group_id) {
    return new Promise((resolve, reject) => {
        const sql = 'select * from friend where group_id=?'
        db.query(sql, [group_id], async (err, results) => {
            resolve(results)
        })
    })
}
function getFriendInfo(username, group_id) {
    return new Promise((resolve, reject) => {
        const sql = 'select * from friend where group_id=? and username=?'
        db.query(sql, [group_id, username], async (err, results) => {
            resolve(results[0])
        })
    })
}
function getUserInfo(username) {
    return new Promise((resolve, reject) => {
        const sql = 'select * from user where username=?'
        db.query(sql, [username], async (err, results) => {
            resolve(results[0])
        })
    })
}
function addFriend(friendInfo) {
    return new Promise((resolve, reject) => {
        const sqlStr = 'insert into friend  set ?'
        db.query(sqlStr, friendInfo, (err, results) => {
            // 执行 SQL 语句失败了
            if (err) return err
            if (results.affectedRows === 1) {
                if (err) return RespError(res, RespServerErr)
                if (results.affectedRows === 1) {
                    return resolve("")
                }
                return "创建失败"
            }
        })
    })
}
