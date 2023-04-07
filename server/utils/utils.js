const fs = require('fs');
function generateRandomString(length) {
    let result = '';
    const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

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