//文件大小转换
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + sizes[i];
}
//时间转换
function formatDate(timestamp) {
    const utcDate = new Date(timestamp);
    return utcDate.toLocaleDateString("zh-CN", { timeZone: "Asia/Shanghai", dateStyle: "full", timeStyle: "medium",hourCycle:"h24" });
}
module.exports = {
    formatBytes,
    formatDate
};
