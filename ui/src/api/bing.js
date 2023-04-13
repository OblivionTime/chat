import request from '@/utils/request'
//生成
export function generateConversation(params) {
    return request({
        url: '/bing/generate_conversation',
        method: 'get',
        params
    })
}
//获取
export function getConversationInfo(params) {
    return request({
        url: '/bing/info',
        method: 'get',
        params
    })
}