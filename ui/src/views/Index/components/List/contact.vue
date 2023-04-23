<template>
    <div class="contact-list">
        <el-tabs v-model="activeName" stretch>
            <el-tab-pane label="好友" name="chat">

                <div style=" width: 100%;
                height: calc(100vh - 120px);overflow: auto;" class="contact" @contextmenu.prevent.stop="showMenu">

                    <el-tree :data="FriendList" :props="defaultProps">
                        <div slot-scope="{ node, data }">
                            <div v-if="data.children" @contextmenu.prevent.stop="showFriendMenu(node.label, $event)">
                                <span :style="data.children.length == 0 ? 'padding-left:24px' : ''"> {{ node.label }} {{
                                    data.len + '/' + data.len
                                }}</span>

                            </div>
                            <div v-else class="tree-item" @click="showFriendInfo(data)" @contextmenu.prevent.stop="">
                                <div class="tree-item-avatar">
                                    <img :src="data.avatar ? getAvatarPath(data.avatar) : require('@/assets/logo.png')"
                                        alt="" width="30" height="30" style="object-fit: cover;">
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
                height: calc(100vh - 120px);overflow: auto;" @contextmenu.prevent.stop="showGroupMenu">
                    <div class="group-tree-item" v-for="item in groupList" :key="item.id"
                        @contextmenu.prevent.stop="showGroupItemMenu(item.name, item.id, $event)"
                        @click="showGroupInfo(item.id)" :style="group_current == item.id ? 'background:#eee' : ''">
                        <div class="group-tree-item-avatar">
                            <img :src="item.avatar ? getAvatarPath(item.avatar) : require('@/assets/logo.png')" alt=""
                                width="40" height="40" style="object-fit: cover;">
                        </div>
                        <div class="group-tree-item-info">
                            {{ item.name }} ({{ item.members_len + '/' + item.members_len }})
                        </div>
                    </div>
                </div>
            </el-tab-pane>
        </el-tabs>
        <div class="menu" v-if="isShowMenu" :style="{ 'left': menuLeft + 'px', 'top': menuTop + 'px' }">
            <home-menu :menus="menus" @hiddenMenu="hiddenMenu" />
        </div>
    </div>
</template>

<script>
import { getFriend_list, getFriendGroup_list, postCreate, postUpdate } from '@/api/friend';
import { getGroup_list, postExitGroupChat, postRenameGroup } from '@/api/group';
import homeMenu from '@/components/HomeMenu'

export default {
    name: 'Contact',
    components: {
        homeMenu
    },
    data() {
        return {
            search: "",
            showAdd: false,
            // current: "chat",
            activeName: "chat",
            FriendList: [],
            groupList: [],
            friendgroupList: [],
            defaultProps: {
                children: 'children',
                label: 'label',
                len: 'len',
                user_id: 'user_id',
                group_id: 'group_id',
            },
            menus: [],
            group_current: 0,
            /**
             * 菜单相关
             */
            isShowMenu: false,
            menuLeft: 0,
            menuTop: 0,
            //原分组名
            old_name: "",
        };
    },
    created() {
        this.loadData()
        document.addEventListener('click', () => {
            this.isShowMenu = false
        })
        document.addEventListener('mousedown', (e) => {
            const { button } = e
            if (button === 2) {
                this.isShowMenu = false
            }
        })
    },
    methods: {
        loadData() {
            //加载好友列表
            this.loadFriendData()
            //加载群聊列表
            this.loadGroupData()
            //加载分组列表
            this.loadGroupList()
        },
        loadFriendData() {
            getFriend_list()
                .then((res) => {
                    if (res.code == 200) {
                        let FriendList = []
                        for (const item of res.data) {
                            let friend = { label: item.name, children: [], len: item.friend.length }
                            for (const f of item.friend) {
                                friend.children.push({ label: f.remark, value: f.user_id, group_id: f.group_id, user_id: f.user_id, avatar: f.avatar })
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
        },
        //加载当前用户所有分组
        loadGroupList() {
            getFriendGroup_list()
                .then((res) => {
                    if (res.code == 200) {
                        let friendgroupList = []
                        for (const item of res.data) {
                            let friendgroup = { label: item.name, value: item.id }

                            friendgroupList.push(friendgroup)
                        }
                        this.friendgroupList = friendgroupList
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
        /**
         * 好友相关方法
         */
        showFriendInfo(data) {
            this.group_current = 0
            this.$emit('showFriendInfo', { group_id: data.group_id, user_id: data.user_id, friendgroupList: this.friendgroupList });
        },
        /**
         * 群聊相关
         */
        showGroupInfo(id) {
            this.group_current = id
            this.$emit('showGroupInfo', id);
        },
        /**
         * 菜单相关
         */
        showMenu(e) {
            this.menus = [
                { name: "添加分组", RowClick: this.AddGroup },
                { name: "刷新", RowClick: this.refreshGroup },
            ]
            this.isShowMenu = true
            this.menuLeft = e.pageX
            this.menuTop = e.pageY
        },
        showFriendMenu(label, e) {
            this.old_name = label
            this.menus = [
                { name: "重命名", RowClick: this.renameGroup },
                { name: "添加分组", RowClick: this.AddGroup },
                { name: "刷新", RowClick: this.refreshGroup },
                { name: "删除分组", RowClick: this.refreshGroup },
            ]
            this.isShowMenu = true
            this.menuLeft = e.pageX
            this.menuTop = e.pageY
        },
        showGroupMenu(e) {
            this.menus = [
                { name: "创建群聊", RowClick: () => { this.$emit("openCreateDialog") } },
                { name: "刷新", RowClick: this.loadGroupData },
            ]
            this.isShowMenu = true
            this.menuLeft = e.pageX
            this.menuTop = e.pageY
        },
        showGroupItemMenu(label, group_id, e) {
            this.group_current = group_id
            this.menus = []
            let user_id = this.$store.getters.userInfo.id
            for (const { id, creator_id, name } of this.groupList) {
                if (id == group_id) {
                    if (creator_id == user_id) {
                        this.menus.push({ name: "重命名", RowClick: () => { this.renameGroup(label, id) } })
                        break
                    }
                }
            }
            this.menus.push(
                { name: "邀请好友", RowClick: () => { this.$emit("ShowinvitationFriend", group_id) } },
                { name: "创建群聊", RowClick: () => { this.$emit("openCreateDialog") } },
                { name: "刷新", RowClick: this.loadGroupData },
                { name: "退出群聊", RowClick: () => { this.ToExitGroupChat(group_id) } },)
            this.isShowMenu = true
            this.menuLeft = e.pageX
            this.menuTop = e.pageY
        },
        hiddenMenu() {
            this.isShowMenu = false
        },
        //添加分组
        AddGroup() {
            this.$prompt('请输入分组名', '创建分组', {
                confirmButtonText: '创建',
                cancelButtonText: '取消',
                inputValidator: this.inputValidator,
            }).then(({ value }) => {

                postCreate({ name: value, username: this.$store.getters.userInfo.username, user_id: this.$store.getters.userInfo.id })
                    .then((res) => {
                        if (res.code == 200) {
                            this.$message.success("创建成功")
                            //加载好友列表
                            this.loadFriendData()
                            //加载分组列表
                            this.loadGroupList()
                        } else {
                            this.$message.error(res.message)
                        }
                    })
            })
        },
        //重命名分组
        renameGroup() {
            this.$prompt('请输入分组名', '重命名', {
                confirmButtonText: '修改',
                cancelButtonText: '取消',
                inputValue: this.old_name,
                inputValidator: this.inputValidator,
            }).then(({ value }) => {
                postUpdate({ name: value, old_name: this.old_name, user_id: this.$store.getters.userInfo.id })
                    .then((res) => {
                        if (res.code == 200) {
                            this.$message.success("修改成功")
                            //加载好友列表
                            this.loadFriendData()
                            //加载分组列表
                            this.loadGroupList()
                        } else {
                            this.$message.error(res.message)
                        }
                    })
            })
        },
        inputValidator(text) {
            if (text) {
                return true
            } else {
                return "分组名不能为空"
            }
        },
        /***
         * 群聊相关
         */
        //重命名群聊
        renameGroup(old_name, group_id) {
            this.$prompt('请输入新的群名', '重命名', {
                confirmButtonText: '修改',
                cancelButtonText: '取消',
                inputValue: old_name,
                inputValidator: this.inputValidator,
            }).then(({ value }) => {
                postRenameGroup({ name: value, old_name, group_id })
                    .then((res) => {
                        if (res.code == 200) {
                            this.$message.success("修改成功")
                            this.loadGroupData()
                        } else {
                            this.$message.error(res.message)
                        }
                    })
            })
        },
        //退出群聊
        ToExitGroupChat(group_id) {
            let group_name = ""
            let user_id = this.$store.getters.userInfo.id
            let tips = ""
            for (const { id, creator_id, name } of this.groupList) {
                if (id == group_id) {
                    group_name = name
                    if (creator_id == user_id) {
                        tips = `此操作将解散<span style="color:red">${group_name}</span>群聊, 是否继续?`
                    } else {
                        tips = `此操作将退出<span style="color:red">${group_name}</span>群聊, 是否继续?`
                    }
                }
            }
            this.$confirm(tips, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
                dangerouslyUseHTMLString: true
            }).then(() => {
                postExitGroupChat({ group_id })
                    .then((res) => {
                        if (res.code == 200) {
                            this.$message.success("退出成功")
                            this.loadGroupData()
                        } else {
                            this.$message.error(res.message)
                        }
                    })
            })
        },
        //刷新分组
        refreshGroup() {
            this.loadData()
        }
    },
}
</script>

<style lang="scss" scoped>
.contact-list {
    width: 100%;
    height: calc(100vh - 70px);

    .contact {
        .contact-headers {
            color: #999999;
            font-size: 12px;
            margin: 10px 0;
            margin-left: 10px;
        }

        .contact-new {
            cursor: pointer;
            padding: 5px 10px;
            display: flex;
            align-items: center;

            .contact-new-info {
                white-space: nowrap;
                margin-left: 10px;
                width: 120px;
                overflow: hidden;
            }

            &:hover {
                background-color: #eee;
            }
        }

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

        &:focus {
            background-color: #eee;

        }

        &::selection {
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

.menu {
    position: fixed;
    z-index: 1004;
    background-color: #fff;
    border-radius: 5px;
}
</style>