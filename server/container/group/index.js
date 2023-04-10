module.exports = {
    List,
    CreateGroupChat,
    SearchGroupChat,
    JoinGroupChat
};
let { RespParamErr, RespServerErr, RespExitFriendErr, RespUpdateErr, RespCreateErr, RespExitGroupErr } = require('../../model/error');
const { RespError, RespSucess, RespData } = require('../../model/resp');
const { Query } = require('../../db/query');
const { v4: uuidv4 } = require('uuid');
async function List(req, res) {
    //根据id获取所有分组下的所有好友
    let id = req.user.id
    let sql = 'select id,name,avatar from group_chat  where creator_id=?'
    let { err, results } = await Query(sql, [id])
    // 查询数据失败
    if (err) return RespError(res, RespServerErr)
    let groupChatList = []
    if (results.length != 0) {
        for (const item of results) {
            let groupChat = { name: item.name, members: [], id: item.id, avatar: item.avatar }
            sql = 'select * from group_members  where group_id=?'
            let res = await Query(sql, [item.id])
            let members = res.results
            for (const item2 of members) {
                groupChat.members.push(item2)
            }
            groupChatList.push(groupChat)
        }
    }
    return RespData(res, groupChatList)
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

        return RespSucess(res)
    }
    return RespError(res, RespCreateErr)
}
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
        sql = 'select id from group_members  where group_id=?'
        for (const item of results) {
            let res = await Query(sql, [item.id])
            let err2 = res.err, results2 = res.results
            searchList.push({ name: item.name, number: results2.length, status: item.creator_id == id, group_id: item.id })
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
    return RespSucess(res)
}