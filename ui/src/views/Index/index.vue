<template>
    <div class="container">
        <SideBar @changeStatus="changeStatus" ref="SideBar" @getAIoptions="getAIoptions"></SideBar>
        <List :current="current" ref="List" @ListChangeStatus="ListChangeStatus" @chooseRoom="chooseRoom"
            @showFriendInfo="showFriendInfo" @showGroupInfo="showGroupInfo" @sendFriendMessage="sendFriendMessage"
            @sendGroupMessage="sendGroupMessage" @ShowinvitationFriend="ShowinvitationFriend" @update_group_info="update_group_info"></List>
        <chatRoom :options="options" @updateList="updateList" @sendInvitation="sendInvitation" v-if="currentRoom == 'chat'">
        </chatRoom>
        <groupRoom :options="groupOptions" @updateList="updateList" @sendGroupInvitation="sendGroupInvitation"
            v-if="currentRoom == 'group'"></groupRoom>
        <AIRoom :options="AIoptions" v-if="currentRoom == 'ai'"></AIRoom>
        <Info :options="friendoptions" v-if="currentRoom == 'info'" @sendFriendMessage="sendFriendMessage"
            @update_friend=update_friend></Info>
        <Group ref="group_info"  :group_id="groupInfooptions" v-if="currentRoom == 'group_info'" @sendGroupMessage="sendGroupMessage"
            @ShowinvitationFriend="ShowinvitationFriend" ></Group>
    </div>
</template>

<script>
// 在渲染进程中发送消息通知主进程修改窗口大小


import SideBar from './components/SideBar/sidebar.vue'
import List from './components/List/list.vue'
import chatRoom from './components/Room/chatRoom.vue'
import AIRoom from './components/Room/AIRoom.vue'
import groupRoom from './components/Room/groupRoom.vue'
import Info from './components/Room/Info.vue'
import Group from './components/Room/group.vue'
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
        groupRoom,
        Info,
        Group
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
            currentRoom: "chat",
            options: "",
            /**
             * 群聊相关
             */
            groupOptions: "",
            /**
             * bing相关参数
             */
            AIoptions: {
                room: ""
            },
            /**
             *  好友信息或群聊相关参数 
             */
            friendoptions: "",
            groupInfooptions: ""
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
                    //群聊音视频
                    case "group_audio":
                        options = {
                            method: data.name,
                            room: data.room,
                            sender: data.sender_name,
                            group_id: data.group_id,
                            beInviter: 1
                        }
                        ipcRenderer.send('open-window', options);
                        break;
                    //群聊音视频
                    case "group_video":
                        options = {
                            method: data.name,
                            room: data.room,
                            sender: data.sender_name,
                            group_id: data.group_id,
                            beInviter: 1
                        }
                        ipcRenderer.send('open-window', options);
                        break;
                    case "group_peer":
                        options = {
                            method: data.method,
                            room: data.room,
                            sender: data.sender_name,
                            group_id: data.group_id,
                            beInviter: 0
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
                        this.Logout()
                        break;

                }
            }
        },
        //音视频邀请
        sendInvitation(options) {
            this.socket.send(JSON.stringify({ name: options.method, sender_name: options.sender, receiver_username: options.receiver, room: options.room, beInviter: options.beInviter }))
        },
        //群聊音视频邀请
        sendGroupInvitation(options) {
            this.socket.send(JSON.stringify({
                name: options.method,
                userList: this.userList,
                sender_name: options.sender,
                group_id: options.group_id,
                userList: options.userList,
                room: options.room,
                beInviter: options.beInviter
            }))

        },
        //改变侧边栏选项
        changeStatus(tag) {
            this.current = tag

        },
        ListChangeStatus(tag) {
            this.$refs.SideBar.changeStatus(tag)
            this.updateList()

        },
        chooseRoom(item) {
            if (item.AI) {
                if (!this.AIoptions.room) {
                    return this.$message.warning("你无法进行AI对话,请前往设置中生成")
                }
                this.$nextTick(() => {
                    this.$refs.List.updatecurrentRoom(0)
                });
                this.currentRoom = 'ai'
            } else if (!item.group_id) {
                this.currentRoom = 'chat'
                this.options = item
            } else if (item.group_id) {
                this.currentRoom = 'group'
                this.groupOptions = item
            } else if (item.info) {
                this.currentRoom = 'info'
            }
        },
        updateList() {
            this.$nextTick(() => {
                this.$refs.List.loadListData()
            });
        },
        /***
         * 好友详情相关信息
         */
        showFriendInfo(item) {
            this.currentRoom = 'info'
            this.friendoptions = item
        },
        sendFriendMessage(item) {
            this.currentRoom = 'chat'
            this.ListChangeStatus("chat")
            this.options = item
            this.$nextTick(() => {
                this.$refs.List.updatecurrentRoom(item.user_id)
            });
        },
        update_friend() {
            if (this.current != 'chat') {
                this.$refs.List.refreshList()
            }
        },
        /**
         * 群聊相关
         */
        //显示群聊信息
        showGroupInfo(item) {
            this.currentRoom = 'group_info'
            this.groupInfooptions = item
        },
        //去群聊
        sendGroupMessage(item) {
            this.currentRoom = 'group'
            this.ListChangeStatus("chat")
            this.groupOptions = item
            this.$nextTick(() => {
                this.$refs.List.updatecurrentRoom(undefined, item.group_id)
            });
        },
        //邀请好友
        ShowinvitationFriend(group_id) {
            this.$refs.List.ShowinvitationFriend(group_id)
        },
        //更新群聊信息
        update_group_info(){
            if( this.currentRoom =='group_info'){
                this.$refs.group_info.loadData()
            }
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