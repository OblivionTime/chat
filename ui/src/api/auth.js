import request from '@/utils/request'
//登录
export function UserLogin(data) {
    return request({
        url: 'auth/login',
        method: 'post',
        data
    })
}
//注册
export function UserRegister(data) {
    return request({
        url: 'auth/register',
        method: 'post',
        data
    })
}
//修改密码
export function UserUpdatePassword(data) {
    return request({
        url: 'auth/forget_password',
        method: 'post',
        data
    })
}
//修改个人信息
export function UserUpdateInfo(data) {
    return request({
        url: 'auth/updateInfo',
        method: 'post',
        data,
        headers: { "Content-Type": "multipart/form-data;" },
    })
}