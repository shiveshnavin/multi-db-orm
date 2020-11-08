const { Game } = require("./models");
const { MultiDBSafe, FireStoreDB, MongoDB, SQLiteDB, Sync } = require("../index");


var testCount = 3
function checkTestsCompleted() {
    if (--testCount <= 0) {
        process.exit(0)
    }
}

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
    checkTestsCompleted();
}


async function testFireStore() {
    try {
        require('../creds.json')

    } catch (e) {
        console.log('testFireStore', 'creds.json not found');
        checkTestsCompleted();
        return
    }
    var firebasedb = new FireStoreDB('../creds.json');
    var gm = new Game('IndVSPak', Date.now(), 'Dhoni', 67.33, 'free')
    firebasedb.loglevel = 1
    var res = await firebasedb.create('game', gm);
    res = await firebasedb.insert('game', gm, Date.now());
    res = await firebasedb.insert('game', gm, Date.now());
    gm.amount = 1
    res = await firebasedb.insert('game', gm);
    res = await firebasedb.get('game', { amount: 67.33 });
    res = await firebasedb.getOne('game', { amount: 1 });
    res = await firebasedb.update('game', { userid: 'Dhoni' }, { userid: 'ABC123' });
    res = await firebasedb.update('game', { id: 'IndVSPak' }, { amount: 1000 });
    await firebasedb.delete('game', { type: 'free' })
    console.log('Firestore DB Tests Successfull')
    checkTestsCompleted();

}


async function testMongo() {
    try {
        require('../creds.json')

    } catch (e) {
        console.log('testMongo', 'creds.json not found');
        checkTestsCompleted();
        return
    }
    var crd = require('../creds.json')
    var mongodb = new MongoDB(crd.mongourl);
    if (mongodb.db == undefined) {
        await mongodb._connect();
    }
    try {
        var gm = new Game('IndVSPak', Date.now(), 'Dhoni', 67.33, 'free')
        mongodb.loglevel = 1
        var res = await mongodb.create('game', gm);
        res = await mongodb.insert('game', gm);
        res = await mongodb.insert('game',
            new Game('IndVSPak', Date.now(), 'Dhoni', 67.33, 'free'));
        res = await mongodb.get('game', { amount: 67.33 });
        res = await mongodb.getOne('game', { amount: 1 });
        res = await mongodb.update('game', { userid: 'Dhoni' }, { userid: 'ABC123' });
        res = await mongodb.update('game', { id: 'IndVSPak' }, { amount: 1000 });
        await mongodb.delete('game', { type: 'free' })
        console.log('Mongo DB Tests Successfull')

    } finally {
        mongodb._close();
        checkTestsCompleted();
    }

}

testSqlite();
testFireStore();
testMongo();