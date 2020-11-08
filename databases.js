const { MultiDBSafe } = require("./engines/multidb");
const { FireStoreDB } = require("./engines/firestoredb");
const { MongoDB } = require("./engines/mongodb");
const { SQLiteDB } = require("./engines/sqlitedb");


module.exports = {
    MultiDBSafe,
    FireStoreDB,
    MongoDB,
    SQLiteDB
}