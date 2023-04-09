module.exports = {
    SingleRTCConnect
};
const path = require('path');

let { RespParamErr, RespServerErr, RespExitFriendErr, RespUpdateErr, RespCreateErr } = require('../../model/error');
const { RespError, RespSucess, RespData } = require('../../model/resp');
const { Query } = require('../../db/query');
const fs = require('fs');
const { generateRandomString, notExitCreate } = require('../../utils/utils')
const { getIpAddress } = require('../../utils/ipaddr');
let rooms = {}
//建立音视频聊天
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
    let flag = false
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
                ListenWs = rooms[room][username + "_listen"]
                ListenWs.send(JSON.stringify({ name: "status", flag: true }))
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
                ListenWs = rooms[room][username + "_listen"]
                ListenWs.send(JSON.stringify({ name: "status", flag: true }))
                flag = true
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
                flag = true
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
                flag = false
                BroadcastSocket(username, room, msg)
                ListenWs = rooms[room][username + "_listen"]
                ListenWs.send(JSON.stringify({ name: "status", flag: false }))
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
        if (key == username || key == username + '_listen') {
            continue
        }
        if (rooms[room][key]) {
            let ws = rooms[room][key]
            ws.send(JSON.stringify(data))
        }
    }
}