<template>
    <div class="contact-list">
        <el-tabs v-model="activeName" stretch>
            <el-tab-pane label="好友" name="chat">
                <div style=" width: 100%;
                height: calc(100vh - 120px);overflow: auto;">
                    <el-tree :data="FriendList" :props="defaultProps">
                        <div slot-scope="{ node, data }">
                            <div v-if="data.children">
                                {{ node.label }} {{ data.len + '/' + data.len }}
                            </div>
                            <div v-else class="tree-item">
                                <div class="tree-item-avatar">
                                    <img :src="require('@/assets/sidebar/avatar.jpg')" alt="" width="30" height="30"
                                        style="object-fit: cover;">
                                </div>
                                <div class="tree-item-info">
                                    {{ node.label }}

                                </div>
                            </div>

                        </div>
                    </el-tree>
                </div>


            </el-tab-pane>
            <el-tab-pane label="群聊" name="groupChat">
                <div style=" width: 100%;
                height: calc(100vh - 120px);overflow: auto;">
                    <div class="group-tree-item" v-for="item in groupList" :key="item.id">
                        <div class="group-tree-item-avatar">
                            <img :src="item.avatar ? item.avatar : require('@/assets/logo.png')" alt="" width="40"
                                height="40" style="object-fit: cover;">
                        </div>
                        <div class="group-tree-item-info">
                            {{ item.name }} ({{ item.members.length + '/' + item.members.length }})
                        </div>
                    </div>
                </div>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
import { getFriend_list } from '@/api/friend';
import { getGroup_list } from '@/api/group';
export default {
    name: 'Contact',
    data() {
        return {
            search: "",
            showAdd: false,
            // current: "chat",
            activeName: "chat",
            FriendList: [],
            groupList: [],
            defaultProps: {
                children: 'children',
                label: 'label',
                len: 'len'
            }
        };
    },
    created() {
        this.loadFriendData()
        this.loadGroupData()
    },
    methods: {
        loadFriendData() {
            getFriend_list()
                .then((res) => {
                    if (res.code == 200) {
                        let FriendList = []
                        for (const item of res.data) {
                            let friend = { label: item.name, children: [], len: item.friend.length }
                            for (const f of item.friend) {
                                friend.children.push({ label: f.remark, value: f.user_id })
                            }
                            FriendList.push(friend)
                        }
                        this.FriendList = FriendList
                    }
                })
        },
        loadGroupData() {
            getGroup_list()
                .then((res) => {
                    if (res.code == 200) {
                        let groupList = res.data
                        this.groupList = groupList
                    }
                })
        }
    },
}
</script>

<style lang="scss" scoped>
.contact-list {
    width: 100%;
    height: calc(100vh - 70px);

    .tree-item {
        cursor: pointer;
        padding: 5px 0;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .tree-item-info {
            white-space: nowrap;
            margin-left: 10px;
            width: 120px;
            overflow: hidden;
        }
    }

    .group-tree-item {
        cursor: pointer;
        padding: 10px 0;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
            background-color: #eee;
        }

        .group-tree-item-info {
            white-space: nowrap;
            margin-left: 10px;
            width: 120px;
            overflow: hidden;

        }
    }
}
</style>