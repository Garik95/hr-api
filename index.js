const express = require('express')
const sql = require("mssql");
var cors = require('cors');
const app = express()
const port = 3000

app.use(cors())

var config = {
    user: 'HRUser',
    password: 'Passw0rd!',
    server: 'HDESKNEW', 
    database: 'HR',
    "options": {
        "encrypt": false,
        "enableArithAbort": true
    },
};
sql.connect(config, function (err) {
    if(err) {console.log(err);}
    
    app.get('/regions', (req, res) => {
        var request = new sql.Request();
        let script = "select * from Regions where status = 1";
        request.query(script,function (err,result) {
            if(err) console.log(err);
            res.send(result.recordset)
        })
    })

    app.get('/branches', (req, res) => {
        if(typeof req.query.regionid !== 'undefined'){
            var request = new sql.Request();
            let script = `select * from Branches1 where REGIONID = ${req.query.regionid} and status = 1`;
            request.query(script,function (err,result) {
                if(err) console.log(err);
                res.send(result.recordset)
            })
        } else {
            res.send('nok')
        }
    })

    app.get('/getTree', (req,res) => {
        var request = new sql.Request();
        if (typeof req.query.region !== 'undefined'){
            if(typeof req.query.parentcode !== 'undefined') {
                let script = `select a.*,b.cnt from (select b.* from Branches1 a,TreeList b where a.REGIONID = b.REGIONID and a.REGIONID = ${req.query.region} and b.PARENTCODE = ${req.query.parentcode}) a
                left join (select PARENTCODE,count(*) as CNT from TreeList group by PARENTCODE) b
                on
                    a.CODE = b.PARENTCODE`
                request.query(script, (err,result) => {
                    if(err) console.log(err);
                    res.send(result.recordset);
                })
            }else {
                let script = `select a.*,b.cnt from (select b.* from Branches1 a,TreeList b where a.REGIONID = b.REGIONID and a.REGIONID = ${req.query.region} and b.PARENTCODE is NULL) a
                left join (select PARENTCODE,count(*) as CNT from TreeList group by PARENTCODE) b
                on
                    a.CODE = b.PARENTCODE`
                request.query(script, (err,result) => {
                    if(err) console.log(err);
                    res.send(result.recordset);
                })
            }
        }
        else {
            res.send('nok')
        }
    })

    app.get('/getPost', (req,res) => {
        var request = new sql.Request();
        if(typeof req.query.branch !== 'undefined' && typeof req.query.department !== 'undefined') {
            let script = `select b.CODE,b.NAME,count(*) as CNT from Personal a, Posts b where a.POST_CODE = b.CODE and BRANCH = '`+req.query.branch+`' and a.DEPARTMENT_CODE = ${req.query.department} group by CODE,NAME order by CODE`
            request.query(script, (err,result) => {
                if(err) console.log(err);
                res.send(result.recordset);
            })
            // res.send('ok')
        }else{
            res.send('nok')
        }
    })

    app.get('/getPostEmp', (req,res) => {
        var request = new sql.Request();
        if(typeof req.query.branch !== 'undefined' && typeof req.query.department !== 'undefined' && typeof req.query.post) {
            let script = `select * from Personal where BRANCH = '`+req.query.branch+`' and DEPARTMENT_CODE = ${req.query.department} and POST_CODE = ${req.query.post}`
            request.query(script, (err,result) => {
                if(err) console.log(err);
                res.send(result.recordset);
            })
        }else{
            res.send('nok')
        }
    })

});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})