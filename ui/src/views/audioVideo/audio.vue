<template>
    <div class="audio-bg">
        <div class="audio-cover"></div>
        <div class="audio-content">
            <div class="audio-avatar">
                <img src="../../assets/sidebar/avatar.jpg" alt=""
                    style="width: 100px;height: 100px;object-fit: cover;object-position: center;">
            </div>
            <div class="audio-choses" v-if="beInviter && !flag">
                <div style="color: white;">{{ username }}对你发起语音通话</div>
                <div>
                    <img src="../../assets/chat/accept.png" alt="" width="50" @click="acceptAudio">
                    <img src="../../assets/chat/reject.png" alt="" width="50" @click="rejectAudio">
                </div>
            </div>
            <div class="audio-Inviter" v-if="!beInviter && !flag">
                <div style="color: white;">你对{{ username }}发起语音通话</div>
                <img src="../../assets/chat/reject.png" alt="" width="50" @click="rejectAudio">
            </div>
            <div class="audio-accept" v-if="flag">
                <div style="color: white;">{{ broadcastTime }}</div>
                <div>
                    <video src="" ref="video" autoplay style="opacity: 0;width: 0;height: 0;"
                        @timeupdate="updateTime"></video>
                </div>
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

export default {
    data() {
        return {
            flag: false,
            beInviter: false,
            room: "",
            socket: "",
            username: "",
            localStream: "",
            pc: "",
            broadcastTime: 0,
            timer: "",
            receiver: ""
        };
    },
    created() {
        this.beInviter = this.$route.query.beInviter == 1
        if (this.beInviter) {
            this.username = this.$route.query.sender
        } else {
            this.username = this.$route.query.receiver
        }
        this.room = this.$route.query.room

    },
    mounted() {
        //检测窗口关闭,自动挂断电话
        win.on('close', (event) => {
            if (this.socket) {
                this.socket.send(JSON.stringify({
                    name: "reject",
                }))
                this.socket.close()
            }
        });
        this.initSocket()
        this.timer = setTimeout(() => {
            if (this.socket) {
                this.socket.send(JSON.stringify({
                    name: "reject",
                }))
                this.socket.close()
            }
        }, 60 * 1000);
    },
    methods: {
        //初始化websocket
        initSocket() {
            this.socket = new WebSocket(`${this.wssaddress}/api/chat/v1/rtc/single?room=${this.room}&username=${this.$store.getters.userInfo.username}`)
            this.socket.onopen = async () => {
                //如果是邀请人则发送创建房间指令
                if (!this.beInviter) {
                    /**
                     * 1.邀请人先创建麦克风并初始化PC源
                     * 2.发送创建房间的指令到当前房间,后端接受到指令后,给当前房间的所有用户发送响应的指令
                     */
                    try {
                        //最新的标准API
                        let stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true })
                        this.localStream = stream
                        //初始化PC源
                        this.initPC()
                        //添加音频流
                        this.pc.addStream(this.localStream)
                        //发起邀请
                        this.socket.send(JSON.stringify({ "name": "createRoom", mode: "audio_invitation" }))
                    } catch (error) {
                        alert("检测到当前设备不支持麦克风,请设置权限后在重试")
                        this.socket.send(JSON.stringify({
                            name: "reject",
                        }))
                        this.socket.close()
                    }
                }
            };
            this.socket.onmessage = (message) => {
                let data = JSON.parse(message.data)
               
                switch (data.name) {
                    /**
                     * 1.邀请人接收到有新人进入房间,则发送视频流和offer指令给新人
                     */
                    case "new_peer":
                        if (this.timer) {
                            clearTimeout(this.timer)
                            this.timer = null
                        }
                        this.flag = true
                        this.pc.createOffer((session_desc) => {
                            this.pc.setLocalDescription(session_desc);
                            this.socket.send(
                                JSON.stringify({
                                    name: "offer",
                                    data: {
                                        sdp: session_desc,
                                    },
                                    receiver: this.username,
                                })
                            );
                        }, (err) => {
                            console.log(err);
                        });

                        break
                    /**
                     * 1.新人接受到对方同意的指令后,将对方的音视频流通过setRemoteDescription函数进行存储
                     * 2.存储完后新人创建answer来获取自己的音视频流,通过setLocalDescription函数存储自己的音视频流,并发送answer指令(携带自己的音视频)告诉对方要存储邀请人的音视频
                     */
                    case "offer":

                        try {
                            this.flag = true
                            //当收到对方接收请求后,设置音频源,并发送answer给对方
                            this.pc.setRemoteDescription(new nativeRTCSessionDescription(data.data.sdp));
                            this.pc.createAnswer((session_desc) => {
                                this.pc.setLocalDescription(session_desc);
                                this.socket.send(
                                    JSON.stringify({
                                        name: "answer",
                                        data: {
                                            sdp: session_desc,
                                        },
                                        receiver: this.username,
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
                        this.pc.setRemoteDescription(new nativeRTCSessionDescription(data.data.sdp));
                        break
                    case "ice_candidate":
                        var candidate = new nativeRTCIceCandidate(data.data);
                        this.pc.addIceCandidate(candidate);
                        break
                    case 'reject':
                        this.$message.warning("对方已挂断,即将退出")
                        this.socket.send(JSON.stringify({ name: "reject" }))
                        this.socket.close()
                        this.socket = null
                        setTimeout(() => {
                            win.close()
                        }, 1000);
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
             * 5.并发送new_peer指令(携带自己的音视频)告诉房间的人,我要进入房间
             */
            try {
                if (this.timer) {
                    clearTimeout(this.timer)
                    this.timer = null
                }
                //最新的标准API
                let stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true })
                this.localStream = stream
                this.flag = true
                this.$nextTick(() => {
                    this.initPC()
                    this.pc.addStream(this.localStream)
                    this.socket.send(
                        JSON.stringify({
                            name: "new_peer",
                            data: {
                                username: this.username,
                            },
                            receiver: this.username,
                        })
                    );
                });
            } catch (error) {
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
                this.flag = false
                this.$message.warning("你已挂断,即将退出")
                setTimeout(() => {
                    win.close()
                }, 1000);
            }
        },
        //初始化PC
        initPC() {
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
                            receiver: this.username,
                        })
                    );
                }
            };
            pc.onaddstream = (evt) => {
                let stream = evt.stream
                this.$nextTick(() => {
                    this.$refs.video.srcObject = stream;
                });
            };

            this.pc = pc
        },
        //时间更新
        updateTime() {
            if (!this.$refs.video) {
                return
            }
            let duration = this.$refs.video.currentTime;
            var hour = parseInt((duration) / 3600) < 10 ? '0' + parseInt((duration) / 3600) : parseInt((duration) / 3600);
            var minute = parseInt((duration % 3600) / 60) < 10 ? '0' + parseInt((duration % 3600) / 60) : parseInt((duration % 3600) / 60);
            var second = parseInt(duration % 60) < 10 ? '0' + parseInt(duration % 60) : parseInt(duration % 60);
            this.broadcastTime = hour + ":" + minute + ":" + second
        },

    },
    destroyed() {
        if (this.socket) {
            this.socket.send(JSON.stringify({
                name: "reject",
            }))
            this.socket.close()
        }
        if (this.timer) {
            clearTimeout(this.timer)
            this.timer = null
        }
    },
}
</script>

<style lang="scss" scoped>
.audio-bg {
    width: 100vw;
    height: 100vh;

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
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;

        .audio-choses {
            margin-top: 30px;
            width: 200px;
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

        .audio-Inviter {
            margin-top: 30px;
            min-width: 200px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            letter-spacing: 2px;

            img {
                margin-top: 20px;
                cursor: pointer;
                position: relative;
            }
        }

        .audio-accept {
            margin-top: 30px;
            width: 200px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            font-size: 20px;

            img {
                cursor: pointer;
                position: relative;
            }
        }
    }
}
</style>