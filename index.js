require("dotenv").config();
const express = require('express');
const multer = require('multer');
// const upload = multer({dest:'tmp_uploads'});
const upload = require(__dirname + '/modules/upload-images');
const session = require('express-session'); 
const moment = require('moment-timezone');
const axios = require('axios');

const {
    toDateString,
    toDatetimeString,
} = require(__dirname + '/modules/date-tools');

const db = require(__dirname + '/modules/mysql-connect');
const MysqlStore = require('express-mysql-session')(session);
const sessionStore = new MysqlStore({}, db);


const app = express();  // 直接呼叫




// Top-level middlewares 掛在所有路由之前，後面都會吃到
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(session({
    saveUninitialized: false,
    resave: false,
    secret:'rqfoifjifjwqfjpjqwgqpjrhwigpjwgjgewgqqt31t3',
    store: sessionStore,
    cookie: {
        maxAge: 1800000, // 30 min
    }

}));


app.get('/try-session',(req,res)=>{
    req.session.my_var = req.session.my_var || 0;
    req.session.my_var++;
    res.json({
        my_var: req.session.my_var,
        session:req.session
    });
})



app.use('/member', require(__dirname + '/routes/member'));
app.use('/member2', require(__dirname + '/routes/member2'));

app.get('/yahoo', async (req, res)=>{
    axios.get('https://tw.yahoo.com/')
    .then(function (response) {
      // handle success
        console.log(response);
        res.send(response.data);
    })
});

// params 設定路徑參數
// 一段一個冒號，:action? 表示此參數可有可無
// 定義最寬鬆的路由放最後面(才不會一開始就跑進去)
app.get('/my-params/:action/:id', (req, res)=>{
    res.json(req.params);
});

// app.get('/try-params1/:action/:id', (req, res)=>{
//     res.json({code:2, params: req.params});
// })
// app.get('/try-params1/:action', (req, res)=>{
//     res.json({code:3, params: req.params});
// })
// app.get('/try-params1/:action?/:id?', (req, res)=>{
//     res.json({code:1, params: req.params});
// });

app.get(/^\/hi\/?/i, (req, res)=>{
    res.send({url: req.url});
});
app.get(['/aaa', '/bbb'], (req, res)=>{
    res.send({url: req.url, code:'array'});
});


app.get('/try-json', (req, res)=>{
    const data = require(__dirname + '/data/data01');
    console.log(data);
    res.locals.rows = data;
    res.render('try-json'); // render一定要放最後面，跟end一樣
});


app.get('/try-moment', (req, res)=>{
    const fm = 'YYYY-MM-DD HH:mm:ss';
    const m1 = moment();
    const m2 = moment('2022-02-29');

    res.json({
        m1: m1.format(fm),      // 輸出format格式(會是字串)
        m1a: m1.tz('Europe/London').format(fm),
        m2: m2.format(fm),
        m2a: m2.tz('Europe/London').format(fm),
    })
});



// 把router掛在/admins底下(群組起來)
// app.use('/admins', require(__dirname + '/routes/admins'));

// 同一個路由但可以連到兩種路徑(差在baseurl)
const adminsRouter = require(__dirname + '/routes/admins');
app.use('/admins', adminsRouter);   // prefix 前綴路徑
app.use(adminsRouter);
// locals掛在response身上
app.use((req, res, next)=>{
    res.locals.shinder = '哈囉';

    // template helper functions
    res.locals.toDateString = toDateString;
    res.locals.toDatetimeString = toDatetimeString;

    next();
});



app.set('view engine','ejs');
// app.set('case sensitive routing', true);    // 路徑區分大小寫



app.get('/try-qs', (req, res)=>{
    res.json(req.query);
});

// middleware: 中介軟體 (function)
// middleware可掛多個(用陣列)，解析完把body塞回去，沒有的話req.body會undefined
// const bodyParser = express.urlencoded({extended: false});
// app.post('/try-post', bodyParser, (req, res)=>{
//     res.json(req.body);
// });

const bodyParser = express.urlencoded({extended: false});
app.post('/try-post', (req, res)=>{
    res.json(req.body);
});

app.post('/try-upload', upload.single('avatar'), (req, res)=>{
    res.json(req.file);
});

app.post('/try-uploads', upload.array('photos'), (req, res)=>{
    res.json(req.files);
});

app.route('/try-post-form')
    .get((req, res)=>{
        res.render('try-post-form');
    })
    .post((req, res)=>{
        const {email, password} = req.body;
        res.render('try-post-form', {email, password});
    });


app.get("/",( req,res )=>{
    // res.send(`<h2>HELLOOOOOOOOOOOOO！</h2>`);
    res.render("main",{name:'sato'});
});


// ------- static folder -----------
app.use(express.static("public"));
app.use("/bootstrap", express.static("node_modules/bootstrap/dist"));
app.use("/joi", express.static("node_modules/joi/dist"));


// ------- 404 -----------
// .use接收所有HTTP的方法(get、post...)，底層是一個陣列，express先設定的先處理，404頁面須放在所有路由的後面
app.use(( req , res )=>{
    res.send(`<h2>找不到頁面 404</h2>
    <img src="/imgs/4044444.png" alt="" width="350px"/>
    `);
});

app.listen(process.env.PORT,()=>{
    console.log(`server started: ${process.env.PORT}`);
    // console.log({ NODE_ENV: process.env.NODE_ENV });
})