const { Game } = require("./models");
const { MultiDBSafe, FireStoreDB, SQLiteDB, Sync } = require("../index");




async function testSqlite() {
    var sqlitedb = new SQLiteDB();
    var gm = new Game('IndVSPak', Date.now(), 'Dhoni', 67.33, 'free')
    sqlitedb.loglevel = 1
    var res = await sqlitedb.create('game', gm);
    res = await sqlitedb.insert('game', gm);
    res = await sqlitedb.insert('game', gm);
    gm.amount = 1
    res = await sqlitedb.insert('game', gm);
    res = await sqlitedb.get('game', { amount: 1 });
    res = await sqlitedb.getOne('game', { amount: 1 });
    res = await sqlitedb.update('game', { amount: 1 }, { userid: 'xxxx' });
    res = await sqlitedb.getOne('game', { userid: 'xxxx' });
    console.log('SQLite DB Tests Successfull')

}


async function testFireStore() {
    try{
        require('../creds.json')

    }catch(e){
        console.log('testFireStore','creds.json not found');
        return
    }
    var firebasedb = new FireStoreDB('../creds.json');
    var gm = new Game('IndVSPak', Date.now(), 'Dhoni', 67.33, 'free')
    firebasedb.loglevel = 1
    var res = await firebasedb.create('game', gm);
    res = await firebasedb.insert('game', gm,Date.now());
    res = await firebasedb.insert('game', gm,Date.now());
    gm.amount=1
    res = await firebasedb.insert('game', gm);
    res = await firebasedb.get('game', { amount: 67.33 });
    res = await firebasedb.getOne('game', { amount: 1 });
    res = await firebasedb.update('game', {userid: 'Dhoni'}, { userid: 'YYYYYYYY' });
    res = await firebasedb.update('game', { id: 'IndVSPak' },{amount:1000});
    await firebasedb.delete('game',{type:'free'})
    console.log('Firestore DB Tests Successfull')

}
testSqlite();
testFireStore();