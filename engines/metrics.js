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
    setLogLevel(level) {
        this.loglevel = level;
    }

    printStatus() {
        console.log(this.dbstats)
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
        const args = Array.from(arguments)
        const last = args[args.length - 1]
        const start = last && typeof last === 'object' && last.startTime ? last.startTime : process.hrtime.bigint()
        this.dbstats.batchReads++;
        if (this.loglevel > 4)
            this.printStatus()
        this._logOperation(modelname, 'get', start, { filter })
    }

    async getOne(modelname, filter) {
        const args = Array.from(arguments)
        const last = args[args.length - 1]
        const start = last && typeof last === 'object' && last.startTime ? last.startTime : process.hrtime.bigint()
        this.dbstats.reads++;
        if (this.loglevel > 4)
            this.printStatus()
        this._logOperation(modelname, 'getOne', start, { filter })
    }

    async create(modelname, object) {
        const args = Array.from(arguments)
        const last = args[args.length - 1]
        const start = last && typeof last === 'object' && last.startTime ? last.startTime : process.hrtime.bigint()
        this.dbstats.inserts++;
        if (this.loglevel > 4)
            this.printStatus()
        this._logOperation(modelname, 'create', start, { object })
    }

    async insert(modelname, object) {
        const args = Array.from(arguments)
        const last = args[args.length - 1]
        const start = last && typeof last === 'object' && last.startTime ? last.startTime : process.hrtime.bigint()
        this.dbstats.inserts++;
        if (this.loglevel > 4)
            this.printStatus()
        this._logOperation(modelname, 'insert', start, { object })
    }

    async update(modelname, filter, object) {
        const args = Array.from(arguments)
        const last = args[args.length - 1]
        const start = last && typeof last === 'object' && last.startTime ? last.startTime : process.hrtime.bigint()
        this.dbstats.updates++;
        if (this.loglevel > 4)
            this.printStatus()
        this._logOperation(modelname, 'update', start, { filter, object })
    }

    async delete(modelname, filter) {
        const args = Array.from(arguments)
        const last = args[args.length - 1]
        const start = last && typeof last === 'object' && last.startTime ? last.startTime : process.hrtime.bigint()
        this.dbstats.deletes++;
        if (this.loglevel > 4)
            this.printStatus()
        this._logOperation(modelname, 'delete', start, { filter })
    }

    _safeStringify(v) {
        try {
            return JSON.stringify(v)
        } catch (e) {
            return String(v)
        }
    }

    startSpan(operation) {
        return { startTime: process.hrtime.bigint(), operation }
    }

    updateSpan() {
        return this.startSpan('update')
    }

    insertSpan() {
        return this.startSpan('insert')
    }

    getSpan() {
        return this.startSpan('get')
    }

    getOneSpan() {
        return this.startSpan('getOne')
    }

    createSpan() {
        return this.startSpan('create')
    }

    deleteSpan() {
        return this.startSpan('delete')
    }

    _logOperation(modelname, operation, startTime, details) {
        if (!(this.loglevel > 3)) return
        const elapsedMs = Number(process.hrtime.bigint() - startTime) / 1e6
        if (this.loglevel > 4) {
            const parts = []
            if (details) {
                if (details.filter !== undefined) parts.push(`filter=${this._safeStringify(details.filter)}`)
                if (details.object !== undefined) parts.push(`object=${this._safeStringify(details.object)}`)
                if (details.sort !== undefined) parts.push(`sort=${this._safeStringify(details.sort)}`)
            }
            const detailStr = parts.length ? parts.join(' ') : ''
            console.log(`${operation} ${modelname} in ${elapsedMs.toFixed(3)}ms`, detailStr)
        } else {
            console.log(`${operation} ${modelname} in ${elapsedMs.toFixed(3)}ms`)
        }
    }

}



module.exports = {
    Metrics
}