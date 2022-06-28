const express = require('express');

const router = express.Router(); // 建立 router 物件

router.get('/r1/:action?/:id?', (req, res)=>{
    res.json({
        url: req.url,                               // /r1/xxxx/xxxx
        baseUrl: req.baseUrl,                       // /admins
        originalUrl: req.originalUrl,               // 完整路徑：/admins/r1/xxxx/xxxx
        params: req.params,
        code: 'admins.js',
    });
});
router.get('/r2/:action?/:id?', (req, res)=>{
    res.json({
        url: req.url,
        params: req.params,
        code: 'admins.js',
    });
});

module.exports = router;

