var fs = require('fs');
const { stringify } = require('querystring');
async function log(arg) {
    update(arg)
}
var maxC = 0;
var curC = 1;
async function processCollection(n) {

    var coll = db.collection(n.name)
    var count = await coll.countDocuments()
    log(n.name + "   =   " + count);
    await coll.find()
        .toArray((err, results) => {
            if (err) throw err;

            output[n.name] = results;
            log("Dumped " + n.name + " (" + curC + "/" + maxC + ")");
            if (maxC > curC) {
                curC++;
            }
            else {
                log("\n\n All Dumps completed !!");
                log("Saving to file.... ", file)
                write();
            }
        })
};

async function write(skipWriteToFile) {
    var blob=JSON.stringify(output);
    if (skipWriteToFile !== true) {

        if(!fs.existsSync('./dumps'))
            fs.mkdirSync('./dumps')
        fs.writeFileSync(file, blob);

    }
    finish("Done !", blob);
}

function getDateString() {
    var d = new Date();

    var datestring = d.getFullYear() + "" + (d.getMonth() + 1) + "" + d.getDate() + "_" +
        d.getHours() + "" + d.getMinutes();

    return datestring;
}

var output = {};
var file;
var db;
async function dump() {
    file = "dumps/dump_" + getDateString() + ".json";
    if(OVERRIDE_FILE){
        file=OVERRIDE_FILE;
    }
    log("Dumps Saved to " + file);
    db.listCollections().toArray(function (err, names) {
 
      maxC = names.length;
      names.forEach(processCollection)
    });

}

var update;
var finish;

var backup=function (dbc, upd, fin) {
    var module = {};

    if (upd == undefined || dbc == undefined) {
        fin("No DB Connection");
        return
    }
    db = dbc;
    update = upd;
    finish = fin;
    module.dump = dump
    return module;
}; 
module.exports = backup

var DBURL = process.argv[2]
var OVERRIDE_FILE = process.argv[3]
if (DBURL) {
 
    const mongoose = require('mongoose'); 
    mongoose.Promise = global.Promise;
    mongoose.connect(DBURL, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    }).then(() => {
        console.log("Successfully connected to the database");
        backup(mongoose.connection.db,()=>{},(msg,blob)=>{
            console.log("Backup Complete : Size "+blob.length,' Bytes')
            process.exit();
        }).dump()
     }) .catch(err => {
        console.log('Could not connect to the database. Exiting now...', err);
        process.exit();
    });



}