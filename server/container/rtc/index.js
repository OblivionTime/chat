module.exports = {
    SingleRTCConnect
};
const path = require('path');

let { RespParamErr, RespServerErr, RespExitFriendErr, RespUpdateErr, RespCreateErr } = require('../../model/error');
const { RespError, RespSuccess, RespData } = require('../../model/resp');
const { Query } = require('../../db/query');
const fs = require('fs');
const { generateRandomString, notExitCreate } = require('../../utils/utils')
let rooms = {}
/**
 * 建立音视频聊天
 * 1. 获取房间号和当前用户名
 * 2. createRoom 邀请人会发送创建房间指令,广播给当前房间的所有人,如果被邀请者在线的话,会接受到请求,自动打开语音/视频通话界面
 * 3. peer 被邀请人收到邀请后,前端点击同意后,会携带自己的音视频流数据发送peer指令给后端,后端在发送offer指令(携带了相对于的数据)给邀请人
 * 4. answer 邀请人接受到数据后将数据进行处理后发送answer指令给被邀请人并携带自己的音视频流
 * 5. ice_candidate 双方建立音视频通道后发送ice_candidate数据
 */
async function SingleRTCConnect(ws, req) {
    //获取name
    let url = req.url.split("?")[1];
    let params = new URLSearchParams(url)
    let room = params.get("room")
    let username = params.get("username")
    if (!rooms[room]) {
        rooms[room] = {}
    }
    rooms[room][username] = ws
    ws.on('message', async (Resp_data) => {
        let message = JSON.parse(Resp_data)
        let msg
        let receiverWs
        switch (message.name) {
            //创建房间
            case 'createRoom':
                //发送邀请
                msg = {
                    name: message.mode,
                    sender: username
                }
                BroadcastSocket(username, room, msg)
                break;
            //被邀请方接收
            case 'peer':
                //发送offer
                msg = {
                    name: "offer",
                    sender: username,
                    data: message.data
                }
                receiverWs = rooms[room][message.receiver]
                receiverWs.send(JSON.stringify(msg))
                break;
            //接收answer
            case 'answer':
                //接收answer
                msg = {
                    name: "answer",
                    sender: username,
                    data: message.data
                }
                receiverWs = rooms[room][message.receiver]
                receiverWs.send(JSON.stringify(msg))
                break
            case 'ice_candidate':
                //接收answer
                msg = {
                    name: "ice_candidate",
                    sender: username,
                    data: message.data,
                }
                receiverWs = rooms[room][message.receiver]
                receiverWs.send(JSON.stringify(msg))
                break
            //被邀请方拒绝
            case 'reject':
                //发送offer
                msg = {
                    name: "reject",
                    sender: username
                }
                console.log(username, msg);
                BroadcastSocket(username, room, msg)
                NotificationUser({ name: "reject", receiver_username: username, message: "" })
                break;
        }
    })
    ws.on('close', () => {
        rooms[room][username] = ""
    })
}
//发送给其他人
function BroadcastSocket(username, room, data) {
    for (const key in rooms[room]) {
        if (key == username) {
            continue
        }
        if (rooms[room][key]) {
            let ws = rooms[room][key]
            ws.send(JSON.stringify(data))
        }
    }
}