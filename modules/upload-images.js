const multer = require('multer');
const { v4: uuidv4} = require('uuid');

// 建立副檔名對應的物件
const extMap = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
};

// 過濾，要的檔案為true，不要的為false
// 把extMap[file.mimetype]轉換成布林值
function fileFilter(req, file, cb) {
    cb(null, !!extMap[file.mimetype]);
}

// 存檔的位置
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, __dirname + "/../public/imgs");
    },
    filename: function (req, file, cb) {
        const filename = uuidv4() + extMap[file.mimetype];  // 完整的檔名
        cb(null, filename);
    },
});

module.exports = multer({fileFilter, storage});             // 匯出