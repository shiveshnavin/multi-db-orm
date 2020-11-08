const {Sync} = require('../sync')
class MultiDBSafe {

    db
    dbType
    reqMade
    lastQLatency
    loglevel = 5
    sync

    constructor(db) {
        this.db = db
        this.sync = new Sync()
    }

    setdb(db) {
        this.reqMade = 0
        this.db = db;
    }

    getdb() {
        this.reqMade++
        return this.db;
    }

    async get(modelname, filter) {
        if (this.loglevel > 4)
            console.log("Not implemented")
    }

    async getOne(modelname, filter) {
        if (this.loglevel > 4)
            console.log("Not implemented")
    }

    async create(modelname, object) {
        if (this.loglevel > 4)
            console.log("Not implemented")
    }

    async insert(modelname, object) {
        if (this.loglevel > 4)
            console.log("Not implemented")
    }

    async update(modelname, filter, object) {
        if (this.loglevel > 4)
            console.log("Not implemented")
    }

    async delete(modelname, filter) {
        if (this.loglevel > 4)
            console.log("Not implemented")
    }

}


module.exports = {
    MultiDBSafe
}