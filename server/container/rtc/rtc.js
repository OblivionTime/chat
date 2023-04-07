const events = require('events');
let util = require('util');
function HLRTC() {
    //所有的房间
    this.rooms = {};
    const HandlerError = (socket, errMsg) => {
        socket.send(JSON.stringify({
            "eventName": "_error",
            "data": {
                "errMsg": errMsg
            }
        }))
    }
    //创建房间
    this.on('_create', (data, socket) => {
        //根据时间戳创建房间
        let room = new Date().getTime()
        // let room = 1675845278127
        console.log(`用户${data.name}:创建房间号:${room}`);
        this.rooms[room] = {}
        this.rooms[room][data.name] = socket
        this.homeowners = data.name
        socket.send(JSON.stringify({
            "eventName": "_created",
            "data": {
                "room": room,
            }
        }))
    })
    //加入房间
    this.on('_join', (data, socket) => {
        /**
         * 通知房主有新用户加入,传递新用户的name和房间号
         */
        let { room, name, type } = data

        if (!this.rooms.hasOwnProperty(room)) {
            //房间不存在
            HandlerError(socket, '房间不存在')
            return
        }
        if (Object.keys(this.rooms[room]).length == 2 && type == 'single') {
            //房间人员已满
            HandlerError(socket, '无法加入房间,人员已满')
            return
        }
        for (const key in this.rooms[room]) {
            let sc = this.rooms[room][key]
            sc.send(JSON.stringify({
                "eventName": "_new_peer",
                "data": {
                    "socketId": name,
                    "room": room
                }
            }))
            socket.send(JSON.stringify({
                "eventName": "_peer",
                "data": {
                    "socketId": key,
                    "room": room
                }
            }))
        }
        this.rooms[room][name] = socket

        console.log(`用户${name}:加入房间号:${room},房间人数为:${Object.keys(this.rooms[room]).length}`);
    })
    //webrtc相关传输
    //offer
    this.on('_offer', (data) => {
        /**
         * 房主向新用户发送offer,需要房主发送新用户socketId,房间号,sdp,房主根据socketID获取到新用户的socket
         */
        let { socketId, room, sdp, name, m } = data
        let socket = this.getSocket(room, socketId)
        if (socket) {
            socket.send(JSON.stringify({
                "eventName": "_offer",
                "data": {
                    "sdp": sdp,
                    'room': room,
                    "socketId": name,
                }
            }))
        }

    })
    //answer
    this.on('_answer', (data) => {
        /**
         * 新用户发送回应给房主,则需要发送sdp和房间号给房主
         */
        let { room, sdp, socketId, name } = data
        let socket = this.getSocket(room, socketId)
        if (socket) {
            socket.send(JSON.stringify({
                "eventName": "_answer",
                "data": {
                    "sdp": sdp,
                    'room': room,
                    "socketId": name,
                }
            }))
        }



    })
    //接收icecandidate
    this.on('_ice_candidate', (data) => {
        let { socketId, room, label, id, candidate, name } = data
        let socket = this.getSocket(room, socketId)
        if (socket) {
            socket.send(JSON.stringify({
                "eventName": "_ice_candidate",
                "data": {
                    "id": id,
                    "label": label,
                    "sdpMLineIndex": label,
                    "candidate": candidate,
                    'socketId': name
                }
            }))
        }

    })
    //offline
    this.on('_offline', (data) => {
        let { room, name } = data
        delete this.rooms[room][name]
        if(!this.rooms[room]){
            delete this.rooms[room]
        }
    })

}
HLRTC.prototype.getSocket = function (room, name) {
    return this.rooms[room][name]
}
HLRTC.prototype.findRoom = function (room) {
    for (const key in this.rooms) {
        if (key == room) {
            return ''
        }
    }
    return '房间不存在'
}
HLRTC.prototype.init = function (socket) {
    let name = socket.name
    //发送消息
    socket.on('message', message => {
        try {
            let json = JSON.parse(message);
            json.data.name = name
            if (json.eventName) {
                this.emit(json.eventName, json.data, socket);
            } else {
                this.emit("socket_message", socket, data);
            }
        } catch (error) {
            console.log(error);
        }
    });

    //退出
    socket.on('close', () => {

    });

}
util.inherits(HLRTC, events.EventEmitter);
//HLRTC
let HLRTCServer = new HLRTC();

module.exports = HLRTCServer;