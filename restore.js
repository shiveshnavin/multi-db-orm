
const mongoose = require('mongoose');
var fs = require('fs');
async function log(arg) {
    update(arg)
}

var maxC = 0;
var curC = 1;
async function processCollection(collectionName) {

    try {
 
        var collData = data[collectionName];
        var coll = db.collection(collectionName);
        collData.forEach((cd) => {
            cd._id = mongoose.Types.ObjectId(cd._id)
        })
        await coll.insertMany(collData)
        var count = await coll.countDocuments() 
        log(collectionName, "   =   ", count);
        if(removeDups)
         dups(collectionName)

    } catch (er) {
        log(er.message)
        log("error in " + collectionName);
    }
    log('Processed '+collectionName+"("+(curC+"/"+maxC)+")");
    if (curC++ < maxC) {
        curC;   
    }
    else {
        log("\n\nAll Data restore completed !!");
        finish('Restore Complete !')
    }

};

async function dups(collectionName) {
    var coll = db.collection(collectionName);
    await coll.aggregate(
        { "$group": { "_id": "$name", "count": { "$sum": 1 } } },
        { "$match": { "_id": { "$ne": null }, "count": { "$gt": 1 } } },
        { "$project": { "name": "$_id", "_id": 0 } }
    )
        .toArray((err, results) => {
            if (err) throw err;
            log("===", results);

        })
}

var dumpFile = process.argv[2];
var targetDb = process.argv[3];
var deDupDo = process.argv[4]; 
var db;
var data;
var update=(msg)=>{
    console.log(msg)
}
var finish=(msg)=>{
    log(msg)
    process.exit()
}
var removeDups=false;
if (dumpFile && targetDb) {
    data = JSON.parse(fs.readFileSync(dumpFile)); 
    mongoose.Promise = global.Promise;

    mongoose.connect(targetDb, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        }).then(() => {
        log("Successfully connected to the database");
        readCollectionsFromDump(mongoose.connection.db,JSON.parse(fs.readFileSync(dumpFile)),deDupDo);
    }).catch(err => {
        log('Could not connect to the database. Exiting now...', err);
        process.exit();
    });
}
async function readCollectionsFromDump(connectedDB, dumpData,deDup) {


    if(deDup==1){
        removeDups=true;
        log("Removing duplicates as well")
    }
    db = connectedDB;
    data = (dumpData);

    var v = Object.keys(dumpData)
    log('Found '+v.length+' Collections to restore');
   // log(v);
    maxC = v.length; 
    console.log(v.length) 
    v.forEach(async function(coll){
        await processCollection(coll)
    });
    

}
