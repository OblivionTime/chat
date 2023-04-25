<template>
    <div>
        <el-dialog title="设置" :visible.sync="showSettingsDialog" width="600px">
            <el-tabs type="border-card" stretch>
                <el-tab-pane label="基本配置">
                    <div class="basic-configuration">
                        <div class="basic-configuration-title">
                            服务器地址
                        </div>
                        <div class="basic-configuration-nav">
                            <img src="../assets/login/server.png" alt="" width="20px" class="form-icon">
                            <input type="text" placeholder="服务器地址" v-model="ipaddress">
                        </div>
                        <div class="basic-configuration-title">
                            代理地址
                        </div>
                        <div class="basic-configuration-nav">
                            <img src="../assets/login/network.png" alt="" width="20px" class="form-icon">
                            <input type="text" placeholder="服务器地址" v-model="proxyaddress" >
                        </div>
                        <div style="text-align: center;margin-top: 20px;">
                            <el-button style="width: 45%;" @click="showSettingsDialog = false">取消</el-button>
                            <el-button type="primary" style="width: 45%;" @click="SaveBasic">保存配置</el-button>
                        </div>
                    </div>
                </el-tab-pane>
                <el-tab-pane label="New Bing">
                    <div class="bing-configuration">
                        <div class="bing-configuration-title">
                            生成聊天次数
                        </div>
                        <div class="bing-configuration-nav">
                            <el-button type="primary" style="" @click="toGenerateConversation">一键生成</el-button>
                        </div>
                        <div class="bing-configuration-title">
                            已使用/总数
                        </div>
                        <div class="bing-configuration-nav">
                            <span :style="total == us_count ? 'color:red' : ''">{{ us_count }}/{{ total }}</span>
                        </div>
                        <div class="bing-configuration-title">
                            new bing
                        </div>
                        <div class="bing-configuration-nav">
                            <el-button type="primary" @click="openBing">打开网站</el-button>
                        </div>
                    </div>
                </el-tab-pane>
            </el-tabs>
        </el-dialog>
    </div>
</template>

<script>
import { mapActions } from "vuex";
import { generateConversation, getConversationInfo } from '@/api/bing';
const { shell } = window.require('electron');
import { validURL } from '@/utils/validate';
export default {
    name: "settings",
    data() {
        return {
            showSettingsDialog: false,
            //总数
            total: 0,
            us_count: 0,
            room: "",
            conversation_id: "",
            conversation_signature: "",
        };
    },
    methods: {
        ...mapActions(["updateAddress"]),
        //打开弹窗
        openDialog() {
            this.showSettingsDialog = true;
            this.loadData()
        },
        //加载数据
        loadData() {
            getConversationInfo()
                .then((res) => {
                    if (res.code == 200) {
                        this.total = res.data.total
                        this.us_count = res.data.us_count
                        this.room = res.data.room
                        this.conversation_id = res.data.conversation_id
                        this.conversation_signature = res.data.conversation_signature
                        if (this.total != 0) {
                            this.$emit('getBingInfo', { ...res.data });
                        }
                    }
                })
        },
        //保存基本配置
        SaveBasic() {
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
        //生成密钥
        toGenerateConversation() {
            if (!this.proxyaddress) {
                return this.$message.warning("未检出到代理服务器地址,请填写后在生成")
            }
            const loading = this.$loading({
                lock: true,
                text: 'Loading',
                spinner: 'el-icon-loading',
                background: 'rgba(0, 0, 0, 0.7)'
            });
            generateConversation({ proxy: this.proxyaddress })
                .then((res) => {
                    if (res.code == 200) {
                        this.$message.success("生成成功!!!")
                        this.loadData();
                    } else {
                        this.$message.error(res.message)
                    }
                })
                .finally(() => {
                    loading.close()
                })
        },
        //打开bing网站
        openBing() {
            shell.openExternal("https://www.bing.com/");
        },
    },
}
</script>

<style lang="scss" scoped>
.basic-configuration {
    padding: 20px;

    .basic-configuration-title {
        color: #9e9e9e;
        // font-size: 1px;
        margin: 10px 0;

    }

    .basic-configuration-nav {
        position: relative;
        margin: 10px 0;

        .form-icon {
            position: absolute;
            top: 10px;
            left: 5px;
        }

        input {
            width: 300px;
            border: 1px solid #eee;
            padding: 10px 0 10px 30px;
            box-sizing: border-box;
            border-bottom: 1px solid #eee;
            font-size: 14px;
            outline: none;
            border-radius: 5px;
            margin-bottom: 5px;

            &:focus {
                border-color: #5ccdf8;
            }
        }
    }

}

.bing-configuration {
    padding: 20px;

    .bing-configuration-title {
        color: #9e9e9e;
        font-size: 14px;
        margin: 15px 0;

    }
}
</style>