const express = require('express');
const db = require(__dirname + '/../modules/mysql-connect');
const {
    toDateString,
    toDatetimeString,
} = require(__dirname + '/../modules/date-tools');

const moment = require('moment-timezone');
const Joi = require('joi');
const upload = require(__dirname + '/../modules/upload-images')

const router = express.Router();

// 做成function之後呼叫他
const getListHandler = async (req, res)=>{
    let output = {
        perPage: 3,
        page: 1,
        totalRows: 0,
        totalPages: 0,
        code: 0,  // 辨識狀態
        error: '',
        query: {},
        rows: []
    };
    let page = +req.query.page || 1;

    let search = req.query.search || '';

    let beginDate = req.query.beginDate || '';
    let endDate = req.query.endDate || '';

    let where = ' WHERE 1 ';    //true
    if(search){
        // where += ` AND member_name LIKE '%${search}%' `;             // 接上sql後段
        where += ` AND member_name LIKE ${ db.escape('%'+search+'%') } `;      // 用escape避免sql injection
        output.query.search = search;
        output.showTest = db.escape('%'+search+'%'); // 測試, 查看
        console.log(output.query);
    }

    if(beginDate){
        const mo = moment(beginDate);
        // isValid來檢查日期是否存在(有沒有符合格式)
        if(mo.isValid()){
            where += ` AND member_birthday >= '${mo.format('YYYY-MM-DD')}' `;
            output.query.beginDate = mo.format('YYYY-MM-DD');
        }
    }
    if(endDate){
        const mo = moment(endDate);
        if(mo.isValid()){
            where += ` AND member_birthday <= '${mo.format('YYYY-MM-DD')}' `;
            output.query.endDate = mo.format('YYYY-MM-DD');
        }
    }


    if(page<1) {
        output.code = 410;
        output.error = '頁碼太小';
        return output;
    }

    const sql01 = `SELECT COUNT(1) totalRows FROM member ${where} `;
    const [[{totalRows}]] = await db.query(sql01);
    let totalPages = 0;
    if(totalRows) {
        totalPages = Math.ceil(totalRows/output.perPage);
        if(page>totalPages){
            output.totalPages = totalPages; // 把最大頁碼設定回去
            output.code = 420;
            output.error = '頁碼太大';
            return output;
        }

        const sql02 = `SELECT * FROM member ${where} ORDER BY member_sid DESC LIMIT ${(page-1)*output.perPage}, ${output.perPage}`;
        const [r2] = await db.query(sql02);
        r2.forEach( el=> el.member_birthday = toDateString(el.member_birthday) ); 
        output.rows = r2;
    }
    output.code = 200;
    output = {...output, page, totalRows, totalPages};

    return output;
};

router.get('/add', async (req, res)=>{
    res.render('member/add');
});

router.post('/add', upload.none(), async (req, res)=>{

    // 欄位驗證
    const schema = Joi.object({
        member_name: Joi.string()
            .min(3)
            .required()
            .label('姓名必填'),
        member_email: Joi.string()
            .email()
            .required(),
        member_mobile: Joi.string(),
        member_birthday: Joi.string(),
        member_address: Joi.string(),
    });

    // 自訂訊息
    // https://stackoverflow.com/questions/48720942/node-js-joi-how-to-display-a-custom-error-messages

    // console.log( schema.validate(req.body, {abortEarly: false}) );

    const sql = "INSERT INTO `member`(`member_name`, `member_nickname`, `member_birthday`, `member_mobile`, `member_address`, `member_mail`) VALUES (?, ?, ?, ?, ?, ?)";
    req.body.member_birthday = "";
    req.body.member_birthday = (req.body.member_birthday ? req.body.member_birthday : null );
    const {member_name, member_nickname, member_birthday, member_mobile, member_address, member_mail} = req.body;    // 展開
    console.log("123",member_birthday);
    const [result] = await db.query(sql, [member_name, member_nickname, member_birthday, member_mobile, member_address, member_mail]);   // 變成陣列

    // 成功的話在console可看到 {"fieldCount":0,"affectedRows":1,"insertId":1113,"info":"","serverStatus":2,"warningStatus":0}，affectedRows表影響一筆資料，insertId也就是member_sid

    res.json(result);
    // res.json( schema.validate(req.body, {abortEarly: false}) ); // abortEarly全部都檢查，沒有的話只要其中一個欄位不符合格式，後面就不檢查了
    // res.json(req.body);  // 解析body

    /*
    // mysql2的用法，mysql2幫忙處理的方式
    // SET ? 的問號是object
    const sql = "INSERT INTO `address_book` SET ?";
    const birthday = req.body.birthday || null;
    const insertData = {...req.body, birthday, created_at: new Date()};
    const [result] = await db.query(sql, [insertData]);

    res.json(result);
    */
});

// 呼叫
router.get('/', async (req, res)=>{
    const output = await getListHandler(req, res);
    switch(output.code){
        case 410:
            return res.redirect(`?page=1`);
            break;
        case 420:
            return res.redirect(`?page=${output.totalPages}`);
            break;
    }
    res.render('member/main', output);
});
router.get('/api', async (req, res)=>{
    const output = await getListHandler(req, res);
    res.json(output);
});

module.exports = router;