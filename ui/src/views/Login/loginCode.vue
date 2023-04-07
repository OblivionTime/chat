<template>
    <div class="container">
        <div class="header">
            <div class="header-left">
                <img src="../../assets/logo.png" alt="" width="25px">
                <span style="font-size: 16px;margin-left: 5px;">翎</span>
            </div>
            <div class="header-right">
                <img src="../../assets/login/min.png" alt="" width="12px" class="header-icon" @click="minWindow">
                <img src="../../assets/login/close.png" alt="" width="12px" class="header-icon" @click="closeWindow">
            </div>
        </div>
        <div class="code">
            <vue-qr :logoSrc="logo" :text="text" :size="150"></vue-qr>
            <div style="font-size: 14px;" v-if="!scanFlag">使用<span style="color: #40c5f6;">微信/支付宝</span>扫描二维码安全登录.</div>
            <div style="font-size: 14px;" v-else><i class="el-icon-success" style="color: greenyellow;margin-right: 5px;"></i>扫描成功,请在手机上点击确认
            </div>
            <button class="back-btn" @click="toBack">返回</button>
        </div>
    </div>
</template>

<script>
import { UserUpdatePassword, } from "@/api/auth.js";
import { mapActions } from "vuex";
import vueQr from "vue-qr";

export default {
    components: {
        vueQr
    },
    data() {
        return {
            sty: "",
            logo: require("@/assets/logo.png"),
            room: "",
            socket: "",
            text: "",
            scanFlag: false,
        }
    },
    created() {
        this.room = new Date().getTime()
        let prefix = window.location.host
        this.text = `http://${prefix}/#/code?room=${this.room}`
        this.initSocket()
    },
    methods: {
        ...mapActions(["Login"]),
        minWindow() {
            win.minimize();
        },
        initSocket() {
            // let prefix = window.location.host
            let prefix = "192.168.6.36:8888"
            this.socket = new WebSocket(`wss://${prefix}/api/chat/v1/auth/login_code?room=${this.room}&name=device`)
            this.socket.onopen = () => {
                console.log("开启成功");
            };
            this.socket.onmessage = (message) => {
                let data = JSON.parse(message.data)
                if (data.operation == 'connect') {
                    this.scanFlag = true
                } else {
                    this.Login(data);
                    this.$message.success("登录成功");
                    this.$router.push("/");
                    this.socket.send(JSON.stringify({ operation: "success" }))
                    this.socket.close()
                    this.socket = null
                }
            }
        },
        closeWindow() {
            win.close()
        },
        toBack() {
            this.$router.go(-1)
        }
    },
    destroyed() {
        if (this.socket) {
            this.socket.close()
        }
    },
}
</script>

<style lang="scss" scoped>
.container {
    font-family: Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB,
        Microsoft YaHei, 微软雅黑, Arial, sans-serif;
    line-height: 1.7;
    background-image: linear-gradient(0deg, #fbc2eb 0, #a6c1ee);
    background-blend-mode: screen, overlay, hard-light, color-burn, color-dodge,
        normal;
    background-attachment: fixed;
    background-repeat: no-repeat;
    background-position: 0 100%;
    color: #fff;
    height: 100vh;
    text-align: center;

    .header {
        width: 100%;
        height: 80px;
        color: white;
        box-sizing: border-box;
        padding: 0px 10px;
        // background-color: red;
        display: flex;
        justify-content: space-between;
        -webkit-app-region: drag;

        .header-left {
            -webkit-app-region: no-drag;
            height: 40px;
            display: flex;
            align-items: center;
        }

        .header-right {
            -webkit-app-region: no-drag;
            height: 40px;
            display: flex;
            align-items: center;

            .header-icon {
                cursor: pointer;
                margin: 0 5px;
            }
        }
    }

    .code {
        .back-btn {
            cursor: pointer;
            margin-top: 10px;
            width: 200px;
            height: 30px;
            border-radius: 5px;
            border: 0;
            background-color: #05bafb;
            color: white;
            box-shadow: 0 2px 0 #243c47;
            transition: all .5s;

            &:active {
                background-color: #11767e;
                box-shadow: 0 4px 0 #243c47;
                transform: translateY(4px);
                /* active时下移，按钮被按下的效果 */
            }
        }
    }

}
</style>