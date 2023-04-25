<template>
    <div class="register-container" :style="sty">

        <div class="form">
            <div class="form-user">
                <img src="../../assets/login/user.png" alt="" width="20px" class="form-icon">
                <input type="text" placeholder="用户名" v-model="formData.username" oninput="value=value.replace(/[^0-9a-zA-Z]/g,'')">
            </div>
            <div class="form-password">
                <img src="../../assets/login/lock.png" alt="" width="20px" class="form-icon">
                <input type="password" placeholder="密码" v-model="formData.password" oninput="value=value.replace(/[^0-9a-zA-Z]/g,'')">
            </div>
            <div class="form-code">
                <input type="text" placeholder="验证码" v-model="formData.code" @keydown.enter="submitForm">
                <div class="code">
                    <vue-image @getIdentifyCode="getIdentifyCodes" />

                </div>
            </div>
            <button class="form-button" @click="submitForm">
                <span class="form-btn-text"> 注册</span>
            </button>

        </div>
        <div class="footer">
            <div @click="toLogin" style="cursor: pointer;">登录账号</div>

        </div>
    </div>
</template>

<script>
import vueImage from '@/components/vueImageVerify';
import { UserRegister, } from "@/api/auth.js";
import { mapActions } from "vuex";
export default {
    components: {
        vueImage
    },
    data() {
        return {
            autoLogin: false,
            rememberPassword: false,
            identifyCode: "",
            sty: "",
            formData: {
                username: "",
                password: "",
                code: ""
            }
        }
    },
    methods: {
        ...mapActions(["Login"]),
        submitForm() {
            if (!(this.formData.username && this.formData.password && this.formData.code)) {
                return this.$message.warning("请填写完整信息!!")
            }
            if (this.formData.code != this.identifyCode) {
                return this.$message.warning("验证码错误!!")
            }
            const loading = this.$loading({
                lock: true,
                text: 'Loading.....',
                spinner: 'el-icon-loading',
                background: 'rgba(0, 0, 0, 0.7)'
            });
            UserRegister(this.formData)
                .then((res) => {
                    if (res.code == 200) {
                        this.Login(res.data);
                        this.$message.success("注册成功");
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
                    loading.close()
                })
        },
        toLogin() {
            this.sty = 'transform: translateX(-100vw);opacity: 0;'
            setTimeout(() => {
                this.sty = ''
                this.$emit('toLink', "login")
            }, 1000);
        },
        getIdentifyCodes(identifyCode) {
            this.identifyCode = identifyCode
        }
    },
}
</script>

<style lang="scss" scoped>
.register-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100vw;
    transition: all 1s ease;
    position: relative;

    .form {
        position: relative;
        margin-top: 20px;
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

        .form-code {
            position: relative;

            .code {
                position: absolute;
                right: 0px;
                top: 0;
            }

            input {
                width: 200px;
                border: 0px;
                padding: 5px 0;
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
            margin-top: 10px;
            width: 200px;
            height: 30px;
            border: 0;
            border-radius: 5px;
            font-size: 12px;
            box-shadow: inset 0 0px 2px rgba(0, 0, 0, 0.3);
            transition: box-shadow 0.2s ease-in-out;

            &:active {
                box-shadow: inset 0 2px 2px rgba(0, 0, 0, 0.3);
            }
        }

    }

    .footer {
        position: absolute;
        left: 5px;
        bottom: -20px;
        box-sizing: border-box;
        padding: 0 5px;
        font-size: 10px;
        color: #cacaca;
    }
}
</style>