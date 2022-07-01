const express = require('express');

const db = require(__dirname + '/../modules/mysql-connect');

const {
    toDateString,
    toDatetimeString,
} = require(__dirname + '/../modules/date-tools');

const router = express.Router();

router.get('/', async(req, res)=>{

    let output = {
        perPage: 2,
        page: 1,
        totalRows: 0,
        totalPages: 0,
        rows: []
    };

    let page = +req.query.page || 1;    // querystring為字串，用 + 轉換成數值
    // 頁面的處理(使用querystring轉向)，
    // redirect和json會重複送header，因此用 return 結束函式
    if(page<1){
        return res.redirect('?page=1');
    }

    const sql01 = "SELECT COUNT(1) totalRows FROM member";  // 算總筆數
    const [[{totalRows}]] = await db.query(sql01);          // [[{totalRows}]] 拿到陣列 -> 解開變成物件 -> 再解開拿到數值

    let totalPages = 0;                                     // 要放在if的外面
    if(totalRows) {
        totalPages = Math.ceil(totalRows/output.perPage);
        if(page>totalPages){
            return res.redirect(`?page=${totalPages}`);
        }

        const sql02 = `SELECT * FROM member LIMIT ${(page-1)*output.perPage}, ${output.perPage}`;       // 資料的index,每一頁
        const [r2] = await db.query(sql02);
        r2.forEach( el=> el.member_birthday = toDateString(el.member_birthday) );                    // 轉換時間格式
        output.rows = r2;
    }

    output = {...output, page, totalRows, totalPages};      // 解構賦值


    // res.json(totalRows);
    // res.json(output);
    res.render('member/main',output);
});

module.exports = router;