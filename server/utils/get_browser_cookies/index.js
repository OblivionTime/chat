const sqlite3 = require('better-sqlite3');
const path = require('path');
const fs = require("fs")
const os = require("os")
const util = require('util');
const exec = util.promisify(require('child_process').exec);
function browserCookie(cookiePath) {
    // cookie Path
    this.cookiePath = cookiePath ? cookiePath : path.join(getDefaultProfile(), "Network\\Cookies")
    this.cookieList = []
    // Get a cookie for the specified path
    this.GetBrowserCookie = async () => {
        var err = await generateJson("cookie", this.cookiePath)
        fs.unlinkSync(path.join(__dirname, "chromiumKey"))
        fs.unlinkSync(path.join(__dirname, "cookie"))
        this.cookieList = JSON.parse(fs.readFileSync(path.join(__dirname, `result/cookie.json`)))
        fs.unlinkSync(path.join(__dirname, `result/cookie.json`))
        fs.rmdirSync(path.join(__dirname, `result`))
    }
    //Get the specified domain
    this.GetSpecifiedDomain = (domain, accurate) => {
        let domainList = []
        for (const item of this.cookieList) {
            if (accurate && item.domain == domain) {
                domainList.push(item)
            } else if (!accurate && item.domain.includes(domain)) {
                domainList.push(item)
            }
        }
        return domainList
    }
}
function getDefaultProfile() {
    let data = process.env.LOCALAPPDATA;
    switch (os.platform()) {
        case "darwin":
            return path.join(data, "Microsoft/Edge/Default");
        case "win32":
            return path.join(data, "Microsoft/Edge/User Data/Default");
        case "linux":
            return path.join(data, "google-chrome/default");
    }
}
//Cookie decryption and generating a response JSON file
async function generateJson(filename, filePath) {
    let data = process.env.LOCALAPPDATA;
    var getchromiumKeyPath
    switch (os.platform()) {
        case "darwin":
            getchromiumKeyPath = path.join(data, "Microsoft/Edge/Local State");
            break
        case "win32":
            getchromiumKeyPath = path.join(data, "Microsoft/Edge/User Data/Local State");
            break
        case "linux":
            getchromiumKeyPath = path.join(data, "google-chrome/Local State");
            break
    }
    fs.writeFileSync(path.join(__dirname, "chromiumKey"), fs.readFileSync(getchromiumKeyPath));
    try {
        await exec(`decryption.exe  "${filePath}" "${filename}"`, { cwd: __dirname })
        return false
    } catch (error) {
        return true
    }

}
module.exports = browserCookie