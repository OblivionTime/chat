const os = require('os');
exports.getIpAddress = () => {
    // 获取当前计算机的网络接口列表
    const interfaces = os.networkInterfaces();
    let ipaddress = '127.0.0.1'
    let iface = interfaces['WLAN']
    iface.forEach(iface => {
        // 跳过非IPv4地址和本地地址
        if ('IPv4' !== iface.family || iface.internal !== false) {
            return;
        }
        ipaddress = iface.address
    })
    return ipaddress
}
