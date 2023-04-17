
//通知对方
async function NotificationUser(data) {
    //接收者
    let receiver_username = data.receiver_username
    if (!receiver_username) {
        const sql = "SELECT username FROM user where id=?"
        let { results } = await Query(sql, [data.receiver_id])
        receiver_username = results[0].username
    }
    console.log("NotificationUser",data);
    if (LoginRooms[receiver_username]) {
        LoginRooms[receiver_username].send(JSON.stringify(data))
    }
}
module.exports = {
    NotificationUser,
};