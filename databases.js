const { MultiDbORM } = require("./engines/multidb");
const { FireStoreDB } = require("./engines/firestoredb");
const { MongoDB } = require("./engines/mongodb");
const { SQLiteDB } = require("./engines/sqlitedb");


module.exports = {
    MultiDbORM,
    FireStoreDB,
    MongoDB,
    SQLiteDB
}