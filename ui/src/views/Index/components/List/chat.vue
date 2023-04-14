<template>
    <div class="chat-list">
        <div class="chat-item" v-for="item in ChatList" :key="item.room" @click="chooseRoom(item)"
            :style="currentRoom == item.user_id ? 'background-color: #eee;' : ''">
            <div class="chat-avatar">
                <img :src="item.avatar ? item.avatar : require('@/assets/logo.png')" alt="" width="45" height="45"
                    style="object-fit: cover;">
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
            currentRoom: '',
            timer: ''
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
                    }]
                    for (const item of res.data) {
                        item.updated_at = toggleTime2(item.updated_at)
                        ChatList.push(item)
                    }
                    this.ChatList = ChatList
                })
        },
        //选择房间
        chooseRoom(item) {
            this.currentRoom = item.user_id
            this.$emit('chooseRoom', item);
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
        align-items: center;
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