<template>
    <div class="container" @click="showAdd = false">
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
export default {
    components: {
        SideBar,
        List,
        chatRoom,
        AIRoom
    },

    data() {
        return {
            search: "",
            showAdd: false,
            current: "chat",
            activeName: "chat",

            socket: "",
            pc: "",
            receiver: "",
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
    },
    methods: {
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

}
</script>
<style lang="scss" scoped>
.container {
    display: flex;
    height: 100vh;
    overflow: hidden;


}
</style>