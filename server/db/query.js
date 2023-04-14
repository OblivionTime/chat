const db = require("./db.js")
function Query(sql, info) {
    return new Promise((resolve, reject) => {
        db.query(sql, info, async (err, results) => {
            if (err) {
                console.log(err);
            }
            resolve({ err, results })
        })
    })
}
module.exports = {
    Query
}