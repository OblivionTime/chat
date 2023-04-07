const db = require("./db.js")
function Query(sql, info) {
    return new Promise((resolve, reject) => {
        db.query(sql, info, async (err, results) => {
            resolve({ err, results })
        })
    })
}
module.exports = {
    Query
}