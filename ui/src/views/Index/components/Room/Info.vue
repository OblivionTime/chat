<template>
    <div class="info-container">
        <div class="info-card">
            <div class="info-header">
                <div class="info-avatar">
                    <img :src="info.avatar ? getAvatarPath(info.avatar) : require('@/assets/logo.png')" alt="" width="65"
                        height="65" style="object-fit: cover;">

                </div>
                <div class="info-name">
                    <p>{{ info.name }}</p>
                    <span style="font-size: 12px;color: rgba(0,0,0,0.5);">{{ info.signature ? info.signature : '该用户未设置个性签名'
                    }}</span>
                </div>
            </div>
            <div class="info-content">
                <div class="info-item">
                    <p class="info-item-title">账号</p>
                    <p>{{ info.username }}</p>
                </div>
                <div class="info-item">
                    <p class="info-item-title">昵称</p>
                    <p>{{ info.name }}</p>
                </div>
                <div class="info-item">
                    <p class="info-item-title">备注</p>
                    <p v-if="!editBtn"> {{ formData.remark }}<i class="el-icon-edit" style="cursor: pointer;"
                            @click.prevent.stop="editBtn = true"></i></p>
                    <p v-else><input type="text" v-model="formData.remark" @click.prevent.stop=""></p>
                </div>
                <div class="info-item">
                    <p class="info-item-title">分组</p>
                    <select v-model="formData.new_group_id" placeholder="分组情况" style="height: 30px;width: 200px;">
                        <option :label="item.label" :value="item.value" v-for="item in options.friendgroupList"
                            :key="item.value" />
                    </select>
                </div>
            </div>
            <div class="info-footer">
                <el-button style="width: 45%;" @click.prevent.stop="saveInfo">保存信息</el-button>
                <el-button type="primary" style="width: 45%;" @click.prevent.stop="sendFriendMessage">发送消息</el-button>
            </div>
        </div>
    </div>
</template>

<script>
import { getFriend_info, postUpdate_friend } from '@/api/friend';
export default {
    props: {
        options: {
            default: ""
        },
    },
    data() {
        return {
            info: "",
            editBtn: false,
            formData: {
                "old_group_id": "",
                "new_group_id": "",
                "user_id": "",
                "remark": ""
            }

        }
    },
    created() {
        this.loadData()
    },
    watch: {
        options(newOptions, oldOptions) {
            if (newOptions.user_id == oldOptions.user_id) {
                return
            }
            if (this.options) {
                this.loadData()
            }
        },
        deep: true
    },
    methods: {
        loadData() {
            getFriend_info({ group_id: this.options.group_id, user_id: this.options.user_id })
                .then((res) => {
                    if (res.code == 200) {
                        this.info = res.data
                        this.formData.old_group_id = this.options.group_id
                        this.formData.remark = res.data.remark
                        this.formData.new_group_id = this.options.group_id
                        this.formData.user_id = this.options.user_id
                    }
                })
        },
        //获取头像地址
        getAvatarPath(content) {
            if (content.includes("upload")) {
                return this.ipaddress + content
            }
            return content
        },
        //保存信息
        saveInfo() {
            postUpdate_friend(this.formData)
                .then((res) => {
                    if (res.code == 200) {
                        this.$message.success("修改成功")
                        this.options.group_id = this.formData.new_group_id
                        this.loadData()
                        this.$emit("update_friend")
                    } else {
                        this.$message.error(res.message)
                    }
                })
        },
        //和当前用户进行聊天
        sendFriendMessage() {
            let item = {
                avatar: this.info.avatar,
                name: this.info.remark ? this.info.remark : this.info.name,
                receiver_username: this.info.username,
                room: this.info.room,
                user_id: this.info.user_id,
            }
            this.$emit("sendFriendMessage", item)
        }
    },
}
</script>

<style lang="scss" scoped>
.info-container {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f5f6f7;
    height: 100vh;
    width: calc(100vw - 260px);

    .info-card {
        background-color: #fff;
        width: 360px;
        height: 450px;
        border-radius: 5px;
        position: relative;
        box-shadow: 0 0 1px rgba($color: #000000, $alpha: 0.5);
        box-sizing: border-box;
        padding: 10px 20px;

        .info-header {
            display: flex;
            align-items: center;
            height: 90px;
            position: relative;
            border-bottom: 1px solid #eee;

            img {
                border-radius: 5px;
            }

            .info-name {
                margin-left: 20px;
                line-height: 1.5;
                font-size: 20px;
            }
        }

        .info-content {
            height: calc(450px - 180px);
            margin-top: 30px;

            .info-item {
                display: flex;
                font-size: 14px;
                margin: 10px 0;
                align-items: center;

                .info-item-title {
                    color: #c4c4c4;
                    width: 80px;
                    letter-spacing: 1em;
                    // margin-right: 20px;
                }
            }
        }
    }
}
</style>