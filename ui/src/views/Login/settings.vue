<template>
    <div class="login-container" :style="sty">

        <div class="form">
            <h4 style="margin-bottom: 20px;">后端服务器地址:</h4>
            <div class="form-user">
                <img src="../../assets/login/server.png" alt="" width="20px" class="form-icon">
                <input type="text" placeholder="服务器地址" v-model="ipaddress">
            </div>
            <div class="form-user">
                <img src="../../assets/login/server.png" alt="" width="20px" class="form-icon">
                <input type="text" placeholder="代理地址" v-model="proxyaddress">
            </div>

            <button class="form-button" @click="submitForm">
                <span class="form-btn-text"> 保存</span>
            </button>

        </div>
        <div class="footer">
            <div @click="toLogin" style="cursor: pointer;">登录账号</div>

        </div>
    </div>
</template>

<script>
import { UserUpdatePassword, } from "@/api/auth.js";
import { mapActions } from "vuex";
import { validURL } from '@/utils/validate';
export default {
    data() {
        return {
            sty: "",
        }
    },
    methods: {
        ...mapActions(["updateAddress"]),
        submitForm() {
            if (!this.ipaddress) {
                return this.$message.warning("请输入服务器地址!!!")
            }
            if (!validURL(this.ipaddress)) {
                return this.$message.error("服务器格式错误!!")
            }
            if (this.proxyaddress && !validURL(this.proxyaddress)) {
                return this.$message.error("代理服务器格式错误!!")
            }
            this.updateAddress({ ipaddress: this.ipaddress, proxyaddress: this.proxyaddress })
            this.$message.success("保存成功")
            setTimeout(() => {
                location.reload()
            }, 500);
        },
        toLogin() {
            this.sty = 'transform: translateX(-100vw);opacity: 0;'
            setTimeout(() => {
                this.sty = ''
                this.$emit('toLink', "login")
            }, 1000);
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
    transition: all 1s ease;
    position: relative;
    height: 161px;

    .form {
        position: relative;
        margin-top: 20px;

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
                font-size: 14px;
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