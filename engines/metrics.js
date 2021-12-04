class Metrics {

    loglevel = 1
    dbstats;

    constructor(loglevel) {
        this.loglevel = loglevel;
        this.dbstats = {
            reads: 0,
            batchReads: 0,
            inserts: 0,
            updates: 0,
            deletes: 0
        }
    }

    printStatus() {
        console.log(dbstats)
    }

    reset() {
        this.dbstats = {
            reads: 0,
            batchReads: 0,
            inserts: 0,
            updates: 0,
            deletes: 0
        }
    }

    getStatus() {
        this.dbstats.readsTotal = this.dbstats.reads + this.dbstats.batchReads;
        return this.dbstats;
    }

    async get(modelname, filter) {
        this.dbstats.batchReads++;
        if (this.loglevel > 4)
            this.printStatus()
    }

    async getOne(modelname, filter) {
        this.dbstats.reads++;
        if (this.loglevel > 4)
            this.printStatus()
    }

    async create(modelname, object) {
        this.dbstats.inserts++;
        if (this.loglevel > 4)
            this.printStatus()
    }

    async insert(modelname, object) {
        this.dbstats.inserts++;
        if (this.loglevel > 4)
            printStatus()
    }

    async update(modelname, filter, object) {
        this.dbstats.updates++;
        if (this.loglevel > 4)
            this.printStatus()
    }

    async delete(modelname, filter) {
        this.dbstats.deletes++;
        if (this.loglevel > 4)
            this.printStatus()
    }

}



module.exports = {
    Metrics
}