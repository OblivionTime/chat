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
        <div class="content">
            <S_Login v-if="status == 'login'" @toLink="toLink"></S_Login>
            <S_Register v-if="status == 'register'"  @toLink="toLink"></S_Register>
            <S_forgetPassword v-if="status == 'forgetPassword'"  @toLink="toLink"></S_forgetPassword>
        </div>
    </div>
</template>

<script>
const remote = window.require('electron').remote;
const win = remote.getCurrentWindow();
import S_Login from './Login.vue';
import S_Register from './Register.vue';
import S_forgetPassword from './forgetPassword.vue';

export default {
    name: "Login",
    components: {
        S_Login,
        S_Register,
        S_forgetPassword,
    },
    data() {
        return {
            status: "login"

        }
    },
    methods: {
        minWindow() {
            win.minimize();
        },
        closeWindow() {
            win.close()
        },
        toLink(path) {
            this.status = path
        },

    },
}
</script>

<style lang="scss" scoped>
.container {
    .header {
        width: 100%;
        height: 40vh;
        color: white;
        background: linear-gradient(135deg, #17ead9, #6078ea);
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

    .content {
    }
}
</style>