const fs = require('fs');
const { CookieJar, Cookie } = require('tough-cookie')
const request = require('request');
const browserCookie = require('./get_browser_cookies');
let HEADERS = {
    authority: 'https://www.bing.com',
    accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'accept-language': 'en-US,en;q=0.9',
    'cache-control': 'max-age=0',
    'sec-ch-ua':
        '"Chromium";v="110", "Not A(Brand";v="24", "Microsoft Edge";v="110"',
    'sec-ch-ua-arch': '"x86"',
    'sec-ch-ua-bitness': '"64"',
    'sec-ch-ua-full-version': '"112.0.1722.34"',
    'sec-ch-ua-full-version-list':
        '"Chromium";v="110.0.5481.192", "Not A(Brand";v="24.0.0.0", "Microsoft Edge";v="110.0.1587.69"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-model': '""',
    'sec-ch-ua-platform': '"Windows"',
    'sec-ch-ua-platform-version': '"15.0.0"',
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'none',
    'sec-fetch-user': '?1',
    'upgrade-insecure-requests': '1',
    'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36 Edg/110.0.1587.69',
    'x-edge-shopping-flag': '1',
};

async function getConversation(proxy) {
    const cookieJar = new CookieJar();
    let cookie = new browserCookie()
    await cookie.GetBrowserCookie()
    let res = cookie.GetSpecifiedDomain("bing.com", false)
    for (const { name, value, domain } of res) {
        cookieJar.setCookieSync(
            new Cookie({ key: name, value }),
            'https://bing.com',
        );
    }
    HEADERS.cookie = cookieJar.getCookieStringSync('https://bing.com')
    const options = {
        url: 'https://www.bing.com/turing/conversation/create',
        headers: HEADERS,
        proxy: proxy

    }
    let resp = await sendRequest(options)
    return resp
}

function sendRequest(options) {
    return new Promise(function (resolve, reject) {
        request.get(options, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                let result = JSON.parse(body)
                if (result.result.value != 'Success') {
                    resolve({ code: 4009, message: "请在edge浏览器中登录new bing" })
                } else {
                    resolve({ code: 200, message: "success", data: { clientId: result.clientId, conversationId: result.conversationId, conversationSignature: result.conversationSignature } })
                }
            } else {
                resolve({ code: 4010, message: "无法找到代理服务器,请设置正确的代理服务器" })
            }
        });
    })

}

exports.getConversation = getConversation