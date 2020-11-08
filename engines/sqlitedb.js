const { MultiDBSafe } = require("./multidb");

class SQLiteDB extends MultiDBSafe {

    sqlite3
    dataMap = {
        "string": "TEXT",
        "number": "REAL"
    }
    constructor(filepath) {
        super()
        var sqlite3 = require('sqlite3')
        this.sqlite3 = sqlite3
        if (filepath == undefined)
            filepath = ':memory:'
        this.db = new sqlite3.Database(filepath);
        console.log("SQLite3 Initialized");
        this.dbType='sqlite3'
        this.reqMade=0
    }

    async run(query) {
        var db = this.db;
        var that = this
        this.reqMade++
        return new Promise(function (resolve, reject) {
            db.all(query, function (err, resp) {
                if (err)
                    reject(err)
                else
                    resolve(resp);
                if (that.loglevel > 3)
                    console.log("Query ", query, ' -> ', resp)
            });
        })


    }

    async get(modelname, filter) {
        var where = ''
        for (var key in filter) {
            where = where + `${key} = '${filter[key]}' AND`
        }
        where = where + " 1 ";
        var query = `SELECT * FROM ${modelname} WHERE ${where};`
        return await this.run(query)
    }

    async getOne(modelname, filter) {
        var where = ''
        for (var key in filter) {
            where = where + `${key} = '${filter[key]}' AND`
        }
        where = where + " 1 ";
        var query = `SELECT * FROM ${modelname} WHERE ${where} LIMIT 1;`
        var row= await this.run(query)
        return row[0];
    }

    async create(modelname, sampleObject) {
        this.sync.create(modelname,sampleObject)

        var cols = ''
        for (var key in sampleObject) {
            var type = this.dataMap[typeof (sampleObject[key])] || 'TEXT'
            cols = cols + `${key} ${type},`
        }
        cols = cols.substring(0, cols.length - 1)
        var query = `CREATE TABLE ${modelname} (${cols});`
        try {
            return await this.run(query)
        } catch (err) {
            console.log(err)
            return undefined;
        }
    }

    async insert(modelname, object) {
        this.sync.insert(modelname,object)
        var cols = ''
        var vals = ''
        for (var key in object) {
            cols = cols + `${key},`
            vals = vals + `'${object[key]}',`
        }
        cols = cols.substring(0, cols.length - 1)
        vals = vals.substring(0, vals.length - 1)

        var query = `INSERT INTO ${modelname} (${cols}) VALUES(${vals});`
        return await this.run(query)
    }

    async update(modelname, filter, object) {
        this.sync.update(modelname,filter,object)

        var where = ''
        var vals=''
        for (var key in filter) {
            where = where + `${key} = ${filter[key]} AND`
        }
        for (var key in object) {
            vals = vals + ` ${key} = '${object[key]}',`
        }
        where = where + " 1 ";
        vals = vals.substring(0, vals.length - 1)

        var query = `UPDATE ${modelname} SET ${vals} WHERE ${where};`
        return await this.run(query)
    }

    async delete(modelname, filter) {
        this.sync.delete(modelname,filter)

        var where = ''
        for (var key in filter) {
            where = where + `${key} = ${filter[key]} AND`
        }
        where = where + " 1 ";
        var query = `DELETE FROM ${modelname} WHERE ${where};`
        return await this.run(query)
    }
}



module.exports = {
    SQLiteDB
}