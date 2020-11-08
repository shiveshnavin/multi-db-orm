const bkp = require('./backup')
const rst = require('./restore')

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