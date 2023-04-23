var express = require('express');
const router = express.Router();
const group = require("../../container/group/index")
const jwt = require('jsonwebtoken');
const secretKey = 'xWbiNA3FqnK77MnVCj5CAcfA-VlXj7xoQLd1QaAme6l_t0Yp1TdHbSw';
let { RespTokenErr } = require('../../model/error');
const multer = require('multer');
const upload = multer({ dest: 'uploads/group' });
// JWT 校验中间件
function authenticateToken(req, res, next) {
    // 获取 JWT 字符串
    const token = req.headers.authorization;
    if (!token) {
        // 如果没有 JWT，则返回 401 Unauthorized
        return RespError(res, RespTokenErr)
    }

    // 验证 JWT
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            // JWT 验证失败，则返回 401 Unauthorized
            console.error(err);
            return RespError(res, RespTokenErr)
        } else {
            // JWT 验证成功，将 JWT 中的信息存储在请求对象中，并调用 next() 继续处理请求
            req.user = decoded;
            next();
        }
    });
}
module.exports = function () {
    //群聊列表
    router.get('/list', authenticateToken, group.List)
    //获取群聊中所有群员
    router.get('/members_list', authenticateToken, group.MembersList)
    //创建群聊
    router.post('/create_group', authenticateToken, upload.single('avatar'), group.CreateGroupChat)
    //搜索群聊
    router.get('/search', authenticateToken, group.SearchGroupChat)
    //加入群聊
    router.get('/join', authenticateToken, group.JoinGroupChat)
    //群聊信息
    router.get('/info', authenticateToken, group.GroupInfo)
    //重命名
    router.post('/rename', authenticateToken, group.RenameGroup)
    //邀请群聊
    router.post('/invitation', authenticateToken, group.invitedUsersToGroup)
    //退出群聊
    router.post('/exitGroupChat', authenticateToken, group.DeleteUserFromGroup)
    //获取音视频房间的所有用户
    router.get('/getRTCUser', authenticateToken, group.GetRTCUser)
    return router
}