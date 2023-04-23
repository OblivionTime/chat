<template>
    <div class="audio-bg">
        <div class="audio-cover"></div>
        <div class="audio-content">

            <div class="audio-choses" v-if="!flag">
                <img :src="require('@/assets/logo.png')" alt=""
                    style="width: 200px;height:200px;object-fit: cover;object-position: center;">
                <div style="color: white;">你接收到群通话!!!</div>
                <div>
                    <img src="../../assets/chat/accept.png" alt="" width="50" @click="acceptAudio">
                    <img src="../../assets/chat/reject.png" alt="" width="50" @click="rejectAudio">
                </div>
            </div>

            <div class="audio-accept" v-if="flag">
                <div class="audio-headers">
                    <div class="audio-avatar" v-for="item, index in userList" :key="index">
                        <div  :id="'loading_' + item.name">
                            <img :src="item.avatar ? getAvatarPath(item.avatar) : require('@/assets/black.png')" alt=""
                            style="width: 100%;height: 100%;object-fit: contain;object-position: center;"
                           >
                        </div>
                        
                        <video :id="'video_' + item.name" autoplay
                            style="width: 100%;height: 100%;object-fit: contain;object-position: center;"
                            :poster="item.avatar ? getAvatarPath(item.avatar) : require('@/assets/black.png')"
                            v-if="item.accept"></video>
                    </div>
                </div>
                <div style="color: white;">{{ broadcastTime }}</div>
                <img src="../../assets/chat/reject.png" alt="" width="50" @click="rejectAudio">
            </div>
        </div>
    </div>
</template>

<script>
let PeerConnection =
    window.PeerConnection ||
    window.webkitPeerConnection00 ||
    window.webkitRTCPeerConnection ||
    window.mozRTCPeerConnection;
let nativeRTCIceCandidate =
    window.mozRTCIceCandidate || window.RTCIceCandidate;
let nativeRTCSessionDescription =
    window.mozRTCSessionDescription || window.RTCSessionDescription;
//ice服务器地址
const iceServer = {
    iceServers: [
        {
            url: "turn:42.192.40.58:3478?transport=udp",
            username: "ddssingsong",
            credential: "123456",
        },
        {
            url: "turn:42.192.40.58:3478?transport=tcp",
            username: "ddssingsong",
            credential: "123456",
        },
    ],
};
const remote = window.require('electron').remote;
const win = remote.getCurrentWindow();
import { GetRTCUser } from '@/api/group';
export default {
    data() {
        return {
            flag: false,
            beInviter: false,
            group_id: '',
            room: "",
            socket: "",
            username: "",
            localStream: "",
            pc: "",
            broadcastTime: "00:00:00",
            receiver: "",
            startTime: 0,
            userList: {},
            timer: "",
            loading: []
        };
    },
    created() {
        this.beInviter = this.$route.query.beInviter == 1
        this.room = this.$route.query.room
        this.username = this.$store.getters.userInfo.username
        this.group_id = this.$route.query.group_id
        this.startTime = new Date().getTime() / 1000

    },
    mounted() {
        this.loadData()
        // //检测窗口关闭,自动挂断电话
        win.on('close', (event) => {
            if (this.socket) {
                this.socket.send(JSON.stringify({
                    name: "reject",
                }))
                this.socket.close()
            }
            if (this.timer) {
                clearInterval(this.timer)
                this.timer = null
            }
        });

    },
    methods: {
        loadData() {
            GetRTCUser({ group_id: this.group_id, room: this.room })
                .then((res) => {
                    if (res.code == 200) {
                        this.userList = res.data
                        this.initSocket()
                    }
                })
        },
        //初始化websocket
        initSocket() {
            this.socket = new WebSocket(`${this.wssaddress}/api/chat/v1/rtc/group?room=${this.room}&username=${this.$store.getters.userInfo.username}`)
            this.socket.onopen = async () => {
                //如果是邀请人则发送创建房间指令
                if (!this.beInviter) {
                    /**
                     * 1.邀请人先创建麦克风并初始化PC源
                     * 2.发送创建房间的指令到当前房间,后端接受到指令后,给当前房间的所有用户发送响应的指令
                     */
                    this.timer = setInterval(() => {
                        this.updateTime()
                    }, 1000)
                    this.flag = true
                    try {
                        //最新的标准API
                        let stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true })
                        this.localStream = stream
                        let item = this.userList[this.username]
                        item.accept = true
                        this.$set(this.userList, this.username, item)
                        this.$nextTick(() => {
                            let videoDoc = document.getElementById("video_" + this.username)
                            videoDoc.srcObject = stream
                        });
                        //发起邀请
                        this.socket.send(JSON.stringify({ "name": "createRoom", mode: "audio_invitation" }))
                    } catch (error) {
                        alert("检测到当前设备不支持麦克风,请设置权限后在重试")
                        this.socket.send(JSON.stringify({
                            name: "reject",
                        }))
                        this.socket.close()
                    }
                    for (const key in this.userList) {
                        if (key == this.username) {
                            continue
                        }
                        let item = this.userList[key]
                        this.loading[item.name] = this.$loading({
                            target: document.getElementById("loading_" + item.name),
                            lock: true,
                            text: '正在邀请中...',
                            spinner: 'el-icon-loading',
                            background: 'rgba(0, 0, 0, 0.7)'
                        });
                    }

                }
            };
            this.socket.onmessage = (message) => {
                let data = JSON.parse(message.data)
                switch (data.name) {
                    //邀请人接收到有新人加入时进行相应
                    case "new_peer":
                        let item = this.userList[data.username]
                        item.accept = true
                        this.$set(this.userList, data.username, item)
                        this.userList[data.username].pc = this.initPC(data.username)
                        this.userList[data.username].pc.addStream(this.localStream)
                        this.userList[data.username].pc.createOffer((session_desc) => {
                            this.userList[data.username].pc.setLocalDescription(session_desc);
                            this.socket.send(
                                JSON.stringify({
                                    name: "offer",
                                    data: {
                                        sdp: session_desc,
                                    },
                                    receiver: data.username,
                                })
                            );
                        }, (err) => {
                            console.log(err);
                        });
                        break

                    /**
                     * 1.邀请人接受到对方同意的指令后,将对方的音视频流通过setRemoteDescription函数进行存储
                     * 2.存储完后邀请人创建answer来获取自己的音视频流,通过setLocalDescription函数存储自己的音视频流,并发送answer指令(携带自己的音视频)告诉对方要存储邀请人的音视频
                     */
                    case "offer":
                        try {
                            let item = this.userList[data.username]
                            item.accept = true
                            this.$set(this.userList, data.username, item)
                            //初始化当前用户的PC源
                            this.userList[data.username].pc = this.initPC(data.username)
                            //添加音频流
                            this.userList[data.username].pc.addStream(this.localStream)
                            //当收到对方接收请求后,设置音频源,并发送answer给对方
                            this.userList[data.username].pc.setRemoteDescription(new nativeRTCSessionDescription(data.data.sdp));
                            this.userList[data.username].pc.createAnswer((session_desc) => {
                                this.userList[data.username].pc.setLocalDescription(session_desc);
                                this.socket.send(
                                    JSON.stringify({
                                        name: "answer",
                                        data: {
                                            sdp: session_desc,
                                        },
                                        receiver: data.username,
                                    })
                                )
                            }, (err) => {
                                console.log(err);
                            })
                        } catch (error) {
                            console.log(error);
                        }

                        break;
                    case "answer":
                        //设置邀请方发来的音频源
                        this.userList[data.username].pc.setRemoteDescription(new nativeRTCSessionDescription(data.data.sdp));
                        break
                    case "ice_candidate":
                        var candidate = new nativeRTCIceCandidate(data.data);
                        this.userList[data.username].pc.addIceCandidate(candidate);
                        break
                    case 'reject':
                        delete this.userList[data.username]
                        this.$forceUpdate()
                        break
                    default:
                        break;
                }
            }
            this.socket.onclose = () => {
                setTimeout(() => {
                    win.close()
                }, 1000);
            }
        },
        //接收情况
        async acceptAudio() {
            /**
             * 1.点击同意后
             * 2.获取自己的视频流
             * 3.初始化PC源
             * 4.PC添加音视频流
             * 5.创建offer,获取自己的音视频流,并通过setLocalDescription函数存储自己的音视频流
             * 6.并发送peer指令(携带自己的音视频)告诉邀请人要存储自己的音视频
             */
            try {
                //最新的标准API
                let stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true })
                this.localStream = stream
                this.flag = true
                let item = this.userList[this.username]
                item.accept = true
                this.$set(this.userList, this.username, item)
                this.$nextTick(() => {
                    this.timer = setInterval(() => {
                        this.updateTime()
                    }, 1000)
                    let videoDoc = document.getElementById("video_" + this.username)
                    videoDoc.srcObject = stream

                    this.socket.send(
                        JSON.stringify({
                            name: "new_peer",
                            data: {
                                username: this.username,
                            },
                            receiver: this.username,
                        })
                    );
                })

            } catch (error) {
                console.log(error);
                alert("检测到当前设备不支持麦克风,请设置权限后在重试")
                this.socket.send(JSON.stringify({
                    name: "reject",
                }))
                this.socket.close()
            }
        },
        //拒绝或挂断
        rejectAudio() {
            if (this.socket) {
                this.socket.send(JSON.stringify({
                    name: "reject",
                }))
                this.socket.close()
                this.socket = null
                this.$message.warning("你已挂断,即将退出")
                // setTimeout(() => {
                //     win.close()
                // }, 1000);
            }
        },
        //初始化PC
        initPC(username) {
            let pc = new PeerConnection(iceServer);
            pc.onicecandidate = (evt) => {
                if (evt.candidate) {
                    this.socket.send(
                        JSON.stringify({
                            name: `ice_candidate`,
                            data: {
                                id: evt.candidate.sdpMid,
                                label: evt.candidate.sdpMLineIndex,
                                sdpMLineIndex: evt.candidate.sdpMLineIndex,
                                candidate: evt.candidate.candidate,
                            },
                            receiver: username,
                        })
                    );
                }
            };
            pc.onaddstream = (evt) => {
                let stream = evt.stream
                this.$nextTick(() => {
                    let item = this.userList[username]
                    let videoDoc = document.getElementById("video_" + item.name)
                    videoDoc.srcObject = stream
                });
            };
            if (this.loading[username]) {
                this.loading[username].close()
            }
            return pc
        },
        //时间更新
        updateTime() {
            let duration = (new Date().getTime() / 1000) - this.startTime
            var hour = parseInt((duration) / 3600) < 10 ? '0' + parseInt((duration) / 3600) : parseInt((duration) / 3600);
            var minute = parseInt((duration % 3600) / 60) < 10 ? '0' + parseInt((duration % 3600) / 60) : parseInt((duration % 3600) / 60);
            var second = parseInt(duration % 60) < 10 ? '0' + parseInt(duration % 60) : parseInt(duration % 60);
            this.broadcastTime = hour + ":" + minute + ":" + second
        },
        //获取头像地址
        getAvatarPath(content) {
            if (content.includes("upload")) {
                return this.ipaddress + content
            }
            return content
        }

    },
    destroyed() {
        if (this.socket) {
            this.socket.send(JSON.stringify({
                name: "reject",
            }))
            this.socket.close()
        }
        if (this.timer) {
            clearInterval(this.timer)
            this.timer = null
        }
    },
}
</script>

<style lang="scss" scoped>
.audio-bg {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background: url(../../assets/sidebar/avatar.jpg) no-repeat;
    background-size: cover;
    background-position: center;
    position: relative;

    .audio-cover {
        background-color: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(5px);
        background-repeat: no-repeat;
        background-size: cover;
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
    }



    .audio-content {
        position: relative;
        z-index: 999;
        width: 100vw;
        height: 100vh;

        .audio-choses {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            letter-spacing: 2px;

            img {
                margin: 20px 20px;
                cursor: pointer;
                position: relative;
            }
        }

        .audio-accept {
            width: 100vw;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            font-size: 20px;

            .audio-headers {
                display: grid;
                grid-template-columns: repeat(4, auto);
                grid-gap: 10px;
                height: 60vh;
                overflow: auto;
                padding: 10px 20px;
                box-sizing: border-box;
                margin-bottom: 30px;

                .audio-avatar {
                    flex: 1;
                }
            }


            img {
                cursor: pointer;
                position: relative;
                margin-top: 10px;
            }
        }
    }
}
</style>