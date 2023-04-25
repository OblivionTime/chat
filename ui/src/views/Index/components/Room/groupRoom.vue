<template>
    <div class="chat-container" @click="showEmoji = false" :style="containerAni">
        <div class="header">
            <div class="header-top">
                <div class="header-left">
                    <img src="@/assets/logo.png" alt="" width="15px">
                </div>
                <div class="header-right">
                    <img src="@/assets/chat/minus.png" alt="" width="20px" class="header-icon" @click="minWindow">
                    <img src="@/assets/chat/max.png" alt="" width="12px" class="header-icon" @click="maxWindow">
                    <img src="@/assets/chat/close.png" alt="" width="20px" class="header-icon" @click="closeWindow">
                </div>
            </div>
            <div class="headder-bottom">
                {{ name }}
            </div>
        </div>

        <div class="not-to-choose" v-if="empty">
            <img src="@/assets/logo.png" alt="" width="160">
            <h3 style="margin-top: 40px;">何当有翅翎,飞去堕尔前！</h3>
            <span style="color: #838384;font-size: 13px;margin-top: 10px;">主动一点,世界会更大!</span>
        </div>
        <div class="content">
            <div class="chat-content" ref="record">
                <div v-for="item, index in List" :key="index" class="chat-item">
                    <span class="message-create-time">{{ item.sendTime }}</span>
                    <div :class="item.sender_id == sender_id ? 'self' : 'other'">
                        <div class="avatar" :class="'avatar-' + item.type">
                            <img :src="item.avatar ? getPath(item.avatar) : require('@/assets/logo.png')" alt="" srcset=""
                                width="45px" height="45px">
                        </div>
                        <div class="chat-username">{{ item.nickname }}</div>
                        <div class="aChat" style="white-space: pre-wrap;" :class="item.type">
                            <div v-if="item.type == 'text'">
                                {{ item.content }}
                            </div>
                            <div v-else-if="item.type == 'image'">
                                <el-image :src="getPath(item.content)" :alt="item.content"
                                    style="width: 200px;object-fit:contain" :preview-src-list="[getPath(item.content)]" />
                            </div>
                            <div v-else-if="item.type == 'video'">
                                <video :src="getPath(item.content)" muted style="width: 300px;object-fit:cover"></video>
                                <div class="play-btn" @click="showVideoDialog = true, currentVideo = getPath(item.content)">
                                    <img src="@/assets/chat/play.png" alt="" width="45">
                                </div>
                            </div>
                            <div v-else-if="item.type == 'file'" class="aChat-file" @click="downloadFile(item.content)">
                                <div class="aChat-file-filename">
                                    {{ _getFileName(item.content) }}
                                </div>
                                <img :src="_getFileIcons(item.content)" alt="" style="width: 40px; object-fit: contain" />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            <div class="send-message" id="message">
                <div class="send-message-header">
                    <img src="@/assets/chat/icon.png" alt="" @click.stop="showEmoji = !showEmoji">
                    <img src="@/assets/chat/photo.png" alt="" @click="choosePhoto">
                    <img src="@/assets/chat/folder.png" alt="" @click="chooseFile">
                    <img src="@/assets/chat/audio.png" alt="" @click="SendAudioInvitation">
                    <img src="@/assets/chat/video.png" alt="" @click="SendVideoInvitation">
                    <input type="file" id="send-message-header-img-file" accept="image/*,video/*" style="display: none"
                        @change="SendImage">
                    <input type="file" id="send-message-header-file" accept="*" style="display: none" @change="SendFile">
                </div>
                <div class="send-message-content">
                    <textarea class="send-message-content-textarea" v-model="content" @keyup="onKeyUp" oninput="value=value.replace(/^\s+/, '')"/>
                </div>
                <div class="send-message-btn">
                    <el-dropdown split-button type="primary" trigger="click" style="height: 30px;" @click="sendMessage">
                        <div style="width: 100%;">发送(S)</div>
                        <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item>
                                <div style="width: 100%;"
                                    @click.stop="sendType = 'enter', localStorage.setItem('sendType', 'enter')"><i
                                        class="el-icon-check" :style="sendType == 'enter' ? '' : 'opacity: 0;'"></i>
                                    按Enter键发送消息</div>
                            </el-dropdown-item>
                            <el-dropdown-item>
                                <div style="width: 100%;"
                                    @click.stop="sendType = 'ctrl_enter', localStorage.setItem('sendType', 'ctrl_enter')"><i
                                        class="el-icon-check"
                                        :style="sendType != 'enter' ? '' : 'opacity: 0;'"></i>按Ctrl+Enter键发送消息</div>
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>
                </div>
                <div class="emoji-list" v-if="showEmoji" @click.stop="">
                    <div class="emoji-list-items">
                        <div v-for="item, index in EmojiList" :key="index" @click.stop="addEmoji(item)">{{ item }}
                        </div>
                    </div>
                </div>
            </div>


        </div>
        <el-dialog title="视频" :visible.sync="showVideoDialog" width="60vw">
            <div style="text-align:center">
                <video :src="currentVideo" muted controls autoplay style="width: 55vw;" v-if="showVideoDialog"></video>

            </div>
        </el-dialog>
    </div>
</template>

<script>
const remote = window.require('electron').remote;
const win = remote.getCurrentWindow();
import { EmojiList } from '@/utils/emoji';
import { toggleTime } from '@/utils/timeFormat';
import { getFileSuffix2, getFileIcons, getFileName } from '@/utils/file'
import { getGroup_Members_list } from '@/api/group';
export default {

    props: {
        options: {
            default: ""
        },
    },
    data() {
        return {
            empty: true,
            containerAni: "opacity:1",
            sender_id: 1,
            receiver_id: 2,
            username: "",
            room: "",
            name: "",
            sendType: 'enter',
            avatar: "",
            content: "",
            chatList: [],
            //计入所有的时间
            messageTimeList: [],
            /**
             * 表情包
             * */
            showEmoji: false,
            EmojiList: EmojiList,
            /**
             * 视频相关参数
             * */
            showVideoDialog: false,
            currentVideo: "",
            callActive: false,
            rtcsocket: "",
            rtcTimer: "",
            userList: []
        };
    },
    created() {
        if (this.options) {
            this.sendType = localStorage.getItem('sendType') ? localStorage.getItem('sendType') : 'enter'
            this.containerAni = 'opacity:0'
            this.empty = false
            this.sender_id = this.$store.getters.userInfo.id
            this.username = this.$store.getters.userInfo.username
            this.avatar = this.$store.getters.userInfo.avatar
            this.room = this.options.room
            this.receiver_id = this.options.group_id
            this.name = this.options.name
            this.loadData()
            this.initSocket()
            this.chatList = []

            setTimeout(() => {
                this.containerAni = 'opacity:1'
                this.empty = false
            }, 100);
        }
    },
    watch: {
        options(newOptions, oldOptions) {
            if (newOptions.room == oldOptions.room) {
                return
            }
            if (this.options) {
                this.sendType = localStorage.getItem('sendType') ? localStorage.getItem('sendType') : 'enter'
                this.containerAni = 'opacity:0'
                this.empty = false
                this.sender_id = this.$store.getters.userInfo.id
                this.username = this.$store.getters.userInfo.username
                this.avatar = this.$store.getters.userInfo.avatar
                this.room = this.options.room
                this.receiver_id = this.options.group_id
                this.name = this.options.name
                this.loadData()
                this.initSocket()
                this.chatList = []
                setTimeout(() => {
                    this.containerAni = 'opacity:1'
                    this.empty = false
                }, 100);
            }
        },
        deep: true
    },
    computed: {
        List() {
            return this.chatList.map(item => {
                let sendTime = toggleTime(item.created_at)
                if (this.messageTimeList.indexOf(sendTime) == -1) {
                    item.sendTime = sendTime
                    this.messageTimeList.push(sendTime)
                }
                // 处理数据
                return item;
            });
        }
    },
    updated() {
        this.$nextTick(() => {
            this.$refs.record.scrollTop = this.$refs.record.scrollHeight;
        });
    },
    methods: {
        minWindow() {
            win.minimize();
        },
        maxWindow() {
            if (win.isMaximized()) { // 为true表示窗口已最大化
                win.restore();// 将窗口恢复为之前的状态.
            } else {
                win.maximize();
            }
        },
        closeWindow() {
            win.close()
        },
        loadData() {
            getGroup_Members_list({ group_id: this.receiver_id })
                .then((res) => {
                    if (res.code == 200) {
                        this.userList = res.data
                    }
                })
        },
        /**
         * websocket建立连接
         * */
        //初始化websocket
        initSocket() {
            if (this.socket) {
                this.socket.close()
                this.socket = null
            }
            this.socket = new WebSocket(`${this.wssaddress}/api/chat/v1/message/chat?room=${this.room}&id=${this.receiver_id}&type=group`)
            this.socket.onopen = () => {
                console.log('连接成功');
            };
            this.socket.onmessage = (message) => {
                //通知列表更新
                this.$emit('updateList');
                let data = JSON.parse(message.data)
                if (data instanceof Array) {
                    this.chatList.push(...data)
                } else {
                    this.chatList.push(data)
                }
                setTimeout(() => {
                    this.$nextTick(() => {
                        this.$refs.record.scrollTop = this.$refs.record.scrollHeight;
                    })
                }, 50);

            }
            this.socket.onclose = () => {
                console.log("连接关闭");
            }
        },
        //发送消息
        sendMessage() {
            if (this.content == '') {
                return
            }
            let sendMessage = this.content.replace(/^\s+|\s+$/g, "")
            this.socket.send(JSON.stringify({
                "sender_id": this.sender_id,
                "receiver_id": this.receiver_id,
                "content": sendMessage,
                "avatar": this.avatar,
                "room": this.room,
                "type": "text"
            }))
            this.content = ""
        },
        //添加表情包
        addEmoji(item) {
            this.content += item
        },
        //监听按钮
        onKeyUp(e) {
            if (e.ctrlKey && e.keyCode == 13 && this.sendType != "enter") {
                this.sendMessage()
            } else if (!e.ctrlKey && !e.shiftKey && !e.altKey && e.keyCode == 13 && this.sendType == "enter") {
                this.sendMessage()
            }
        },
        /**
         * 选择图片
         * */
        //选择图片
        choosePhoto() {
            var choose = document.getElementById('send-message-header-img-file')
            choose.click()
        },
        SendImage(e) {
            if (e.target.files.length > 0) {
                var file = e.target.files[0];
                const reader = new FileReader();
                reader.onload = (event) => {
                    const fileContent = event.target.result;
                    const content = new Uint8Array(fileContent);
                    let filename = file.name
                    this.socket.send(JSON.stringify({
                        "filename": filename,
                        "sender_id": this.sender_id,
                        "receiver_id": this.receiver_id,
                        "content": Array.from(content),
                        "avatar": this.avatar,
                        "room": this.room,
                        "type": getFileSuffix2(filename)
                    }))
                };
                reader.readAsArrayBuffer(file);
            }
        },
        /**
         * 文件相关
         * */
        //选择文件
        chooseFile() {
            var choose = document.getElementById('send-message-header-file')
            choose.click()
        },
        //发送文件
        async SendFile(e) {
            if (e.target.files.length > 0) {
                var file = e.target.files[0];
                if (getFileSuffix2(file.name) != 'file') {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const fileContent = event.target.result;
                        const content = new Uint8Array(fileContent);
                        let filename = file.name
                        this.socket.send(JSON.stringify({
                            "filename": filename,
                            "sender_id": this.sender_id,
                            "receiver_id": this.receiver_id,
                            "content": Array.from(content),
                            "avatar": this.avatar,
                            "room": this.room,
                            "type": getFileSuffix2(filename)
                        }))
                    };
                    reader.readAsArrayBuffer(file);
                    return
                }
                const loading = this.$loading({
                    target: document.getElementById("message"),
                    lock: true,
                    text: '文件上传中...',
                    spinner: 'el-icon-loading',
                    background: 'rgba(0, 0, 0, 0.7)'
                });

                // 发送文件信息
                const fileInfo = {
                    fileName: file.name,
                    fileSize: file.size
                };
                //发送文件下载指令
                this.socket.send(JSON.stringify({
                    "filename": file.name,
                    "sender_id": this.sender_id,
                    "receiver_id": this.receiver_id,
                    "content": "",
                    "avatar": this.avatar,
                    "room": this.room,
                    "type": getFileSuffix2(file.name),
                    "fileType": "start",
                    "fileInfo": JSON.stringify(fileInfo)
                }))
                //防止文件未初始化
                setTimeout(async () => {
                    //开启读取文件并上传
                    const reader = file.stream().getReader();
                    let offset = 0;
                    let tt = 0
                    let chunk
                    while (true) {
                        chunk = await reader.read()
                        if (chunk.done) {
                            loading.close()
                            return
                        }
                        this.socket.send(JSON.stringify({
                            "filename": file.name,
                            "sender_id": this.sender_id,
                            "receiver_id": this.receiver_id,
                            "content": Array.from(new Uint8Array(chunk.value)),
                            "avatar": this.avatar,
                            "room": this.room,
                            "type": getFileSuffix2(file.name),
                            "fileType": "upload",
                        }))
                    }
                }, 50);
            }
        },
        //下载文件
        downloadFile(url) {
            url = this.ipaddress + url
            var aTag = document.createElement("a");
            aTag.download = getFileName(url);
            aTag.href = url
            aTag.click();
        },
        //获取文件图标
        _getFileIcons(path) {
            return getFileIcons(path)
        },
        //获取文件名
        _getFileName(path) {
            return getFileName(path)
        },
        //获取文件路径
        getPath(content) {
            return this.ipaddress + content
        },
        /**
         * 音视频相关
         */
        //发送语音邀请
        SendAudioInvitation() {
            this.$emit("sendGroupInvitation", { room: this.room, sender: this.username, group_id: this.receiver_id, userList: this.userList, beInviter: 0, method: 'group_audio' })
        },
        //发送视频邀请
        SendVideoInvitation() {
            this.$emit("sendGroupInvitation", { room: this.room, sender: this.username, group_id: this.receiver_id, userList: this.userList, beInviter: 0, method: 'group_video' })
        },
    },
    destroyed() {
        if (this.rtcsocket) {
            this.rtcsocket.close()
            this.rtcsocket = null
            this.socket.close()
            this.socket = null
        }
    },

}
</script>

<style lang="scss" scoped>
.chat-container {
    width: calc(100vw - 260px);
    height: 100vh;
    overflow: hidden;
    background-color: #eee;
    transition: opacity 0.5s linear;
    opacity: 0;

    .header {
        width: 100%;
        height: 60px;
        box-sizing: border-box;
        padding: 0px 10px;
        box-shadow: 0 0 1px rgba(0, 0, 0, 0.5);


        .header-top {
            display: flex;
            justify-content: space-between;
            -webkit-app-region: drag;

            .header-left {
                -webkit-app-region: no-drag;
                display: flex;
                align-items: center;
            }

            .header-right {
                -webkit-app-region: no-drag;
                display: flex;
                align-items: center;

                .header-icon {
                    cursor: pointer;
                    margin: 0 5px;
                }
            }
        }

        .headder-bottom {
            font-size: 20px;
            padding: 10px 0;
        }


    }


    .not-to-choose {
        width: calc(100vw - 260px);
        height: calc(100vh - 60px);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        background-color: #f5f6f7;
    }

    .content {
        width: calc(100vw - 260px);
        height: calc(100vh - 60px);


        .chat-content {
            height: calc(100% - 180px);
            box-shadow: 0 0 1px rgba(0, 0, 0, 0.5);
            overflow: auto;
            position: relative;
            text-align: center;

            .chat-item {
                margin: 10px 0;
            }

            .message-create-time {
                font-size: 10px;
                padding: 2px 0;
                color: #606266;
                display: inline-block;
                padding: 5px;
                margin: 0 auto;
            }

            .other {
                display: flex;
                align-items: flex-start;
                // margin: 25px 0 0px 5px;
                position: relative;

                .avatar img {
                    border-radius: 10px;
                    margin: 0 10px;
                }

                .avatar-text {
                    align-self: center;
                }

                .chat-username {
                    position: absolute;
                    left: 70px;
                    font-size: 12px;
                    top: -9px;
                    color: #606266;
                }

                .aChat {
                    word-break: break-all;
                    max-width: 40%;
                    position: relative;
                    border-radius: 4px;
                    top: 10px;
                }

                .text {
                    background-color: #fff;
                    border: solid 1px #fff;
                    box-shadow: 0px 2px 7px 0px rgba(123, 123, 123, 0.17);
                    padding: 10px;
                    text-indent: -6px;
                    top: 10px;

                    &::before,
                    ::after {
                        content: "";
                        position: absolute;
                        top: calc(50% - 6px);
                        border-top: 6px solid transparent;
                        border-bottom: 6px solid transparent;
                    }

                    &::before {
                        left: -10px;
                        border-right: 10px solid #fff;
                    }

                    &::after {
                        left: -8px;
                        border-right: 10px solid transparent;
                    }
                }

                .video {
                    position: relative;
                    top: 10px;

                    div {
                        position: relative;

                        .play-btn {
                            cursor: pointer;
                            width: 300px;
                            height: 100%;
                            top: 0;
                            left: 0;
                            z-index: 10;
                            position: absolute;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        }
                    }

                }

                .avatar-file {
                    align-self: center;
                }

                .file {
                    cursor: pointer;
                    padding: 15px;
                    text-indent: -6px;
                    background-color: white;
                    top: 10px;
                    border: solid 1px white;
                    box-shadow: 0px 2px 7px 0px rgba(123, 123, 123, 0.17);

                    .aChat-file {
                        display: flex;
                        align-items: center;

                        .aChat-file-filename {
                            margin-right: 10px;
                            width: 80%;
                        }
                    }

                    &::before,
                    ::after {
                        content: "";
                        position: absolute;
                        top: calc(50% - 6px);
                        border-top: 6px solid transparent;
                        border-bottom: 6px solid transparent;
                    }

                    &::before {
                        left: -10px;
                        border-right: 10px solid #fff;
                    }

                    &::after {
                        left: -8px;
                        border-right: 10px solid transparent;
                    }
                }

            }

            .self {
                display: flex;
                align-items: flex-start;
                // margin: 25px 0 0px 5px;
                flex-direction: row-reverse;
                position: relative;

                .avatar img {
                    border-radius: 10px;
                    margin: 0 10px;
                }

                .avatar-text {
                    align-self: center;
                }

                .chat-username {
                    position: absolute;
                    right: 70px;
                    font-size: 12px;
                    top: -9px;
                    color: #606266;
                }

                .aChat {
                    word-break: break-all;
                    max-width: 40%;
                    position: relative;
                    border-radius: 4px;
                    top: 10px;
                }

                .text {
                    padding: 10px;
                    text-indent: -6px;
                    background-color: #95ec69;
                    border: solid 1px #95ec69;
                    box-shadow: 0px 2px 7px 0px rgba(123, 123, 123, 0.17);
                    top: 10px;

                    &::before,
                    ::after {
                        content: "";
                        position: absolute;
                        top: calc(50% - 6px);
                        border-top: 6px solid transparent;
                        border-bottom: 6px solid transparent;
                    }

                    &::before {
                        right: -10px;
                        border-left: 10px solid #95ec69;
                    }

                    &::after {
                        left: -8px;
                        border-left: 10px solid transparent;
                    }
                }

                .video {
                    position: relative;
                    top: 10px;

                    div {
                        position: relative;

                        .play-btn {
                            cursor: pointer;
                            width: 300px;
                            height: 100%;
                            top: 0;
                            left: 0;
                            z-index: 10;
                            position: absolute;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        }
                    }

                }

                .avatar-file {
                    align-self: center;
                }

                .file {
                    cursor: pointer;
                    padding: 15px;
                    text-indent: -6px;
                    background-color: white;

                    border: solid 1px white;
                    box-shadow: 0px 2px 7px 0px rgba(123, 123, 123, 0.17);
                    top: 10px;

                    .aChat-file {
                        display: flex;
                        align-items: center;

                        .aChat-file-filename {
                            margin-right: 10px;
                            width: 80%;
                        }
                    }

                    &::before,
                    ::after {
                        content: "";
                        position: absolute;
                        top: calc(50% - 6px);
                        border-top: 6px solid transparent;
                        border-bottom: 6px solid transparent;
                    }

                    &::before {
                        right: -10px;
                        border-left: 10px solid white;
                    }

                    &::after {
                        left: -8px;
                        border-left: 10px solid transparent;
                    }
                }
            }
        }

        .send-message {
            height: 180px;
            position: relative;

            .send-message-header {
                display: flex;
                align-items: center;
                height: 30px;

                img {
                    cursor: pointer;
                    width: 20px;
                    height: 20px;
                    margin: 10px 15px 0;
                }
            }

            .send-message-content {
                height: calc(180px - 60px);
                overflow: auto;

                .send-message-content-textarea {
                    padding: 10px 20px;
                    width: 90%;
                    height: 90px;
                    border: none;
                    background: transparent;
                    display: block;
                    resize: vertical;
                    color: #606266;
                    outline: none;
                    resize: none;
                }
            }

            .send-message-btn {
                height: 20px;
                text-align: right;
                margin-right: 30px;
                opacity: 1;
            }

            .emoji-list {
                position: absolute;
                width: 380px;
                height: 190px;
                z-index: 999;
                top: -190px;
                left: 5px;

                .emoji-list-items {
                    width: 100%;
                    height: 100%;
                    overflow: auto;
                    border-radius: 5px;
                    background-color: white;
                    box-shadow: 0 0 2px rgba(123, 123, 123, 0.17);
                    display: grid;
                    font-size: 18px;
                    grid-template-columns: repeat(10, 1fr);
                    grid-gap: 5px;

                    div {
                        cursor: pointer;
                        text-align: center;
                        padding: 5px 0;

                        &:hover {
                            background-color: #eee;
                        }
                    }
                }

            }
        }



    }
}

::v-deep .el-button {
    padding: 5px 20px;
}

::v-deep .el-dropdown__caret-button {
    padding: 5px 5px;
}
</style>
