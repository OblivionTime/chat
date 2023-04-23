<template>
    <div class="chat-list">
        <div class="chat-item" v-for="item in ChatList" :key="item.room" @click="chooseRoom(item)"
            :style="currentStyle(item)">
            <div class="chat-avatar">
                <img :src="item.avatar ? getAvatarPath(item.avatar) : require('@/assets/logo.png')" alt="" width="45"
                    height="45" style="object-fit: cover;">
            </div>
            <div class="chat-info">
                <div class="chat-title">
                    {{ item.name }}
                </div>
                <div class="chat-message">
                    {{ ParseMessage(item) }}

                </div>
            </div>
            <div class="chat-time">
                <div class="chat-title">
                    {{ item.updated_at }}
                </div>
                <div class="chat-message" v-if="item.unreadCount != 0">
                    <span>{{ item.unreadCount }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { getMessageList } from '@/api/message';
import { toggleTime2 } from '@/utils/timeFormat';
export default {
    name: 'Chat',
    data() {
        return {
            ChatList: [],
            currentRoom: -1,
            timer: '',
            cureentGroup: false,
        };
    },
    mounted() {
        this.loadData()
        this.timer = setInterval(() => {
            this.loadData()
        }, 60 * 1000);
    },
    methods: {
        loadData() {
            getMessageList()
                .then((res) => {
                    let ChatList = [{
                        avatar: require('@/assets/chat/Bing.svg'),
                        lastMessage: "",
                        name: "必应",
                        unreadCount: 0,
                        updated_at: "now",
                        AI: true,
                        user_id: 0
                    }]
                    for (const item of res.data) {
                        item.updated_at = toggleTime2(item.updated_at)
                        ChatList.push(item)
                    }
                    this.ChatList = ChatList
                })
        },
        currentStyle(item) {
            if (this.cureentGroup) {
                return this.currentRoom == item.group_id ? 'background-color: #eee;' : ''
            } else {
                return this.currentRoom == item.user_id ? 'background-color: #eee;' : ''
            }
        },
        //选择房间
        chooseRoom(item) {
            if (item.AI) {
                this.$emit('chooseRoom', item);
                return
            }
            if (item.group_id) {
                this.cureentGroup = true
                this.currentRoom = item.group_id
            } else {
                this.cureentGroup = false
                this.currentRoom = item.user_id
            }
            this.$emit('chooseRoom', item);
        },
        //修改currentRoom
        updatecurrentRoom(user_id,group_id) {
            if(!group_id){
                this.cureentGroup = false
                this.currentRoom = user_id
            }else{
                this.cureentGroup = true
                this.currentRoom = group_id

            }
        },
        //解析最后一条消息
        ParseMessage(item) {
            if (item.type == 'text') {
                return item.lastMessage
            } else if (item.type == 'image') {
                return "[图片]"
            } else if (item.type == 'video') {
                return "[视频]"
            } else if (item.type == 'file') {
                return "[文件]"
            }
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
        if (this.timer) {
            clearInterval(this.timer)
            this.timer = null
        }
    },
}
</script>

<style lang="scss" scoped>
.chat-list {
    width: 100%;
    overflow: auto;
    height: calc(100vh - 70px);

    .chat-item {
        cursor: pointer;
        height: 50px;
        padding: 10px 0 10px 10px;
        display: flex;
        // align-items: center;
        justify-content: space-between;

        &:hover {
            background-color: #eee;
        }

        .chat-info {
            font-size: 14px;
            width: 100px;

            .chat-title {
                white-space: nowrap;
                width: 100px;
                overflow: hidden;
            }

            .chat-message {
                margin-top: 5px;
                font-size: 12px;
                color: rgba($color: #000000, $alpha: 0.5);
                white-space: nowrap;
                width: 100px;
                overflow: hidden;
            }
        }

        .chat-time {
            text-align: right;
            margin-right: 10px;
            font-size: 12px;
            color: #757575;
            box-shadow: 0 0 2px rgba(255, 255, 255, 0.5);

            .chat-message {
                color: white;
                margin-top: 5px;

                span {
                    padding: 2px;
                    border-radius: 30%;
                    font-size: 13px;
                    background-color: #d0cfd1;
                }
            }
        }
    }
}
</style>