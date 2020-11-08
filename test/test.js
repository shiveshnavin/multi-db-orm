const { Game } = require("./models");
const { MultiDBSafe,SQLiteDB,Sync } = require("../index");


var db=new SQLiteDB();

async function testSqlite(){
    var gm=new Game('ABHC',Date.now(),'sdf33',67.33,'free')
     db.loglevel=1
     var res=await db.create('game2',gm);
     res=await db.insert('game2',gm);
     res=await db.insert('game2',gm);
     gm.amount=1
     res=await db.insert('game2',gm);
     res=await db.get('game2',{amount:1});
     res=await db.getOne('game2',{amount:1});
     res=await db.update('game2',{amount:1},{userid:'xxxx'});
     res=await db.getOne('game2',{userid:'xxxx'});
     console.log('SQLite DB Tests Successfull')

}
testSqlite();