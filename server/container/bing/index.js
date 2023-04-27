
let { RespUserOrPassErr, RespParamErr, RespServerErr, RespUserExitErr, RespUpdateErr, RespUserNotExitErr } = require('../../model/error');
const os = require('os');
const { Query } = require('../../db/query');
const { getConversation } = require('../../utils/newBing');
const { v4: uuidv4 } = require('uuid');
let bing_rooms = {}
/**
 *  生成Conversation
 *  1.获取当前登录的用户名,并获取到前端传来的代理服务器地址
 *  2.判断之前是否已经生成过,如果未生成的话需要创建一个房间号
 *  2.调用getConversation函数5次生成conversationId,clientId和conversationSignature
 *  3.将其存储到ai_conversation表中
 */
//生成密钥对
async function generateConversation(req, res) {
    if (os.platform() !== 'win32') {
        return RespError(res, RespServerErr)
    }
    //获取当前登录的用户名
    let username = req.user.username
    const { proxy } = req.query
    let sql = "select room from ai_conversation where username=?"
    let { err, results } = await Query(sql, [username])
    // 查询数据失败
    if (err) return RespError(res, RespServerErr)
    let room
    if (results.length != 0) {
        room = results[0].room
    } else {
        room = uuidv4();
    }
    let index = 0
    for (; index < 3; index++) {
        let result = await getConversation(proxy)
        if (result.code == 200) {
            let aiConversationInfo = {
                username,
                room,
                conversation_id: result.data.conversationId,
                conversation_signature: result.data.conversationSignature,
                client_id: result.data.clientId,
                count: 0,
            }
            sql = 'insert into ai_conversation set ?'
            await Query(sql, aiConversationInfo)
        } else {
            if (index == 0) {
                return RespError(res, result.code)
            }
        }
    }
    return RespSuccess(res)

}
/**
 * 获取当前用户的conversation
 * 1.获取当前登录的用户名
 * 2.将更新时间超过6小时的conversation重置
 * 2.查询ai_conversation表,获取到可聊天总数和已用次数
 * 3.查询ai_conversation表,根据count和create_at来获取正在使用的conversationId和conversationSignature
 */
async function getConversationInfo(req, res) {
    let username = req.user.username
    //将更新时间超过6小时的conversation重置
    let sql = "update ai_conversation set count=0 where username=? and TIMESTAMPDIFF(hour, updated_at, NOW()) >= 6"
    await Query(sql, [username])
    //获取到可聊天总数和已用次数
    sql = "select count(*) as total,SUM(count) as us_count,room  from ai_conversation where username=? GROUP BY room"
    let { err, results } = await Query(sql, [username])
    // 查询数据失败
    if (err) return RespError(res, RespServerErr)
    let data = {
        total: 0,
        us_count: 0,
        room: "",
        conversation_id: "",
        conversation_signature: ""
    }
    if (results.length == 0) {
        return RespData(res, data)
    }
    data.total = results[0].total * 20
    data.us_count = results[0].us_count
    data.room = results[0].room
    if (data.total <= data.us_count) {
        data.us_count = data.total
        return RespData(res, data)
    }
    //根据count和create_at来获取正在使用的conversationId和conversationSignature
    sql = "select conversation_id,conversation_signature,client_id,count as invocation_id from ai_conversation where username=? and count<20 ORDER BY created_at ASC LIMIT 1"
    if (err) return RespError(res, RespServerErr)
    let res2 = await Query(sql, [username])
    err = res2.err, results = res2.results
    // 查询数据失败
    if (err) return RespError(res, RespServerErr)
    if (results.length == 0) {
        return RespData(res, data)
    }
    data.conversation_id = results[0].conversation_id
    data.conversation_signature = results[0].conversation_signature
    data.client_id = results[0].client_id
    data.invocation_id = results[0].invocation_id
    return RespData(res, data)
}
async function BingConnect(ws, req) {
    //获取name
    let url = req.url.split("?")[1];
    let params = new URLSearchParams(url)
    let room = params.get("room")
    bing_rooms[room] = ws
    //获取所有聊天记录
    let sql = 'SELECT m.*,u.avatar FROM (SELECT sender_id, receiver_id, content, room, link_list,ai_message.created_at,invocation_id FROM ai_message WHERE `room` =? ORDER BY created_at ASC) AS m LEFT JOIN user as u ON u.`id`=m.`sender_id`'
    let { err, results } = await Query(sql, [room])
    let histroyMsg = results.map((item) => {
        return {
            "sender_id": item.sender_id,
            "receiver_id": item.receiver_id,
            "content": item.content,
            "type": "text",
            "avatar": item.avatar,
            LinkList: item.link_list,
            invocation_id: item.invocation_id
        }
    })
    ws.send(JSON.stringify(histroyMsg))
    /**
     * 接受到对方发来的消息
     * 1. 如果是new bing 发来的消息,当发出提问时会返回一个numUserMessagesInConversation参数(已经提问的次数),将ai_conversation表对应的count修改成numUserMessagesInConversation,当count等于20时则要提示用户更新conversation
     * 2. 当new bing 回答完成后将结果进行存储,
     * 3. 如果是用户的话直接进行存储
     */
    ws.on('message', async (Resp_data) => {
        let message = JSON.parse(Resp_data)
        let sql
        if (message.sender_id == 0 && message.numUserMessagesInConversation) {
            sql = `update  ai_conversation set count=?  where conversation_id=? and conversation_signature=?`
            await Query(sql, [message.numUserMessagesInConversation, message.conversation_id, message.conversation_signature])
            if (message.numUserMessagesInConversation == 20) {
                if (bing_rooms[room]) {
                    bing_rooms[room].send(JSON.stringify({ "name": "reset" }))
                }
            }
            return
        }
        let msg = {
            sender_id: message.sender_id,
            receiver_id: message.receiver_id,
            content: message.content,
            link_list: JSON.stringify(message.LinkList),
            room: message.room,
            conversation_id: message.conversation_id,
            conversation_signature: message.conversation_signature,
            client_id: message.client_id,
            invocation_id: message.invocation_id,
        }

        //如果是用户的话直接进行存储
        sql = 'insert into ai_message set ?'
        await Query(sql, msg)
    })
}
module.exports = {
    generateConversation,
    getConversationInfo,
    BingConnect
};
