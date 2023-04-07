// 返回码


exports.RespTokenErr = 4000
exports.RespUserOrPassErr = 4001
exports.RespParamErr = 4002
exports.RespUserExitErr = 4003
exports.RespUserNotExitErr = 4004
exports.RespUpdateErr = 4005
exports.RespExitFriendErr = 4006
exports.RespCreateErr = 4007
exports.RespExitGroupErr = 4008
exports.RespServerErr = 5000

exports.RespMap = {
    4000: "客户端TOKEN错误",
    4001: "用户名或密码错误",
    4002: "参数有误",
    4003: "用户名已存在",
    4004: "用户名与手机号不匹配",
    4005: "修改失败",
    4006: "好友已存在",
    4007: "创建失败",
    4008: "你已加入群聊",
    5000: "服务有误",
}
