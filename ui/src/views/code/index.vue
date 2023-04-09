<template>
    <div class="container">
        <div class="bind" v-if="model == 'bind'">
            <img src="../../assets/login/bind.png" alt="" width="150" style="margin: 5vh;">
            <h1>是否通过当前设备绑定<span style="color: greenyellow;">{{ username }}</span>用户</h1>
            <button class="btn" @click="BindUsername">绑定</button>
        </div>
        <div class="login" v-if="model == 'login'">
            <img src="../../assets/logo.png" alt="" width="150" style="margin: 5vh;">
            <h1 v-if="!username">当前设备未绑定任何账号</h1>
            <div v-if="username" style="text-align: center;">
                <h1>检测到当前设备绑定<span style="color: greenyellow;">{{ username }}</span>用户,点击登录按钮进行登录</h1>
                <button class="btn" style="margin-top: 30px;" @click="ToLogin">登录</button>
            </div>

        </div>
        <div class="bind" v-if="model == 'bind_success'">
            <img src="../../assets/login/bind.png" alt="" width="150">
            <h1>绑定成功</h1>
        </div>
        <div class="login" v-if="model == 'login_success'">
            <img src="../../assets/logo.png" alt="" width="150">
            <h1>登录成功</h1>
        </div>
    </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
    data() {
        return {
            model: 'login',
            username: "",
            socket: ""
        };
    },
    created() {
        if (this.$route.query && this.$route.query.username) {
            this.username = this.$route.query.username
            this.model = 'bind'
        } else {
            this.username = window.localStorage.getItem('username')
            this.room = this.$route.query.room
            if (this.username) {
                this.initSocket()
            }

        }
    },
    methods: {
        ...mapActions(["Login"]),
        BindUsername() {
            window.localStorage.setItem('username', this.username)
            this.model = 'bind_success'
        },
        initSocket() {
            // let prefix = window.location.host
            // let prefix = getIpAddress() + ":8888"
            this.socket = new WebSocket(`${this.wssaddress}/api/chat/v1/auth/login_code?room=${this.room}&name=user`)
            this.socket.onopen = () => {
                this.socket.send(JSON.stringify({
                    "operation": "connect",
                }))
            };
            this.socket.onmessage = (message) => {
                let data = JSON.parse(message.data)
                if (data.operation == 'success') {
                    this.model = 'login_success'
                    this.socket.close()
                } else {
                    this.$message.error(data.error)

                }
            }
            this.socket.onclose = () => {
                if (this.model != 'login_success') {
                    this.username = ''
                }
            }
        },
        ToLogin() {
            this.socket.send(JSON.stringify({
                "operation": "login",
                "username": this.username
            }))
        }
    },
}
</script>

<style lang="scss" scoped>
.container {
    height: 100vh;
    width: 100%;
    overflow: hidden;

    .bind {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .login {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

}

.btn {
    margin: 2vh 0;
    width: 300px;
    height: 50px;
    color: white;
    border: none;
    border-radius: 10px;
    background-color: #05bafb;
}
</style>