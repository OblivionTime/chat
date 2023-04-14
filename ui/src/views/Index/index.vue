<template>
    <div class="container">
        <SideBar @changeStatus="changeStatus" ref="SideBar" @getAIoptions="getAIoptions"></SideBar>
        <List :current="current" ref="List" @ListCHangeStatus="ListCHangeStatus" @chooseRoom="chooseRoom"></List>
        <chatRoom :options="options" @updateList="updateList" v-if="!AI"></chatRoom>
        <AIRoom :options="AIoptions" v-if="AI"></AIRoom>
    </div>
</template>

<script>
// 在渲染进程中发送消息通知主进程修改窗口大小


import SideBar from './components/sidebar.vue'
import List from './components/list.vue'
import chatRoom from './components/chatRoom.vue'
import AIRoom from './components/AIRoom.vue'
import { getConversationInfo } from '@/api/bing';
const remote = window.require('electron').remote;
const win = remote.getCurrentWindow();
export default {
    components: {
        SideBar,
        List,
        chatRoom,
        AIRoom
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
             * bing相关参数
             */
            AI: false,
            AIoptions: {
                room: ""
            }
        };
    },
    created() {
        const { ipcRenderer } = window.require('electron');
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
        /**
         * 通信相关
         */
        initSocket() {
            this.socket = new WebSocket(`${this.wssaddress}/api/chat/v1/auth/user_channel?username=${this.$store.getters.userInfo.username}`)
            this.socket.onmessage = (message) => {
                let data = JSON.parse(message.data)
                switch (data.name) {
                    case "friend":
                    case "list":
                        //重新加载消息列表
                        this.updateList()
                        break
                }
            }
        },
        //改变侧边栏选项
        changeStatus(tag) {
            this.current = tag

        },
        ListCHangeStatus(tag) {
            this.$refs.SideBar.changeStatus(tag)
        },
        chooseRoom(item) {
            if (item.AI) {
                if (!this.AIoptions.room) {
                    return this.$message.warning("你无法进行AI对话,请前往设置中生成")
                }
                this.AI = true
            } else {
                this.AI = false
                this.options = item
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