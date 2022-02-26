const { MultiDbORM } = require("./multidb");
var fs = require('fs')

class SQLiteDB extends MultiDbORM {

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
        else {
            var currentPath = process.cwd();
            if (!fs.existsSync(filepath)) {
                filepath = currentPath + '/' + filepath
            }
        }
        this.db = new sqlite3.Database(filepath);
        console.log("SQLite3 Initialized");
        this.dbType = 'sqlite3'
        this.reqMade = 0
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

    async get(modelname, filter, options) {
        this.metrics.get(modelname, filter, options)
        var where = ''
        for (var key in filter) {
            where = where + `${key} = '${filter[key]}' AND `
        }
        where = where + " 1 ";
        var sort = "";
        if (options) {
            if (options.apply) {
                if (options.apply.ineq) {
                    where = where + ` AND '${options.apply.field}' ${options.apply.ineq.op} '${options.apply.ineq.value}'`;
                }
                if (options.apply.sort) {
                    sort = `ORDER BY ${options.apply.field} ${options.apply.sort}`
                }
            }
            else if (options.sort) {
                sort = `ORDER BY`
                for (let i = 0; i < options.sort.length; i++) {
                    sort = sort + ` ${options.sort[i].field} ${options.sort[i].order}`;
                    if (i < options.sort.length - 1) {
                        sort = sort + ' , ';
                    }

                }
            }
        }
        var query = `SELECT * FROM ${modelname} WHERE ${where} ${sort} ;`
        return await this.run(query)
    }

    async getOne(modelname, filter) {
        this.metrics.getOne(modelname, filter)
        var where = ''
        for (var key in filter) {
            where = where + `${key} = '${filter[key]}' AND `
        }
        where = where + " 1 ";
        var query = `SELECT * FROM ${modelname} WHERE ${where} LIMIT 1;`
        var row = await this.run(query)
        return row[0];
    }

    async create(modelname, sampleObject) {
        this.sync.create(modelname, sampleObject)
        this.metrics.create(modelname, sampleObject)

        var cols = ''
        for (var key in sampleObject) {
            var type = this.dataMap[typeof (sampleObject[key])] || 'TEXT'
            cols = cols + `${key} ${type},`
        }
        cols = cols.substring(0, cols.length - 1)
        var query = `CREATE TABLE IF NOT EXISTS ${modelname} (${cols});`
        try {
            return await this.run(query)
        } catch (err) {
            console.log(err)
            return undefined;
        }
    }

    async insert(modelname, object) {
        this.sync.insert(modelname, object)
        this.metrics.insert(modelname, object)
        var cols = ''
        var vals = ''
        for (var key in object) {
            cols = cols + `${key},`
            vals = vals + `'${object[key]}',`
        }
        cols = cols.substring(0, cols.length - 1)
        vals = vals.substring(0, vals.length - 1)

        var query = `INSERT INTO ${modelname} (${cols}) VALUES(${vals});`

        try {
            return await this.run(query)
        } catch (err) {
            if (err.message && err.message.indexOf('SQLITE_ERROR: no such table: ') > -1) {
                await this.create(modelname, object);
                return await this.run(query)
            }
            else
                throw err;
        }
    }

    async update(modelname, filter, object) {
        this.sync.update(modelname, filter, object)
        this.metrics.update(modelname, filter, object)

        var where = ''
        var vals = ''
        for (var key in filter) {
            where = where + `${key} = '${filter[key]}' AND `
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
        this.sync.delete(modelname, filter)
        this.metrics.delete(modelname, filter)

        var where = ''
        for (var key in filter) {
            where = where + `${key} = '${filter[key]}' AND `
        }
        where = where + " 1 ";
        var query = `DELETE FROM ${modelname} WHERE ${where};`
        return await this.run(query)
    }
}



module.exports = {
    SQLiteDB
}