try {
    var bkp = require('./backup')
    var rst = require('./restore')
} catch (e) {
    console.log('Warning : Multi region sync not enabled.' )
}

class Sync {

    loglevel = 1

    constructor(){
        
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

    backup(...args) {
        bkp(args)
    }

    restore(...args) {
        rst(args)
    }
}



module.exports = {
    Sync
}