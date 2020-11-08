const { MultiDBSafe } = require("./engines/multidb");
const { FireStoreDB } = require("./engines/firestoredb");
const { SQLiteDB } = require("./engines/sqlitedb");


module.exports = {
    MultiDBSafe,
    FireStoreDB,
    SQLiteDB
}