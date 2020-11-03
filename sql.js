const mysql = require("mysql")

// 单个连接
// const db = mysql.createConnection({
//     host: "localhost",
//     port: 3306,
//     user: "root",
//     password: "123456",
//     database: "chat"
// });

// 连接池
const db = mysql.createPool({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "123456",
    database: "chat",
    maxConnection: 5 // 默认10个
});

// 四大SQL语句：增删改查
// 增：insert into user (username,password) values ('zhangsan','123456')
// 删：delete from user where id=1
// 改：update user set password=0 where id=1
// 查：select id from user where id=1


db.query("SELECT * from user",(err,data)=>{
    if(err){
        console.log(err)
    }else{
        console.log(data)
    }
})