class MultiDBSafe {

    db
    dbType
    reqMade
    connStart
    loglevel = 5

    constructor(db) {
        this.db = db
        this.connStart = Date.now();
    }

    setConnection(db) {
        this.db = db;
        this.connStart = Date.now();
    }

    getConnection() {
        return db;
    }

    async get(modelname, filter) {
        console.log("Not implemented")
    }

    async getOne(modelname, filter) {
        console.log("Not implemented")
    }

    async create(modelname, object) {
        console.log("Not implemented")
    }

    async insert(modelname, object) {
        console.log("Not implemented")
    }

    async update(modelname, filter, object) {
        console.log("Not implemented")
    }

    async delete(modelname, filter) {
        console.log("Not implemented")
    }

}


module.exports = {
    MultiDBSafe
}