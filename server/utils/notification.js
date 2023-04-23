/*
 * @Description: 
 * @Version: 1.0
 * @Autor: solid
 * @Date: 2023-04-14 17:16:36
 * @LastEditors: solid
 * @LastEditTime: 2023-04-23 17:06:29
 */

//通知对方
async function NotificationUser(data) {
    //接收者
    let receiver_username = data.receiver_username
    if (!receiver_username) {
        const sql = "SELECT username FROM user where id=?"
        let { results } = await Query(sql, [data.receiver_id])
        receiver_username = results[0].username
    }
    if (LoginRooms[receiver_username]) {
        LoginRooms[receiver_username].ws.send(JSON.stringify(data))
    }
}
module.exports = {
    NotificationUser,
};