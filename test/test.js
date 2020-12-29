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
    var gm = new Game('IndVSPak', Date.now(), 'Dhoni', 67.33, 'paid')
    sqlitedb.loglevel = 1
    var res = await sqlitedb.create('games', gm);
    res = await sqlitedb.insert('games', gm);
    res = await sqlitedb.insert('games', gm);
    gm.amount = 1
    res = await sqlitedb.insert('games', gm);
    res = await sqlitedb.get('games', { amount: 1 });
    res = await sqlitedb.getOne('games', { amount: 1 });
    res = await sqlitedb.update('games', { amount: 1 }, { userid: 'xxxx' });
    res = await sqlitedb.getOne('games', { userid: 'xxxx' });

    res = await sqlitedb.insert('games', new Game('IndVSPak1', Date.now(), 'Dhoni', 100, 'free'));

    res = await sqlitedb.insert('games', new Game('IndVSPak2', Date.now(), 'Dhoni', 200, 'free'));

    res = await sqlitedb.insert('games', new Game('IndVSPak3', Date.now(), 'Dhoni', 300, 'paid'));

    res = await sqlitedb.insert('games', new Game('IndVSPak4', Date.now(), 'Dhoni', 400, 'paid'));

    res = await sqlitedb.get('games', undefined, { sort: [{ field: 'timeStamp', order: 'asc' }, { field: 'amount', order: 'asc' }], limit: 5, offset: 1 })

    res = await sqlitedb.get('games', { type: 'paid' }, { sort: [{ field: 'amount', order: 'desc' }, { field: 'timeStamp', order: 'desc' }] })

    res = await sqlitedb.get('games', { amount: 400 }, {
        apply: {
            field: 'timeStamp',
            sort: 'desc',
            ineq: {
                op: '>=',
                value: 1
            }
        },
        sort: [{ field: 'amount', order: 'asc' }, { field: 'timeStamp', order: 'desc' }],
        limit: 2, offset: 1
    })

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
    var firebasedb = new FireStoreDB(require('../creds.json'));
    var gm = new Game('IndVSPak', Date.now(), 'Dhoni', 67.33, 'free')
    firebasedb.loglevel = 1
    var res = await firebasedb.create('games', gm);
    res = await firebasedb.insert('games', gm, Date.now());
    res = await firebasedb.insert('games', gm, Date.now());
    gm.amount = 1
    res = await firebasedb.insert('games', gm);
    res = await firebasedb.get('games', { amount: 67.33 });
    res = await firebasedb.getOne('games', { amount: 1 });
    res = await firebasedb.update('games', { userid: 'Dhoni' }, { userid: 'ABC123' });
    res = await firebasedb.update('games', { id: 'IndVSPak' }, { amount: 1000 });
    await firebasedb.delete('games', { type: 'free' })

    res = await firebasedb.insert('games', new Game('IndVSPak1', Date.now(), 'Dhoni', 100, 'free'));

    res = await firebasedb.insert('games', new Game('IndVSPak2', Date.now(), 'Dhoni', 200, 'free'));

    res = await firebasedb.insert('games', new Game('IndVSPak3', Date.now(), 'Dhoni', 300, 'paid'));

    res = await firebasedb.insert('games', new Game('IndVSPak4', Date.now(), 'Dhoni', 400, 'paid'));

    res = await firebasedb.get('games', undefined, { sort: [{ field: 'amount', order: 'desc' }] })

    res = await firebasedb.get('games', undefined, { sort: [{ field: 'amount', order: 'desc' }], limit: 2, offset: 1 })

    // res = await firebasedb.get('games', {type:'paid'}, { sort: [{ field: 'amount', order: 'asc' }, { field: 'timeStamp', order: 'desc' }] })

    res = await firebasedb.get('games', { amount: 100 }, {
        apply: {
            field: 'timeStamp',
            sort: 'desc',
            ineq: {
                op: '>=',
                value: 1
            }
        },
        sort: [{ field: 'amount', order: 'asc' }, { field: 'timeStamp', order: 'desc' }],
        limit: 2, offset: 1
    })

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
    var mongodb = new MongoDB(crd.mongourl, crd.mongodbname);
    if (mongodb.db == undefined) {
        await mongodb._connect();
    }
    try {
        var gm = new Game('IndVSPak', Date.now(), 'Dhoni', 67.33, 'free')
        mongodb.loglevel = 1
        var res = await mongodb.create('games', gm);
        res = await mongodb.insert('games', gm);
        res = await mongodb.insert('games',
            new Game('IndVSPak', Date.now(), 'Dhoni', 67.33, 'free'));
        res = await mongodb.get('games', { amount: 67.33 });
        res = await mongodb.getOne('games', { amount: 1 });
        res = await mongodb.update('games', { userid: 'Dhoni' }, { userid: 'ABC123' });
        res = await mongodb.update('games', { id: 'IndVSPak' }, { amount: 1000 });

        res = await mongodb.insert('games', new Game('IndVSPak1', Date.now(), 'Dhoni', 100, 'free'));

        res = await mongodb.insert('games', new Game('IndVSPak2', Date.now(), 'Dhoni', 200, 'free'));

        res = await mongodb.insert('games', new Game('IndVSPak3', Date.now(), 'Dhoni', 300, 'paid'));

        res = await mongodb.insert('games', new Game('IndVSPak4', Date.now(), 'Dhoni', 400, 'paid'));

        res = await mongodb.get('games', undefined, { sort: [{ field: 'amount', order: 'desc' }] })

        res = await mongodb.get('games', undefined, { sort: [{ field: 'timeStamp', order: 'asc' }, { field: 'amount', order: 'asc' }], limit: 5, offset: 1 })

        res = await mongodb.get('games', { type: 'paid' }, { sort: [{ field: 'amount', order: 'asc' }, { field: 'timeStamp', order: 'desc' }] })

        res = await mongodb.get('games', { amount: 400 }, {
            apply: {
                field: 'timeStamp',
                sort: 'desc',
                ineq: {
                    op: '>=',
                    value: 1
                }
            },
            sort: [{ field: 'amount', order: 'asc' }, { field: 'timeStamp', order: 'desc' }],
            limit: 2, offset: 1
        })
        await mongodb.delete('games', { type: 'free' })
        console.log('Mongo DB Tests Successfull')

    } finally {
        mongodb._close();
        checkTestsCompleted();
    }

}

testSqlite();
// testFireStore();
// testMongo();