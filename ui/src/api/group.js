
import request from '@/utils/request'
//群聊列表
export function getGroup_list(params) {
    return request({
        url: '/group/list',
        method: 'get',
        params
    })
}
//群员列表
export function getGroup_Members_list(params) {
    return request({
        url: '/group/members_list',
        method: 'get',
        params
    })
}
//添加分组
export function postCreate_group(data) {
    return request({
        url: '/group/create_group',
        method: 'post',
        data,
        headers: { "Content-Type": "multipart/form-data;" },
    })
}
//查询
export function getGroupSearch(params) {
    return request({
        url: '/group/search',
        method: 'get',
        params
    })
}
//加入
export function getJoin(params) {
    return request({
        url: '/group/join',
        method: 'get',
        params
    })
}
//获取群聊详情
export function getGroupInfo(params) {
    return request({
        url: '/group/info',
        method: 'get',
        params
    })
}
//邀请群聊
export function postRenameGroup(data) {
    return request({
        url: '/group/rename',
        method: 'post',
        data,
    })
}
//邀请群聊
export function postGroupInvitation(data) {
    return request({
        url: '/group/invitation',
        method: 'post',
        data,
    })
}
//退出群聊
export function postExitGroupChat(data) {
    return request({
        url: '/group/exitGroupChat',
        method: 'post',
        data,
    })
}
//获取音视频所有用户
export function GetRTCUser(params) {
    return request({
        url: '/group/getRTCUser',
        method: 'get',
        params
    })
}