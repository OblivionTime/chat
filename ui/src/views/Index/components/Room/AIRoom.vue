<template>
    <div class="chat-container" id="AI">
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
        <div class="content">
            <div class="chat-content" ref="record">
                <div :class="item.sender_id == sender_id ? 'self' : 'other'" v-for="item, index in chatList" :key="index">
                    <div class="avatar" :class="'avatar-' + item.type">
                        <img :src="getPath(item)" width="45px" height="45px">
                    </div>
                    <div class="aChat" style="white-space: pre-wrap;" :class="item.type">
                        <div v-if="item.type == 'text'">
                            {{ item.content }}
                        </div>
                        <div class="root" role="list" aria-label="了解详细信息:" v-if="item.LinkList.length != 0">
                            <div class="learn-more">了解详细信息:</div>
                            <div class="attribution-container">
                                <div class="attribution-items">
                                    <a class="attribution-item" target="_blank" role="listitem" h="ID=SERP,5025.1"
                                        :href="link.seeMoreUrl" :title="link.providerDisplayName" tabindex="0"
                                        v-for="link in item.LinkList" :key="link.seeMoreUrl"
                                        @click.prevent="toTargetLink(link.seeMoreUrl)">{{ getURLHost(link.seeMoreUrl) }}</a>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            <div class="send-message">

                <div class="send-message-content">
                    <textarea class="send-message-content-textarea" v-model="content" @keyup="onKeyUp" oninput="value=value.replace(/^\s+/, '')" />
                </div>
                <div class="send-message-btn">
                    <el-dropdown split-button type="primary" trigger="click" :class="disabeldSend ? 'disabeld-send' : ''"
                        style='height: 30px;' @click="sendMessage">
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

            </div>


        </div>
    </div>
</template>

<script>
const remote = window.require('electron').remote;
const win = remote.getCurrentWindow();
const DELIMITER = '\x1e';
const { shell } = window.require('electron');
const { randomBytes } = window.require('crypto')
import { getConversationInfo } from '@/api/bing';
export default {
    props: {
        options: {
            default: ""
        },
    },
    data() {
        return {
            room: "29366534-a526-4880-ae86-1eaabf5695ce",
            username: "bing",
            name: "必应",
            //发送方式
            sendType: 'enter',
            //个人头像
            avatar: "",
            //发送框
            content: "",
            //聊天列表
            chatList: [],
            //当前下标
            current: 0,
            //发送方
            sender_id: 0,
            //接受方
            receiver_id: 0,
            /**
             * bing websocket
             */
            //重新建连
            resetFlag: false,
            bingSocket: "",
            conversationSignature: "",
            conversationId: "",
            client_id: "",
            invocationId: 1,
            lockScreen: "",
            /**
             * 后端websocket
             */
            socket: "",
            disabeldSend: true,
        };
    },
    mounted() {
        this.lockScreen = this.$loading({
            target: document.getElementById("AI"),
            lock: true,
            text: '正在初始化AI',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)'
        });
        this.sendType = localStorage.getItem('sendType') ? localStorage.getItem('sendType') : 'enter'
        this.sender_id = this.$store.getters.userInfo.id
        this.username = this.$store.getters.userInfo.username
        this.avatar = this.$store.getters.userInfo.avatar
        this.receiver_id = 0
        this.room = this.options.room
        //JSON.parse是为了处理特殊符号
        this.conversationSignature = JSON.parse(`"${this.options.conversation_signature}"`)
        this.conversationId = JSON.parse(`"${this.options.conversation_id}"`)
        this.client_id = this.options.client_id
        this.invocationId = this.options.invocation_id
        //建立后端的websocket连接
        this.initSocket()
        if (this.options.total == this.options.us_count) {
            this.$message.warning("你的ai对话已经全部用完,无法继续使用")
            this.disabeldSend = true
            this.lockScreen.close()
        } else {
            //建立与bing的websocket连接
            this.initAISocket()
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
        /**
         * websocket建立连接
         * */
        //初始化websocket
        initAISocket() {
            if (this.bingSocket) {
                this.bingSocket.close()
                this.bingSocket = null
            }
            this.bingSocket = new WebSocket(`wss://sydney.bing.com/sydney/ChatHub`)
            this.bingSocket.onopen = () => {
                console.log('连接成功');
                this.bingSocket.send('{"protocol":"json","version":1}')
                if (this.options.total < this.options.us_count) {
                    this.disabeldSend = false
                }
            };
            this.bingSocket.onmessage = (message) => {
                const data = message.data.toString('utf-8');
                const objects = data.split(DELIMITER);
                let msg
                for (const obj of objects) {
                    if (obj === null || obj === '') {
                        continue;
                    }
                    const response = JSON.parse(obj);
                    if (response.type === 1) {
                        if (this.invocationId == 0) {
                            return
                        }
                        if (response.arguments[0].messages) {
                            if (!this.chatList[this.current]) {
                                //初始化
                                this.chatList[this.current] = {
                                    avatar: require("@/assets/chat/Bing.svg"),
                                    sender_id: 0,
                                    type: 'text',
                                    content: response.arguments[0].messages[0].text,
                                    LinkList: []
                                }
                            } else {
                                if (!response.arguments[0].messages[0].text) {
                                    return
                                }
                                let item = this.chatList[this.current]
                                item.content = response.arguments[0].messages[0].text.replace(/\[\^\d+\^\]/g, "")
                                this.$set(this.chatList, this.current, item);
                            }
                        } else if (response.arguments[0].throttling.numUserMessagesInConversation) {
                            msg = {
                                avatar: "",
                                sender_id: 0,
                                receiver_id: this.sender_id,
                                content: "",
                                LinkList: [],
                                type: "text",
                                room: this.room,
                                conversation_id: this.conversationId,
                                client_id: this.client_id,
                                conversation_signature: this.conversationSignature,
                                numUserMessagesInConversation: response.arguments[0].throttling.numUserMessagesInConversation
                            }
                            this.socket.send(JSON.stringify(msg))
                        }

                    } else if (response.type === 2) {
                        try {
                            if (response.item.messages.length >= 2) {
                                if (this.invocationId == 0) {
                                    this.invocationId = 1
                                    this.disabeldSend = false
                                    this.lockScreen.close()
                                } else {
                                    let item = this.chatList[this.current]
                                    item.LinkList = response.item.messages[1].sourceAttributions
                                    this.$set(this.chatList, this.current, item);
                                    msg = {
                                        avatar: "",
                                        sender_id: 0,
                                        receiver_id: this.sender_id,
                                        content: item.content,
                                        LinkList: item.LinkList,
                                        room: this.room,
                                        type: "text",
                                        conversation_id: this.conversationId,
                                        client_id: this.client_id,
                                        conversation_signature: this.conversationSignature,
                                        invocation_id: response.item.throttling.numUserMessagesInConversation
                                    }
                                    this.socket.send(JSON.stringify(msg))
                                    this.invocationId = msg.invocation_id
                                    this.disabeldSend = false
                                    if (this.resetFlag) {
                                        this.$message.warning("当前会话已结束,即将重新创建新会话!!!")
                                        this.lockScreen = this.$loading({
                                            target: document.getElementById("AI"),
                                            lock: true,
                                            text: '正在建立新会话',
                                            spinner: 'el-icon-loading',
                                            background: 'rgba(0, 0, 0, 0.7)'
                                        });
                                        this.invocationId = 0
                                        this.initAISocket()
                                    }
                                    this.current++
                                }
                            }

                        } catch (error) {
                            this.$message.error("出现错误,请重新选择聊天框")
                        }
                    } else if (Object.keys(response).length === 0) {
                        this.sendToBing({ "type": 6 })
                        if (this.invocationId == 0) {
                            this.initMessage()
                        } else {
                            this.lockScreen.close()
                        }
                    } else if (response.type === 6) {
                        this.sendToBing({ "type": 6 })
                    }
                }
            }
            this.bingSocket.onclose = () => {
                console.log("连接关闭");
            }
        },
        //发送消息给bing
        sendToBing(msg) {
            this.bingSocket.send(JSON.stringify(msg) + DELIMITER)
        },
        //初始化消息
        initMessage() {
            let sendContent = {
                "arguments": [
                    {
                        "source": "cib",
                        "optionsSets": [
                            "nlu_direct_response_filter",
                            "deepleo",
                            "disable_emoji_spoken_text",
                            "responsible_ai_policy_235",
                            "enablemm",
                            "precise",
                            "dtappid",
                            "cricinfo",
                            "cricinfov2",
                            "dv3sugg"
                        ],
                        "sliceIds": [
                            "222dtappid",
                            "225cricinfo",
                            "224locals0"
                        ],
                        "traceId": this.getRanHex(32),
                        "isStartOfSession": this.invocationId == 0,
                        "message": {
                            "author": "user",
                            "inputMethod": "Keyboard",
                            "text": "",
                            "messageType": "Chat"
                        },
                        "conversationSignature": this.conversationSignature,
                        "participant": {
                            "id": this.client_id
                        },
                        "conversationId": this.conversationId
                    }
                ],
                "invocationId": String(this.invocationId),
                "target": "chat",
                "type": 4
            }
            this.sendToBing(sendContent)
        },
        //发送消息
        sendMessage() {
            if (this.disabeldSend) {
                return
            }
            if (this.content == '') {
                return
            }
            let sendMessage = this.content.replace(/^\s+|\s+$/g, "")

            let sendContent = {
                "arguments": [
                    {
                        "source": "cib",
                        "optionsSets": [
                            "nlu_direct_response_filter",
                            "deepleo",
                            "disable_emoji_spoken_text",
                            "responsible_ai_policy_235",
                            "enablemm",
                            "precise",
                            "dtappid",
                            "cricinfo",
                            "cricinfov2",
                            "dv3sugg"
                        ],
                        "sliceIds": [
                            "222dtappid",
                            "225cricinfo",
                            "224locals0"
                        ],
                        "traceId": this.getRanHex(32),
                        "isStartOfSession": this.invocationId == 0,
                        "message": {
                            "author": "user",
                            "inputMethod": "Keyboard",
                            "text": sendMessage,
                            "messageType": "Chat"
                        },
                        "conversationSignature": this.conversationSignature,
                        "participant": {
                            "id": this.client_id
                        },
                        "conversationId": this.conversationId
                    }
                ],
                "invocationId": String(this.invocationId),
                "target": "chat",
                "type": 4
            }
            let msg = {
                avatar: this.avatar,
                sender_id: this.sender_id,
                receiver_id: 0,
                content: sendMessage,
                LinkList: [],
                type: "text",
                room: this.room,
                conversation_id: this.conversationId,
                conversation_signature: this.conversationSignature,
                client_id: this.client_id,
                invocation_id: this.invocationId
            }
            this.chatList.push(msg)
            this.current++;
            this.sendToBing(sendContent)
            this.disabeldSend = true
            this.socket.send(JSON.stringify(msg))
            this.content = ""
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
         * 后端websocket相关方法
         */
        initSocket() {
            if (this.socket) {
                this.socket.close()
                this.socket = null
            }
            this.socket = new WebSocket(`${this.wssaddress}/api/chat/v1/bing/contect?room=${this.room}`)
            this.socket.onopen = () => {
                console.log('连接成功');
            };
            this.socket.onmessage = (message) => {
                const data = JSON.parse(message.data)
                if (data.name) {
                    //接收到重置消息
                    getConversationInfo()
                        .then((res) => {
                            if (res.code == 200) {
                                let options = res.data
                                if (!options.conversation_id) {
                                    this.$message.warning("你的ai对话已经全部用完,无法继续使用")
                                    this.disabeldSend = true
                                    return
                                }
                                this.conversationSignature = JSON.parse(`"${options.conversation_signature}"`)
                                this.conversationId = JSON.parse(`"${options.conversation_id}"`)
                                this.client_id = options.client_id
                                this.invocationId = 1
                                this.resetFlag = true
                            }
                        })
                } else {
                    for (const item of data) {
                        item.LinkList = JSON.parse(item.LinkList)
                        this.chatList.push(item)
                        this.current++
                    }

                }
            }
        },
        /**
         * 工具相关方法
         */
        //获取随机hex
        getRanHex(length) {
            return randomBytes(Math.ceil(length / 2))
                .toString('hex')
                .slice(0, length);
        },
        //获取文件路径
        getPath(item) {
            if (item.sender_id != 0) {
                let content = item.avatar
                if (!content) {
                    return require("@/assets/logo.png")
                }
                return this.ipaddress + content
            }
            return require("@/assets/chat/Bing.svg")

        },
        //获取URL的hostname
        getURLHost(path) {
            const url = new URL(path);
            return url.hostname
        },
        //用默认浏览器打开网页
        toTargetLink(path) {
            shell.openExternal(path);
        }
    },
    destroyed() {
        if (this.socket) {
            this.socket.close()
            this.socket = null
        }
        if (this.bingSocket) {
            this.bingSocket.close()
            this.bingSocket = null

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

            .other {
                display: flex;
                align-items: flex-start;
                margin: 20px 0 20px 5px;

                .avatar img {
                    border-radius: 10px;
                    margin: 0 10px;
                }

                .avatar-text {
                    align-self: center;
                }

                .aChat {
                    word-break: break-all;
                    max-width: 80%;
                    position: relative;
                    border-radius: 4px;

                    .root {
                        display: flex;
                        flex-direction: row;
                        row-gap: 6px;
                        padding-top: 10px;
                        margin-top: 5px;
                        border-top: 1px solid #eee;

                        .learn-more {
                            position: relative;
                            min-width: fit-content;
                            height: 24px;
                            left: 1px;
                            margin-right: 6px;
                            font-size: 14px;
                            line-height: 24px;
                            font-weight: 600;
                        }

                        .attribution-container {
                            display: flex;
                            flex-direction: row;
                            row-gap: 6px;

                            .attribution-items {
                                display: flex;
                                flex-flow: row wrap;
                                row-gap: 6px;
                                padding: 5px;

                                .attribution-item {
                                    text-decoration: none;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    min-width: max-content;
                                    height: 24px;
                                    border-radius: 4px;
                                    box-sizing: border-box;
                                    padding: 0px 8px;
                                    margin-inline-end: 6px;
                                    font-weight: 500;
                                    line-height: 24px;
                                    font-size: 14px;
                                    color: #123BB6;
                                    background: #D1DBFA;
                                }
                            }
                        }

                    }
                }

                .text {
                    background-color: #fff;
                    border: solid 1px #fff;
                    box-shadow: 0px 2px 7px 0px rgba(123, 123, 123, 0.17);
                    padding: 10px;
                    text-indent: -6px;

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
                margin: 20px 5px 20px 0px;
                flex-direction: row-reverse;

                .avatar img {
                    border-radius: 10px;
                    margin: 0 10px;
                }

                .avatar-text {
                    align-self: center;
                }

                .aChat {
                    word-break: break-all;
                    max-width: 40%;
                    position: relative;
                    border-radius: 4px;

                }

                .text {
                    padding: 10px;
                    text-indent: -6px;
                    background-color: #95ec69;
                    border: solid 1px #95ec69;
                    box-shadow: 0px 2px 7px 0px rgba(123, 123, 123, 0.17);

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

::v-deep .el-dropdown,
.disabeld-send {
    .el-button-group {
        button:first-child {
            cursor: not-allowed;
        }
    }
}
</style>
