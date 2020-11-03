const http = require("http")
const fs = require("fs")

const mysql = require("mysql")
const io = require("socket.io")


const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "123456",
    port: "3306",
    database: "chat",
})

const httpServer = http.createServer((req,res)=>{
    fs.readFile(`./page${req.url}`,(err,data)=>{
        if(err){
            res.writeHead(404)
            res.end("Not Found")
        }else{
            res.end(data)
        }
    })
})
httpServer.listen(8080)

let sockArray = []
const wsServer = io.listen(httpServer)
wsServer.on("connection", sock=>{
    let cur_id = 0
    let cur_user = ""
    sockArray.push(sock)

    sock.on("toRegist",(username,password)=>{
        if(username && password){
            if(username.length >=4 && password.length >=6){
                let selectStr = `select id from user where username='${username}'`
                db.query(selectStr,(err,data)=>{
                    if(err){
                        sock.emit("forRegist",1,"数据库错误")
                    }else if(data.length){
                        sock.emit("forRegist",1,"该用户已存在")
                    }else{
                        let insertStr = `insert into user (username,password,status) values ('${username}','${password}',0)`
                        db.query(insertStr,err=>{
                            if(err){
                                sock.emit("forRegist",1,"数据库错误")
                            }else{
                                sock.emit("forRegist",0,"注册成功")
                            }
                        })
                    }
                })
            }else{
                sock.emit("forRegist",1,"用户或密码不符合规范")
            }
        }else{
            sock.emit("forRegist",1,"用户或密码不能为空")
        }
    })

    sock.on("toLogin",(username,password)=>{
        if(username && password){
            if(username.length >=4 && password.length >=6){
                let selectStr = `select id from user where username='${username}' and password='${password}'`
                db.query(selectStr,(err,data)=>{
                    if(err){
                        sock.emit("forLogin",1,"数据库错误")
                    }else if(data.length){
                        let updateStr = `update user set status=1 where id='${data[0].id}'`
                        db.query(updateStr,err=>{
                            if(err){
                                sock.emit("forLogin",1,"数据库错误")
                            }else{
                                cur_id = data[0].id
                                cur_user = username
                                sock.emit("forLogin",0,"登陆成功")
                            }
                        })
                    }else{
                        sock.emit("forLogin",1,"用户或密码错误")
                    }
                })
            }else{
                sock.emit("forLogin",1,"用户或密码不符合规范")
            }
        }else{
            sock.emit("forLogin",1,"用户或密码不能为空")
        }
    })

    sock.on("toSend",(username,content)=>{
        if(content){
            // 广播给所有人
            sockArray.forEach(item=>{
                if(item ==sock){
                    return
                }
                item.emit("toSend",username,content)
            })
            sock.emit("forSend",0,"发送成功",username,content)
        }else{
            sock.emit("forSend",1,"发送内容不能为空","","")
        }
    })

    sock.on("disconnect",()=>{
        let updateStr = `update user set status=0 where id=${cur_id}`
        db.query(updateStr,err=>{
            if(err){
                console.log("数据库错误")
            }else{
                cur_id = 0
                cur_user = ""
                console.log("已退出")
            }
        })

        sockArray = sockArray.filter(item=>item!=sock) //消除掉线的
    })

})