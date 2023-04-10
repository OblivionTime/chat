const fs = require('fs');
/**
 * 随机生成房间号
 */
function generateRandomString(length) {
    let result = '';
    const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
/**
 * 判断指定目录是否存在,不存在则创建
 */
function notExitCreate(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir,{ recursive: true });
    }
}

//判断指定路径是否存在,不存在则创建
module.exports = {
    generateRandomString,
    notExitCreate
};