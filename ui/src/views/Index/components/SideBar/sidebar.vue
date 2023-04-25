<template>
    <div class="sidebar" @click="showMenu = false">
        <div class="avatar" style=" cursor: pointer;" @click="openInfoDialog">
            <img :src="getPath(userInfo.avatar)" alt="" width="35" height="35" style="object-fit: cover;">
            <div class="avatar-onlie"></div>
        </div>
        <div class="sidebar-items">
            <div class="sidebar-item" @click="changeStatus('chat')">
                <img :src="current != 'chat' ? require('@/assets/sidebar/Chat.png') : require('@/assets/sidebar/Chat-active.png')"
                    alt="" width="25">
            </div>
            <div class="sidebar-item" @click="changeStatus('contact')">
                <img :src="current != 'contact' ? require('@/assets/sidebar/contact.png') : require('@/assets/sidebar/contact-active.png')"
                    alt="" width="25">
            </div>
        </div>
        <div class="sidebar-footer">
            <img :src="require('@/assets/sidebar/menu.png')" alt="" width="25" class="sidebar-menu"
                @click.stop="showMenu = true" :style="showMenu ? 'background-color: #eee;' : ''">
            <div class="sidebar-menu-items" v-if="showMenu">
                <div class="sidebar-menu-item" @click="openBindDialog">二维码绑定</div>
                <div class="sidebar-menu-item" @click="openSettingsDialog">设置</div>
                <div class="sidebar-menu-item" @click="logout">退出</div>
            </div>
        </div>
        <el-dialog title="设备绑定" :visible.sync="showBindDialog" width="300px">
            <h3 style="text-align: center;color: red;">使用微信/支付宝进行设备绑定</h3>
            <vue-qr :logoSrc="logo" :text="text" :size="260"></vue-qr>
        </el-dialog>
        <el-dialog title="" :visible.sync="showInfoDialog" width="400px" custom-class="info-dialog">
            <div class="info-avatar">
                <div class="info-avatar-img">
                    <img :src="photo" alt="" width="80" height="80" style="object-fit: cover;">
                    <img :src="require('@/assets/sidebar/camera.png')" alt="" width="20" class="info-avatar-img-upload"
                        @click="choosePhoto">
                    <input type="file" id="info-avatar-img-file" class="info-avatar-img-file"
                        accept="image/jpeg,image/jpg,image/png" @change="changeImage">
                </div>
                <div class="info-name">
                    <p><input type="text" class="info-input" v-model="userInfo.name"  oninput="value=value.replace(/[^0-9a-zA-Z\u4e00-\u9fa5]/g,'')" /></p>
                    <span style="font-size: 12px;color: rgba(0,0,0,0.5);"><input type="text" class="info-input"
                            v-model="userInfo.signature" placeholder="暂无个性签名"  oninput="value=value.trim()"></span>
                </div>
            </div>
            <hr>
            <div class="info-desc">
                <div class="info-item">
                    <div class="info-item-title">账号</div>
                    <div>{{ userInfo.username }}</div>
                </div>
                <div class="info-item">
                    <div class="info-item-title">电话</div>
                    <div><input type="text" class="info-input" v-model="userInfo.phone" placeholder="绑定手机号后可修改密码"
                            oninput="value=value.replace(/^\.+|[^\d]/g,'')" maxlength="11"></div>
                </div>
                <div class="info-item">
                    <div class="info-item-title">创建时间</div>
                    <div> {{ userInfo.created_at }} </div>
                </div>
            </div>
            <div class="info-btns">
                <button class="info-btn" @click="toUpdateInfo" style="background-color: #67c23a;">修改资料</button>
                <button class="info-btn" @click="openNewpassword" :disabled="phoneFlag"
                    :class="phoneFlag ? 'info-btn-disabled' : ''">修改密码</button>
            </div>
        </el-dialog>
        <Settings @getBingInfo="getBingInfo" ref="Settings"></Settings>
    </div>
</template>

<script>
import vueQr from "vue-qr";
import { UserUpdateInfo, UserUpdatePassword } from '@/api/auth';
import { mapActions } from "vuex";
import Settings from '@/components/settings'
export default {
    components: {
        vueQr,
        Settings
    },
    data() {
        return {
            current: 'chat',
            showMenu: false,
            /**
             * 个人信息相关参数
             */
            showInfoDialog: false,
            userInfo: {

            },
            photo: "",
            avatar: "",
            phoneFlag: true,
            /**
             * 二维码绑定
             */
            showBindDialog: false,
            logo: require("@/assets/logo.png"),
            text: "http://192.168.6.36:9999/#/code",
            /**
             * 设置
             */
            showSettingsDialog: true
        };
    },
    mounted() {
        let prefix = window.location.host
        let username = this.$store.getters.userInfo.username
        this.text = `http://${prefix}/#/code?username=${username}`
        this.userInfo = this.$store.getters.userInfo
        let avatar = this.getPath(this.userInfo.avatar) ? this.getPath(this.userInfo.avatar) : require("@/assets/logo.png")
        this.photo = avatar
        if (this.$store.getters.userInfo.phone) {
            this.phoneFlag = false
        }
    },
    methods: {
        ...mapActions(["updateUserInfo", "Logout", "updateAddress"]),
        //修改状态
        changeStatus(tag) {
            this.current = tag
            this.$emit('changeStatus', tag);
        },
        openInfoDialog() {
            this.showInfoDialog = true
            this.avatar = ""
        },
        //二维码绑定
        openBindDialog() {
            this.showBindDialog = true
        },
        /**
         * 设置相关
         */
        //获取bing相关配置
        getBingInfo(options) {
            this.$emit('getAIoptions', options);
        },
        openSettingsDialog() {
            this.$refs.Settings.openDialog()
        },
        //退出登录
        logout() {
            this.$confirm("此操作将注销当前用户, 是否继续?", "提示", {
                confirmButtonText: "注销",
                cancelButtonText: "取消",
                type: "warning",
            }).then(() => {
                this.$store.dispatch("Logout");
                this.$message.success("注销成功,即将跳转到登录界面");
                setTimeout(() => {
                    this.$router.push(`/login?redirect=${this.$route.fullPath}`);
                }, 1000);
            });
        },
        /** 
         * 个人相关
         * */
        changeImage(e) {
            if (e.target.files.length > 0) {
                var file = e.target.files[0];
                this.photo = URL.createObjectURL(file)
                this.avatar = file

            } else {
                this.photo = this.userInfo.avatar
            }

        },
        //选择图片
        choosePhoto() {
            var choose = document.getElementById('info-avatar-img-file')
            choose.click()
        },
        toUpdateInfo() {
            let formData = new FormData();
            if (!this.userInfo['name'].trim()) {
                return this.$message.warning("昵称不能为空")
            }
            if (this.userInfo['phone'] && this.userInfo['phone'].length != 11) {
                return this.$message.warning("手机号必须11位")
            }
            formData.append("username", this.userInfo['username']);
            formData.append("name", this.userInfo['name'].trim());
            formData.append("phone", this.userInfo['phone']);
            formData.append("signature", this.userInfo['signature'].trim());
            if (this.avatar) {
                formData.append("avatar", this.avatar);
            }
            UserUpdateInfo(formData)
                .then((res) => {
                    if (res.code == 200) {
                        this.$message.success("修改成功")
                        if (res.data.avatar) {
                            this.userInfo.avatar = res.data.avatar
                        }
                        this.updateUserInfo(this.userInfo)
                        if (this.$store.getters.userInfo.phone) {
                            this.phoneFlag = false
                        } else {
                            this.phoneFlag = true
                        }
                    } else {
                        this.$message.error(res.message)
                    }
                })
        },
        openNewpassword() {
            this.$prompt('请输入新密码', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                inputType: "password",
                center: true
            }).then(({ value }) => {
                if (!value.trim()) {
                    return this.$message.warning('请填写新密码')
                }
                let data = {
                    password: value,
                    username: this.userInfo.username,
                    phone: this.$store.getters.userInfo.phone
                }
                UserUpdatePassword(data)
                    .then((res) => {
                        if (res.code == 200) {
                            this.$store.dispatch("Logout");
                            this.$message.success("修改成功,即将跳转到登录界面");
                            setTimeout(() => {
                                this.$router.push(`/login?redirect=${this.$route.fullPath}`);
                                const { ipcRenderer } = window.require('electron');
                                ipcRenderer.send('resize-window', { width: 400, height: 320 });
                            }, 1000);
                        } else {
                            this.$message.error(res.message);
                            this.formData.password = ""
                        }
                    })

            })
        },
        //获取文件路径
        getPath(content) {
            if (!content) {
                return require("@/assets/logo.png")
            }
            return this.ipaddress + content
        },
    },

}
</script>

<style lang="scss" scoped>
.sidebar {
    width: 50px;
    height: 100vh;
    box-sizing: border-box;
    padding: 20px 0 20px 10px;
    box-shadow: 0 0 1px rgba($color: #000000, $alpha: 0.5);
    position: relative;

    .avatar {
        width: 35px;
        position: relative;

        img {
            border-radius: 5px;
        }

        .avatar-onlie {
            position: absolute;
            bottom: 0;
            right: -2px;
            width: 10px;
            height: 10px;
            background-color: #33ee8f;
            border-radius: 50%;
        }
    }

    .sidebar-items {
        margin-top: 30px;
        width: 100%;
        text-align: center;

        .sidebar-item {
            cursor: pointer;
            margin: 20px 0;
            text-align: center;

        }
    }

    .sidebar-footer {
        position: absolute;
        left: 0;
        bottom: 10px;
        width: 100%;
        text-align: center;

        .sidebar-menu {
            &:hover {
                background-color: #eee;
            }

            &:active {
                background-color: #eee;
            }
        }

        .sidebar-menu-items {
            background-color: white;
            width: 100px;
            text-align: left;
            position: absolute;
            bottom: 5px;
            left: 50px;
            z-index: 999;
            box-shadow: 0 0 3px rgb(0 0 0 / 50%);
            font-size: 12px;
            display: flex;
            flex-direction: column;
            justify-content: space-evenly;

            .sidebar-menu-item {
                cursor: pointer;
                width: 100%;
                height: 35px;
                padding-left: 10px;
                box-sizing: border-box;
                line-height: 35px;

                &:hover {
                    background-color: #eee;
                }
            }
        }
    }
}

.info-avatar {
    display: flex;
    align-items: center;
    height: 120px;
    position: relative;

    img {
        border-radius: 5px;
    }

    .info-avatar-img {
        position: relative;

        .info-avatar-img-upload {
            cursor: pointer;
            position: absolute;
            bottom: 5px;
            right: 0;
        }

        .info-avatar-img-file {
            display: none;
        }
    }

    .info-name {
        margin-left: 20px;
        line-height: 1.5;
        font-size: 20px;
    }
}

.info-desc {
    margin-top: 20px;

    .info-item {
        display: flex;
        font-size: 13px;
        margin: 30px 0;

        .info-item-title {
            color: #aeaeae;
            width: 80px;
        }
    }
}

.info-input {
    width: 200px;
    border: 0px;
    box-sizing: border-box;
    border-bottom: 1px solid #eee;
    font-size: 16px;
    outline: none;
    margin-bottom: 5px;

    &:focus {
        border-bottom-color: #5ccdf8;
    }

}

.info-btns {
    display: flex;
    width: 100%;
    justify-content: space-between;

    .info-btn {
        cursor: pointer;
        width: 45%;
        height: 40px;
        border: none;
        color: white;
        border-radius: 5px;
        background-color: #1e6fff;
        box-shadow: 0 2px 0 #243c47;
        transition: all .5s;

        &:active {
            background-color: #11767e;
            box-shadow: 0 4px 0 #243c47;
            transform: translateY(4px);
            /* active时下移，按钮被按下的效果 */
        }
    }

    .info-btn-disabled {
        cursor: not-allowed;
        background-color: #c8c9cc;
    }
}


::v-deep .info-dialog {
    padding-bottom: 20px;

    .el-dialog__body {
        padding: 0 20px;
    }
}
</style>