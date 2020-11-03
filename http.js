const http = require("http")
const url = require("url")
const fs = require("fs")

const mysql = require("mysql")


const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "123456",
    port: "3306",
    database: "chat",
})

const httpServer = http.createServer((req,res)=>{
    const {pathname,query} = url.parse(req.url,true)

    if(pathname =="/regist"){
        const {username,password} = query

        if(username && password){
            if(username.length >=4 && password.length >=6){
                let selectStr = `select id from user where username='${username}'`
                db.query(selectStr,(err,data)=>{
                    if(err){
                        res.end(JSON.stringify({code:1,msg:"数据库错误"}))
                    }else if(data.length){
                        res.end(JSON.stringify({code:1,msg:"该用户已存在"}))
                    }else{
                        let insertStr = `insert into user (username,password,status) values ('${username}','${password}',0)`
                        db.query(insertStr,err=>{
                            if(err){
                                res.end(JSON.stringify({code:1,msg:"数据库错误"}))
                            }else{
                                res.end(JSON.stringify({code:0,msg:"注册成功"}))
                            }
                        })
                    }
                })
            }else{
                res.end(JSON.stringify({code:1,msg:"用户或密码不符合规范"}))
            }
        }else{
            res.end(JSON.stringify({code:1,msg:"用户或密码不能为空"}))
        }
    }else if(pathname =="/login"){
        const {username,password} = query

        if(username && password){
            if(username.length >=4 && password.length >=6){
                let selectStr = `select id from user where username='${username}' and password='${password}'`
                db.query(selectStr,(err,data)=>{
                    if(err){
                        res.end(JSON.stringify({code:1,msg:"数据库错误"}))
                    }else if(data.length){
                        let updateStr = `update user set status=1 where id='${data[0].id}'`
                        db.query(updateStr,err=>{
                            if(err){
                                res.end(JSON.stringify({code:1,msg:"数据库错误"}))
                            }else{
                                res.end(JSON.stringify({code:0,msg:"登陆成功"}))
                            }
                        })
                    }else{
                        res.end(JSON.stringify({code:1,msg:"用户或密码错误"}))
                    }
                })
            }else{
                res.end(JSON.stringify({code:1,msg:"用户或密码不符合规范"}))
            }
        }else{
            res.end(JSON.stringify({code:1,msg:"用户或密码不能为空"}))
        }
    }else{
        fs.readFile(`./page${pathname}`,(err,data)=>{
            if(err){
                res.writeHead(404)
                res.end("Not Found")
            }else{
                res.end(data)
            }
        })
    }
})
httpServer.listen(8080)