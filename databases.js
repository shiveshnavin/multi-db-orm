const { MultiDbORM } = require("./engines/multidb");
const { FireStoreDB } = require("./engines/firestoredb");
const { MongoDB } = require("./engines/mongodb");
const { SQLiteDB } = require("./engines/sqlitedb");
const { OracleDB } = require('./engines/oracledb')

module.exports = {
    MultiDbORM,
    FireStoreDB,
    MongoDB,
    SQLiteDB,
    OracleDB
}