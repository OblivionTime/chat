
import request from '@/utils/request'
//好友列表
export function getMessageList(params) {
    return request({
        url: '/message/list',
        method: 'get',
        params
    })
}