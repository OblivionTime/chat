<template>
    <div class="container">
        <SideBar @changeStatus="changeStatus" ref="SideBar" @getAIoptions="getAIoptions"></SideBar>
        <List :current="current" ref="List" @ListCHangeStatus="ListCHangeStatus" @chooseRoom="chooseRoom"></List>
        <chatRoom :options="options" @updateList="updateList" @sendInvitation="sendInvitation" v-if="!group && !AI">
        </chatRoom>
        <groupRoom :options="groupOptions" @updateList="updateList" v-if="group && !AI"></groupRoom>
        <AIRoom :options="AIoptions" v-if="AI"></AIRoom>
    </div>
</template>

<script>
// 在渲染进程中发送消息通知主进程修改窗口大小


import SideBar from './components/SideBar/sidebar.vue'
import List from './components/List/list.vue'
import chatRoom from './components/Room/chatRoom.vue'
import AIRoom from './components/Room/AIRoom.vue'
import groupRoom from './components/Room/groupRoom.vue'
import { getConversationInfo } from '@/api/bing';
const remote = window.require('electron').remote;
const win = remote.getCurrentWindow();
import { mapActions } from "vuex";
const { ipcRenderer } = window.require('electron');
export default {
    components: {
        SideBar,
        List,
        chatRoom,
        AIRoom,
        groupRoom
    },

    data() {
        return {
            /**
             * 通信相关
             */
            socket: "",
            /**
             * 侧边栏相关参数
             */
            current: "chat",
            /**
             * 聊天框相关参数
             */
            options: "",
            /**
             * 群聊相关
             */
            group: false,
            groupOptions: "",
            /**
             * bing相关参数
             */
            AI: false,
            AIoptions: {
                room: ""
            }
        };
    },
    created() {
        ipcRenderer.send('resize-window', { width: 1000, height: 600 });
        this.getBingData()
        //检测窗口关闭,自动挂断电话
        win.on('close', (event) => {
            if (this.socket) {
                this.socket.close()
            }
        });
        this.initSocket()
    },
    methods: {
        ...mapActions(["Logout"]),
        /**
         * 通信相关
         */
        initSocket() {
            this.socket = new WebSocket(`${this.wssaddress}/api/chat/v1/auth/user_channel?username=${this.$store.getters.userInfo.username}`)
            this.socket.onmessage = (message) => {
                let options
                let data = JSON.parse(message.data)
                switch (data.name) {
                    case "friend":
                    case "list":
                        //重新加载消息列表
                        this.updateList()
                        break
                    //音视频
                    case "audio":
                        options = {
                            method: data.name,
                            room: data.room,
                            sender: data.sender_name,
                            receiver: data.receiver_username,
                            beInviter: 1
                        }
                        ipcRenderer.send('open-window', options);
                        break
                    //音视频
                    case "video":
                        options = {
                            method: data.name,
                            room: data.room,
                            sender: data.sender_name,
                            receiver: data.receiver_username,
                            beInviter: 1
                        }
                        ipcRenderer.send('open-window', options);
                        break
                    //音视频相应
                    case "peer":
                        options = {
                            method: data.method,
                            room: data.room,
                            sender: data.sender_name,
                            receiver: data.receiver_username,
                            beInviter: 0
                        }
                        ipcRenderer.send('open-window', options);
                        break
                    //拒绝
                    case "reject":
                        if (data.message) {
                            this.$message.error(data.message)
                        } else {
                            this.socket.send(JSON.stringify({ name: "reject" }))
                        }
                        break;
                    case "logout":
                        this.$message.error("你已在其他地方被登录!!!")
                        break;

                }
            }
            this.socket.onclose = () => {
                this.Logout()
            }
        },
        //音视频邀请
        sendInvitation(options) {
            console.log(options);
            this.socket.send(JSON.stringify({ name: options.method, sender_name: options.sender, receiver_username: options.receiver, room: options.room, beInviter: options.beInviter }))
        },
        //改变侧边栏选项
        changeStatus(tag) {
            this.current = tag

        },
        ListCHangeStatus(tag) {
            this.$refs.SideBar.changeStatus(tag)
            this.updateList()
        },
        chooseRoom(item) {
            if (item.AI) {
                if (!this.AIoptions.room) {
                    return this.$message.warning("你无法进行AI对话,请前往设置中生成")
                }
                this.AI = true
            } else if (!item.group_id) {
                this.AI = false
                this.group = false
                this.options = item
            } else {
                this.AI = false
                this.group = true
                this.groupOptions = item
            }
        },
        updateList() {
            this.$refs.List.loadListData()
        },
        /**
         * bing相关方法
         */
        getBingData() {
            getConversationInfo()
                .then((res) => {
                    if (res.data.total != 0) {
                        this.getAIoptions(res.data);
                    }
                })
        },
        getAIoptions(AIoptions) {
            this.AIoptions = AIoptions
        }

    },
    destroyed() {
        if (this.socket) {
            this.socket.close()
            this.socket = null
        }
    },
}
</script>
<style lang="scss" scoped>
.container {
    display: flex;
    height: 100vh;
    overflow: hidden;


}
</style>