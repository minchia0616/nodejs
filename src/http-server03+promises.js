const http = require("http");
const fs = require("fs/promises");

const server = http.createServer(async (req, res) => {
    res.writeHead(200, {
        "Content-Type": "text/html; charset=utf8",
    });

    try {
        await fs.writeFile(
            __dirname + "/../data/header01.txt",    // 寫入哪個檔(路徑)
            JSON.stringify(req.headers)             // 檔案的內容
        );
        res.end("完成寫檔3");
    } catch (ex) {
        console.log(ex);
        res.end("發生錯誤3");
    }
});

server.listen(3000);
// https://ithelp.ithome.com.tw/articles/10185422