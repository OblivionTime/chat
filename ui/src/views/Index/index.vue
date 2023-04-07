<template>
    <div class="container" @click="showAdd = false">
        <SideBar @changeStatus="changeStatus" ref="SideBar"></SideBar>
        <List :current="current"  ref="List" @ListCHangeStatus="ListCHangeStatus" @chooseRoom="chooseRoom"></List>
        <chatRoom :options="options" @updateList="updateList"></chatRoom>
    </div>
</template>

<script>
// 在渲染进程中发送消息通知主进程修改窗口大小


import SideBar from './components/sidebar.vue'
import List from './components/list.vue'
import chatRoom from './components/chatRoom.vue'
export default {
    components: {
        SideBar,
        List,
        chatRoom
    },
    created() {
        const { ipcRenderer } = window.require('electron');
        ipcRenderer.send('resize-window', { width: 1000, height: 600 });
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
            options: ""
        };
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
            this.options = item
        },
        updateList(){
            this.$refs.List.loadListData()
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