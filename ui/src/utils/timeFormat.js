import dayjs from "dayjs";
export const toggleTime = (date) => {
    var time;
    var type = getDateDiff(date);
    //1：新消息，2：当天消息,3：昨天消息，4：今年消息，5：其他消息
    if (type == 1) {
        time = "刚刚"; //新消息，不显示时间，但是要显示"以下为最新消息"
    } else if (type == 2) {
        time = dayjs(date).format("H:mm"); //当天消息，显示：10:22
    } else if (type == 3) {
        time = dayjs(date).format("昨天 H:mm"); //昨天消息，显示：昨天 20:41
    } else if (type == 4) {
        time = dayjs(date)
            .format("M月D日 AH:mm")
            .replace("AM", "上午")
            .replace("PM", "下午"); //今年消息，上午下午，显示：3月17日 下午16:45
    } else if (type == 5) {
        time = dayjs(date)
            .format("YYYY年M月D日 AH:mm")
            .replace("AM", "上午")
            .replace("PM", "下午"); //其他消息，上午下午，显示：2020年11月2日 下午15:17
    }
    return time;
}
export const toggleTime2 = (date) => {
    var time;
    var type = getDateDiff(date);
    //1：新消息，2：当天消息,3：昨天消息，4：今年消息，5：其他消息
    if (type == 1) {
        time = "刚刚"; //新消息，不显示时间，但是要显示"以下为最新消息"
    } else if (type == 2) {
        time = dayjs(date).format("H:mm"); //当天消息，显示：10:22
    } else if (type == 3) {
        time = dayjs(date).format("昨天"); //昨天消息，显示：昨天 20:41
    } else if (type == 4) {
        time = dayjs(date)
            .format("M月D日")
    } else if (type == 5) {
        time = dayjs(date)
            .format("YYYY年M月D日")
    }
    return time;
}
//判断消息类型
const getDateDiff = (date) => {
    var nowDate = dayjs(new Date()); //当前时间
    var oldDate = dayjs(new Date(date)); //参数时间
    var result;
    if (nowDate.year() - oldDate.year() >= 1) {
        result = 5;
    } else if (
        nowDate.month() - oldDate.month() >= 1 ||
        nowDate.date() - oldDate.date() >= 2
    ) {
        result = 4;
    } else if (nowDate.date() - oldDate.date() >= 1) {
        result = 3;
    } else if (
        nowDate.hour() - oldDate.hour() >= 1 ||
        nowDate.minute() - oldDate.minute() >= 5
    ) {
        result = 2;
    } else {
        result = 1;
    }
    return result;
}
