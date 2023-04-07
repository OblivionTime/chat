
import request from '@/utils/request'
//好友列表
export function getGroup_list(params) {
    return request({
        url: '/group/list',
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