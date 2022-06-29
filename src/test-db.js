const db = require(__dirname + '/../modules/mysql-connect');

(async()=>{

    const [results, fields] = await db.query("SELECT * FROM member LIMIT 5");

    console.log(results);
    // console.log(fields);
    process.exit();  // promise不會自動結束，可在最後加上process.exit() 結束行程
})();