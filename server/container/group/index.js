module.exports = {
    List,
    MembersList,
    CreateGroupChat,
    SearchGroupChat,
    JoinGroupChat,
    GroupInfo,
    RenameGroup,
    invitedUsersToGroup,
    DeleteUserFromGroup,
    GetRTCUser,
};
let { RespParamErr, RespServerErr, RespExitFriendErr, RespUpdateErr, RespCreateErr, RespExitGroupErr, RespGroupInsertError, RespGroupDeletError } = require('../../model/error');
const { RespError, RespSuccess, RespData } = require('../../model/resp');
const { Query } = require('../../db/query');
const { v4: uuidv4 } = require('uuid');
/**
 * 获取当前用户加入的所有群聊
 * 1.获取当前用户id
 * 2.根据group_members获取所有group_id,在根据left join获取group_chat对应的id下的群聊信息
 * 3.根据group_id,使用count(*)获取group_members的成员数量
 */
async function List(req, res) {
    //根据id获取所有分组下的所有好友
    let id = req.user.id
    let groupChatList = []
    let sql = 'SELECT gct.*  from ((select group_id from group_members   where user_id=?) as gmb LEFT JOIN group_chat as gct on gmb.group_id=gct.id)'
    let { err, results } = await Query(sql, [id])
    if (err) return RespError(res, RespServerErr)
    groupChatList = results
    for (const index in groupChatList) {
        sql = 'select count(*) as members_len from group_members where group_id=?'
        let resp = await Query(sql, [groupChatList[index].id])
        groupChatList[index].members_len = resp.results[0].members_len
    }
    return RespData(res, groupChatList)
}
/**
 * 获取群聊中所有群员
 * 1.获取group_id
 * 2.根据group_members获取所有user_id,在根据user表获取username
 */
async function MembersList(req, res) {
    let { group_id } = req.query
    let sql = 'select username from group_members,user where group_id=? and user_id=user.id'
    let { err, results } = await Query(sql, [group_id])
    if (err) return RespError(res, RespServerErr)
    let userList = []
    for (const { username } of results) {
        userList.push(username)
    }
    return RespData(res, userList)

}
//创建群聊
async function CreateGroupChat(req, res) {
    let fileName
    if (req.file) {
        fileName = req.file.filename;
    }
    let info = req.body
    const uuid = uuidv4();
    let group_chat = {
        name: info.name,
        creator_id: req.user.id,
        avatar: "",
        announcement: info.announcement,
        room: uuid
    }

    if (fileName) {
        group_chat.avatar = `/uploads/group/${fileName}`
    }

    //创建群聊
    let sql = 'insert into group_chat  set ?'
    let { err, results } = await Query(sql, group_chat)
    // 查询数据失败
    if (err) return RespError(res, RespServerErr)
    if (results.affectedRows === 1) {
        //发送消息
        let message = {
            sender_id: req.user.id,
            receiver_id: results.insertId,
            type: 'group',
            media_type: 'text',
            status: 0,
            content: "大家可以一起聊天了!!",
            room: uuid
        }
        sql = 'insert into message set ?'
        await Query(sql, message)
        sql = 'insert into message_statistics set ?'
        await Query(sql, { room: uuid, total: 1 })
        let members = JSON.parse(info.members)
        //插入自己
        members.push({
            id: req.user.id,
            name: req.user.name,
            avatar: req.user.avatar
        })
        //插入成员
        for (const member of members) {
            let memberInfo = {
                group_id: results.insertId,
                user_id: member.id,
                nickname: member.name
            }
            sql = 'insert into group_members  set ?'
            await Query(sql, memberInfo)
        }
        let options = {
            room: uuid,
            group_id: results.insertId
        }
        return RespData(res, options)
    }

    return RespError(res, RespCreateErr)
}
/**
 * 查询群聊
 * 1.根据name查询group_chat获取相似的所有群聊
 * 2.根据user_id和id查询group_members判断当前用户是否加入群聊
 */
//查询群聊
async function SearchGroupChat(req, res) {
    const { name } = req.query
    let sql = 'select * from group_chat where name like ?'
    let { err, results } = await Query(sql, [`%${name}%`])
    // 查询数据失败
    if (err) return RespError(res, RespServerErr)
    let searchList = []
    if (results.length != 0) {
        let { id } = req.user
        sql = 'select id,user_id from group_members  where group_id=?'
        for (const item of results) {
            let status = false
            let res = await Query(sql, [item.id, id])
            let err2 = res.err, results2 = res.results
            for (const { user_id } of results2) {
                if (user_id == id) {
                    status = true
                    break
                }
            }
            searchList.push({ name: item.name, number: results2.length, status: status, group_id: item.id })
        }
    }
    RespData(res, searchList)
}

async function JoinGroupChat(req, res) {
    let group_id = req.query.group_id
    let { id, name } = req.user
    let sql = "select id from group_members  where group_id=? and user_id=?"
    let { err, results } = await Query(sql, [group_id, id])
    // 查询数据失败
    if (err) return RespError(res, RespServerErr)
    if (results.length != 0) {
        return RespError(res, RespExitGroupErr)
    }
    let info = {
        group_id: group_id,
        user_id: id,
        nickname: name
    }
    //插入成员
    sql = 'insert into group_members  set ?'
    let resp = await Query(sql, info)
    err = resp.err
    // 查询数据失败
    if (err) return RespError(res, RespServerErr)
    sql = 'select room from group_chat where id=?'
    resp = await Query(sql, [group_id])
    let options = {
        room: resp.results[0].room,
        group_id: group_id
    }
    return RespData(res, options)
}
/**
 * 群聊信息
 * 1.需要获取群介绍,群主,所有群成员(头像,群昵称,name,加入群聊时间,最后发言时间)
 * 2.根据group_id查询group_chat表获取群主的id,房间room,群介绍,头像
 * 3. 根据group_id查询group_numbers表获取群成员的user_id,nickname,created_at,并查询user表获取相关的头像,name
 * 4.使用left join 根据user_id和room查询message表获取用户的最后一次发消息时间
 */
async function GroupInfo(req, res) {
    let group_id = req.query.group_id
    let info = {}
    let sql = 'select * from group_chat where id=?'
    let { err, results } = await Query(sql, [group_id])
    // 查询数据失败
    if (err) return RespError(res, RespServerErr)
    let { id, creator_id, avatar, announcement, room, name, created_at } = results[0]
    info = {
        id, name, creator_id, avatar, announcement, room, created_at, members: []
    }
    sql = "SELECT s.*,m.lastMessageTime FROM  (SELECT user_id,user.avatar,user.name,nickname,group_members.created_at FROM group_members,user WHERE group_id=?  and user_id=user.id) as s left JOIN (SELECT sender_id,Max(created_at) as lastMessageTime FROM message as msg WHERE msg.room=? GROUP BY sender_id) as m on m.sender_id=s.user_id"
    let resp = await Query(sql, [group_id, room])
    err = resp.err, results = resp.results
    // 查询数据失败
    if (err) return RespError(res, RespServerErr)
    for (const item of results) {
        info.members.push({ ...item })
    }
    return RespData(res, info)
}
/**
 * 邀请好友进入群聊
 * 1. 获取邀请名单和group_id
 * 2.根据group_id查询group_numbers表去筛选邀请名单,过滤掉已经存在群里的用户
 * 3. insert into group_members  set ?插入数据
 */
async function invitedUsersToGroup(req, res) {
    let { invitationList, group_id } = req.body
    let sql = "SELECT u.name,u.id,gms.nickname FROM (SELECT id,name FROM user as u WHERE FIND_IN_SET(id, ?)) as u LEFT JOIN group_members as gms on group_id=? and u.id=gms.user_id"
    //获取邀请名单的用户信息,根据nickname为空来判断群是否包含该用户
    let { err, results } = await Query(sql, [invitationList.join(","), group_id])
    // 查询数据失败
    if (err) return RespError(res, RespServerErr)
    let invitationInfoList = []
    for (const item of results) {
        if (!item.nickname) {
            invitationInfoList.push({
                group_id: group_id,
                user_id: item.id,
                nickname: item.name
            })
        }
    }
    if (invitationInfoList.length == 0) {
        return RespError(res, RespGroupInsertError)
    }
    //插入成员
    sql = 'insert into group_members  set ?'
    let resp = await Query(sql, invitationInfoList)
    err = resp.err
    // 查询数据失败
    if (err) return RespError(res, RespServerErr)
    return RespSuccess(res)
}
/**
 * 重命名好友分组
 */
async function RenameGroup(req, res) {
    const { name, group_id, old_name } = req.body
    console.log(name, group_id, old_name);
    let sql = 'update group_chat set name=? where id=? and name=?'
    let { err, results } = await Query(sql, [name, group_id, old_name])
    // 查询数据失败
    if (err) return RespError(res, RespServerErr)
    if (results.affectedRows === 1) {
        return RespSuccess(res)
    }
    return RespError(res, RespUpdateErr)
}
/**
 * 退出群聊
 * 1.先判断是否为创建者,如果是创建者则会解散整个群聊
 * 2.从group_members删除当前用户
 * 3.删除当前用户在群聊中的所有聊天记录
 */
async function DeleteUserFromGroup(req, res) {
    let { group_id } = req.body
    let user_id = req.user.id
    let sql = "select creator_id,room from group_chat where id=?"
    let { err, results } = await Query(sql, [group_id])
    // 查询数据失败
    if (err) return RespError(res, RespServerErr)
    if (results.length == 0) {
        return RespError(res, RespGroupDeletError)
    }
    let room = results[0].room
    if (results[0].creator_id == user_id) {
        sql = 'DELETE FROM group_chat WHERE id=?'
        let resp = await Query(sql, [group_id])
        err = resp.err, results = resp.results
        // 查询数据失败
        if (err) return RespError(res, RespServerErr)
        if (results.affectedRows != 1) {
            return RespError(res, RespGroupDeletError)
        }
        //删除相对于的所有聊天记录
        sql = 'DELETE FROM message WHERE type="group" and room=?'
        await Query(sql, [room])
    } else {
        sql = 'DELETE FROM group_members WHERE  user_id=? and group_id=?'
        let resp = await Query(sql, [user_id, group_id])
        err = resp.err, results = resp.results
        // 查询数据失败
        if (err) return RespError(res, RespServerErr)
        if (results.affectedRows !== 1) {
            return RespError(res, RespGroupDeletError)
        }
        //删除相对于的所有聊天记录
        sql = 'DELETE FROM message WHERE type="group" and room=? and (sender_id = ? OR receiver_id= ?)'
        await Query(sql, [room, user_id, user_id])
    }
    return RespSuccess(res)
}
/**
 * 获取音视频指定房间的所有用户
 * 1获取group_rooms所有用户
 * 2.查询group_members和user获取头像
 * 
 */
async function GetRTCUser(req, res) {
    let { group_id, room } = req.query
    let userList = {}
    for (const username in group_rooms[room]) {
        let sql = "SELECT avatar FROM group_members,user WHERE group_id=? and group_members.user_id=user.id and username=?"
        let resp = await Query(sql, [group_id, username])
        // 查询数据失败
        if (resp.err) continue
        if (resp.results.length != 0) {
            userList[username] = { avatar: resp.results[0].avatar, accept: false, name: username }
        }
    }
    return RespData(res, userList)
}