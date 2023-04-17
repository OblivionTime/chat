
import request from '@/utils/request'
//好友列表
export function getFriend_list(params) {
    return request({
        url: '/friend/list',
        method: 'get',
        params
    })
}
//添加好友
export function postAdd_friend(data) {
    return request({
        url: '/friend/add_friend',
        method: 'post',
        data
    })
}
//搜索好友
export function getSearch(params) {
    return request({
        url: '/friend/search',
        method: 'get',
        params
    })
}
//获取好友信息
export function getFriend_info(params) {
    return request({
        url: '/friend/info',
        method: 'get',
        params
    })
}
export function getFriendGroup_list(params) {
    return request({
        url: '/friend/group_list',
        method: 'get',
        params
    })
}
export function postCreate(data) {
    return request({
        url: '/friend/create',
        method: 'post',
        data
    })
}
export function postUpdate(data) {
    return request({
        url: '/friend/update',
        method: 'post',
        data
    })
}
export function postUpdate_friend(data) {
    return request({
        url: '/friend/update_friend',
        method: 'post',
        data
    })
}