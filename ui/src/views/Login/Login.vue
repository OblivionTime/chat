<template>
    <div class="login-container" :style="sty">
        <div class="avatar">
            <img :src="require('@/assets/sidebar/avatar.jpg')" alt="" width="55" height="55"
                style="object-fit: cover;object-position: center;">
        </div>
        <div class="form">
            <div class="form-user">
                <img src="../../assets/login/user.png" alt="" width="20px" class="form-icon">
                <input type="text" placeholder="用户名" v-model="formData.username" oninput="value=value.replace(/[^0-9a-zA-Z]/g,'')">
            </div>
            <div class="form-password">
                <img src="../../assets/login/lock.png" alt="" width="20px" class="form-icon">
                <input type="password" placeholder="密码" v-model="formData.password" @keydown.enter="submitForm" oninput="value=value.replace(/[^0-9a-zA-Z]/g,'')">
            </div>
            <div class="form-options">
                <div class="form-checkbox">
                    <input type="checkbox" name="autoLogin" v-model="autoLogin" style="margin-right: 5px;  cursor: pointer;"
                        @change="autoLoginChange">
                    <label for="autoLogin" @click="autoLogin = !autoLogin, autoLoginChange()">自动登录</label>
                </div>
                <div class="form-checkbox">
                    <input type="checkbox" name="rememberPassword" v-model="rememberPassword"
                        style="margin-right: 5px;  cursor: pointer;" @change="rememberPasswordChange">
                    <label for="autoLogin"
                        @click="rememberPassword = !rememberPassword, rememberPasswordChange()">记住密码</label>
                </div>
                <span class="forget-password" @click="toForgetPassword">找回密码</span>

            </div>
            <button class="form-button" @click="submitForm">
                <span class="form-btn-text"> 登录</span>
            </button>

        </div>
        <div class="footer">
            <div @click="toRegister" style="cursor: pointer;">注册账号</div>
            <!-- <el-tooltip class="item" effect="dark" content="扫码登录" placement="top-start">
                <img src="../../assets/login/code.png" alt="" width="25" style="cursor: pointer;" @click="toLoginCode">
            </el-tooltip> -->
        </div>
    </div>
</template>

<script>
import { UserLogin, } from "@/api/auth.js";
import { mapActions } from "vuex";
export default {
    data() {
        return {
            autoLogin: false,
            rememberPassword: false,
            sty: "",
            formData: {
                username: "",
                password: ""
            }

        }
    },
    created() {
        this.formData = {
            username: window.localStorage.getItem("last_username"),
            password: window.localStorage.getItem("last_password"),
        }
        this.rememberPassword = window.localStorage.getItem("remember_password") == 'true'
        this.autoLogin = window.localStorage.getItem("auto_login") == 'true'
        if (this.autoLogin) {
            this.submitForm()
        }
    },
    methods: {
        ...mapActions(["Login"]),
        submitForm() {
            if (!(this.formData.username && this.formData.password)) {
                return this.$message.warning("请填写完整信息!!")
            }
            const loading = this.$loading({
                lock: true,
                text: 'Loading.....',
                spinner: 'el-icon-loading',
                background: 'rgba(0, 0, 0, 0.7)'
            });
            UserLogin(this.formData)
                .then((res) => {
                    if (res.code == 200) {
                        this.Login(res.data);
                        this.$message.success("登录成功");
                        if (this.rememberPassword) {
                            window.localStorage.setItem("last_password", this.formData.password)
                        } else {
                            window.localStorage.setItem("last_password", "")
                        }
                        this.$router.push("/");
                    } else {
                        this.$message.error(res.message);

                        this.formData.password = ""
                    }
                })
                .catch((err) => {
                    console.log(err);
                })
                .finally(() => {
                    window.localStorage.setItem("last_username", this.formData.username)
                    loading.close()
                })

        },
        /**
         * 自动登录状态修改
         */
        autoLoginChange() {
            if (this.autoLogin) {
                this.rememberPassword = true
            }
            window.localStorage.setItem("auto_login", this.autoLogin)
        },
        rememberPasswordChange() {
            window.localStorage.setItem("remember_password", this.rememberPassword)

        },
        toRegister() {
            this.sty = 'transform: translateX(-100vw);opacity: 0;'
            setTimeout(() => {
                this.$emit('toLink', "register")

            }, 1000);
        },
        toForgetPassword() {
            this.sty = 'transform: translateX(-100vw);opacity: 0;'
            setTimeout(() => {
                this.$emit('toLink', "forgetPassword")
            }, 1000);
        },
        toLoginCode() {
            this.$router.push('/login_code')
        },
    },
}
</script>

<style lang="scss" scoped>
.login-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    transition: all 1s ease-in;
    opacity: 1;
    position: relative;

    .avatar {
        position: absolute;
        overflow: hidden;
        border-radius: 50%;
        width: 55px;
        height: 55px;
        top: -35px;
        z-index: 999;
        // margin-top: -35px;
        // margin-bottom: 10px;

    }

    .form {
        position: relative;
        margin-top: 35px;
        z-index: 10;

        .form-user,
        .form-password {
            position: relative;

            .form-icon {
                position: absolute;
                top: 4px;
            }

            input {
                width: 200px;
                border: 0px;
                padding: 5px 0 5px 25px;
                box-sizing: border-box;
                border-bottom: 1px solid #eee;
                font-size: 16px;
                outline: none;
                margin-bottom: 5px;

                &:focus {
                    border-bottom-color: #5ccdf8;
                }
            }
        }

        .form-options {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 10px;
            color: #cacaca;

            .form-checkbox {

                display: flex;
                align-items: center;

                label {
                    cursor: pointer;
                }
            }

            .forget-password {
                cursor: pointer;
                width: 50px;

                &:hover {
                    color: #c0c0c0;
                }
            }

        }

        .form-button {
            cursor: pointer;
            color: white;
            background-color: #05bbfb;
            margin-top: 15px;
            width: 200px;
            height: 30px;
            border: 0;
            border-radius: 5px;
            font-size: 12px;
            box-shadow: inset 0 0px 2px rgba(0, 0, 0, 0.3);
            transition: box-shadow 0.2s ease-in-out;
            z-index: 10;

            &:active {
                box-shadow: inset 0 2px 2px rgba(0, 0, 0, 0.3);
            }
        }

    }

    .footer {
        width: 100%;
        position: absolute;
        left: 0px;
        bottom: -20px;
        box-sizing: border-box;
        padding: 0 5px;
        font-size: 10px;
        color: #cacaca;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;


    }
}
</style>