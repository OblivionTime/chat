export const getFileSuffix = (path) => {
    let url = path.split("?")[1];
    let params = new URLSearchParams(url);
    let filename = params.get("filename");
    let fileSuffix = filename
        .substring(filename.lastIndexOf(".") + 1)
        .toLowerCase();
    switch (fileSuffix) {
        case "avi":
        case "mpeg":
        case "wmv":
        case "mov":
        case "flv":
        case "mp4":
            return "video";
        case "png":
        case "jpeg":
        case "jpg":
        case "gif":
        case "webp":
        case "svg":
            return "image";
        default:
            return fileSuffix;
    }
}
export const getFileSuffix2 = (filename) => {
    let fileSuffix = filename
        .substring(filename.lastIndexOf(".") + 1)
        .toLowerCase();
    switch (fileSuffix) {
        case "avi":
        case "mpeg":
        case "wmv":
        case "mov":
        case "flv":
        case "mp4":
            return "video";
        case "png":
        case "jpeg":
        case "jpg":
        case "gif":
        case "webp":
        case "svg":
            return "image";
        default:
            return "file";
    }
}
//获取文件图标
export const getFileIcons = (path) => {
    let fileSuffix = path
        .substring(path.lastIndexOf(".") + 1)
        .toLowerCase();
    switch (fileSuffix) {
        case "docx":
        case "doc":
            return require("@/assets/chat/word.png");
        case "xls":
        case "xlsx":
            return require("@/assets/chat/excel.png");
        case "ppt":
        case "pptx":
            return require("@/assets/chat/ppt.png");
        case "pdf":
            return require("@/assets/chat/pdf.png");
        case "apk":
            return require("@/assets/chat/apk.png");
        case "exe":
            return require("@/assets/chat/exe.png");
        case "rar":
        case "zip":
        case "gz":
        case "tar":
        case "7z":
            return require("@/assets/chat/zip.png");
        case "avi":
        case "mpeg":
        case "wmv":
        case "mov":
        case "flv":
        case "mp4":
            return require("@/assets/chat/mp4.png");
        default:
            return require("@/assets/chat/txt.png");
    }
}
//获取文件名
export const getFileName = (path) => {
    const fileName = path.split('/').pop();
    return fileName;
}