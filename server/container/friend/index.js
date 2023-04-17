module.exports = {
    List,
    AddFriend,
    SearchUser,
    getFriendInfo,
    createFriendGroup,
    updateFriendGroup,
    updateFriendInfo,
    getFriendGroupList
};
let { RespParamErr, RespServerErr, RespExitFriendErr, RespUpdateErr, RespCreateErr } = require('../../model/error');
const { v4: uuidv4 } = require('uuid');
const { RespError, RespSuccess, RespData } = require('../../model/resp');
const { Query } = require('../../db/query');
/**
 * 获取好友列表
 * 1.根据当前用户的id获取其所有好友分组的id和name
 * 2.然后再根据getFriendList传入好友分组的id获得相应的好友,最后插入到friendList中
 */
function List(req, res) {
    //根据id获取所有分组下的所有好友
    let id = req.user.id
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
/**
 * 发送添加好友通知(待取消)
 *  1.先判断当前好友是否已经是自己的好友了
 * 2.不存在则插入friend表中
 * 3.并将自己也插入到别人的好友列表中
 * 4.当前用户向对方发送一条消息,也就是向message表插入一条数据
 */
// async function toApplyForFriend(req, res) {
//     //获取当前登录用户的个人信息
//     let user = req.user
//     //获取自己的分组所有成员
//     let info = await getUserInfo(user.username)
//     //查询当前用户的分组下所有好友
//     let sql = 'select id,name from friend_group  where user_id=?'
//     let { err, results } = await Query(sql, [info.id])
//     //获取到要添加的username和其对应的id
//     let { username, id, content } = req.body
//     for (const item of results) {
//         let group_id = item.id
//         //判断用户是否已经是好友
//         let friendList = await getFriendList(group_id)
//         for (const friend of friendList) {
//             if (friend.username == username) {
//                 return RespError(res, RespExitFriendErr)
//             }
//         }
//     }
//     //添加通知
//     let notifyInfo = {
//         sender_username: user.username,
//         receiver_username: username,
//         content: content,
//         type: "new",
//     }
//     sql = 'insert into message_notify  set ?'
//     //添加通知
//     let resp = await Query(sql, notifyInfo)
//     if (resp.err) {
//         return RespError(res, RespCreateErr)
//     }
//     //如果对方在线,则发送通知
//     if (LoginRooms[username]) {
//         LoginRooms[username].send(JSON.stringify(notifyInfo))
//     }
//     return RespSuccess(res)
// }
/**
 * 添加好友
 * 1.先判断当前好友是否已经是自己的好友了
 * 2.不存在则插入friend表中
 * 3.并将自己也插入到别人的好友列表中
 * 4.当前用户向对方发送一条消息,也就是向message表插入一条数据
 */
async function AddFriend(req, res) {
    //获取当前登录用户的个人信息
    let user = req.user
    //获取自己的分组所有成员
    const sqlStr = 'select * from user where username=?'
    let resp = await Query(sqlStr, [user.username])
    let info = resp.results[0]
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
        file_size: 0,
        content: "我们已经是好友了!!",
        room: uuid
    }
    sql = 'insert into message set ?'
    await Query(sql, message)
    sql = 'insert into message_statistics set ?'
    await Query(sql, { room: uuid, total: 1 })
    //通知对方,让其好友列表进行更新
    NotificationUser({ receiver_username: username, name: "friend" })
    return RespSuccess(res)
}
/**
 * 查询用户
 * 1.查询用户表,模糊查询
 * 2.判断查询出来的数据中,判断是否存在已经好友的现象
 * 3.筛选出已经是好友的和不是好友的
 */
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
/**
 * 获取好友信息
 * 1.获取用户账号,昵称,备注,分组.个性签名,头像
 * 2.根据group_id和user_id查询friend表,获取user_id,username,remark和group_id
 * 3.根据user表获取头像,个性签名,昵称
 */
async function getFriendInfo(req, res) {
    const { group_id, user_id } = req.query
    let sql = 'SELECT user_id,room,user.username,user.signature,user.avatar,user.name,remark,group_id FROM friend,user WHERE group_id=? and user_id=? and user.id=?'
    let { err, results } = await Query(sql, [group_id, user_id, user_id])
    let userInfo = {
        user_id: "",
        username: "",
        avatar: "",
        name: "",
        remark: "",
        group_id: "",
        signature: "",
        room: "",
    }
    if (results.length > 0) {
        userInfo = results[0]
    }
    // 查询数据失败
    if (err) return RespError(res, RespServerErr)
    RespData(res, userInfo)
}
/**
 * 添加好友分组
 */
async function createFriendGroup(req, res) {
    const friend_group = req.body
    let sql = 'insert into friend_group set ?'
    let { err, results } = await Query(sql, friend_group)
    // 查询数据失败
    if (err) return RespError(res, RespServerErr)
    if (results.affectedRows === 1) {
        return RespSuccess(res)
    }
}
/**
 * 获取当前用户的分组列表
 */
async function getFriendGroupList(req, res) {
    let user_id = req.user.id
    const sql = 'select * from friend_group where user_id=?'
    let { err, results } = await Query(sql, [user_id])
    // 查询数据失败
    if (err) return RespError(res, RespServerErr)
    RespData(res, results)
}
/**
 * 修改好友分组
 */
async function updateFriendGroup(req, res) {
    const { name, user_id, old_name } = req.body
    let sql = 'update friend_group set name=? where user_id=? and name=?'
    let { err, results } = await Query(sql, [name, user_id, old_name])
    // 查询数据失败
    if (err) return RespError(res, RespServerErr)
    if (results.affectedRows === 1) {
        return RespSuccess(res)
    }
    return RespError(res, RespUpdateErr)
}
/**
 * 修改好友的信息
 */
async function updateFriendInfo(req, res) {
    const { old_group_id, user_id, new_group_id, remark } = req.body
    let sql = 'update friend set group_id=?,remark=? where user_id=? and group_id=?'
    let { err, results } = await Query(sql, [new_group_id, remark, user_id, old_group_id])
    // 查询数据失败
    if (err) return RespError(res, RespServerErr)
    if (results.affectedRows === 1) {
        return RespSuccess(res)
    }
    return RespError(res, RespUpdateErr)
}
//查询好友信息
async function getFriendList(group_id) {
    const sql = 'select * from friend where group_id=?'
    let { results } = await Query(sql, [group_id])
    return results
}
//添加好友
async function addFriend(friendInfo) {
    const sqlStr = 'insert into friend  set ?'
    let { err, results } = await Query(sqlStr, friendInfo)
    // 执行 SQL 语句失败了
    if (err) return err
    if (results.affectedRows === 1) {
        if (err) return RespError(res, RespServerErr)
        if (results.affectedRows === 1) {
            return ""
        }
        return "创建失败"
    }
}
