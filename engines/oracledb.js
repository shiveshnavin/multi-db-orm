const path = require("path");
const { MultiDbORM } = require("./multidb");
var fs = require('fs')
const os = require('os');

class OracleDB extends MultiDbORM {

    connection_pool_name
    schema
    pool_creation
    dataMap = {
        "id": "VARCHAR(50) NOT NULL PRIMARY KEY",
        "string": "VARCHAR2(4000)",
        "number": "NUMBER",
        "boolean": "VARCHAR(5)",
        "array": "CLOB",
        "object": "CLOB",
    }


    static async initOracleLibraries() {

    }

    constructor({
        username,
        password,
        net_service_name,
        wallet_dir,
        connection_pool_name,
        wallet_password,
        lib_dir }) {
        super()
        const oracledb = require('oracledb')
        const oracleInstantClient = require("oracle-instantclient");
        if (!wallet_password)
            wallet_password = password
        process.env.LD_LIBRARY_PATH = lib_dir || oracleInstantClient.path
        process.env.TS_ADMIN = wallet_dir
        oracledb.initOracleClient({
            configDir: wallet_dir,
            libDir: lib_dir || oracleInstantClient.path
        })
        oracledb.autoCommit = true;
        oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT
        oracledb.fetchAsString = [oracledb.CLOB];

        this.connection_pool_name = connection_pool_name || username
        this.db = oracledb
        this.schema = username

        let sqlnetora = path.join(wallet_dir, 'sqlnet.ora')
        let configString = fs.readFileSync(sqlnetora).toString()
        const regex = /DIRECTORY="([^"]*)"/;
        let walletDirPath = wallet_dir
        if (os.platform() == 'win32')
            walletDirPath = wallet_dir.split("\\").join("\\\\")
        configString = configString.replace(regex, `DIRECTORY="${walletDirPath}"`);
        fs.writeFileSync(sqlnetora, configString)

        this.pool_creation = oracledb.createPool({
            user: username,
            password: password,
            configDir: wallet_dir,
            walletLocation: wallet_dir,
            walletPassword: wallet_password,
            connectString: net_service_name,
            poolAlias: this.connection_pool_name
        }).then(async (pool) => {
            console.log(`OracleDB Initialized`);
        }).catch(e => {
            console.log("Error initializing oracle DB: " + e.message)
            throw e
        })

        this.dbType = 'oracle'
        this.reqMade = 0
    }

    async connect() {
        await this.pool_creation
    }

    async run(query) {
        let connection
        var that = this
        this.reqMade++
        return new Promise(async function (resolve, reject) {
            try {
                connection = await that.db.getConnection(that.connection_pool_name);
                let resp = await connection.execute(query)
                resolve(resp);
                if (that.loglevel > 3)
                    console.log("Query ", query, ' -> ', resp)

            } catch (err) {
                reject(err)
            } finally {
                if (connection) {
                    try {
                        await connection.close();
                    } catch (err) {
                        throw (err);
                    }
                }
            }
        })


    }

    async get(modelname, filter, options) {
        const span = this.metrics.getSpan()
        var where = ''
        for (var key in filter) {
            where = where + `"${key}" = '${filter[key]}' AND `
        }
        where = where + " 1 = 1 ";
        var sort = "";
        if (options) {
            if (options.apply) {
                if (options.apply.ineq) {
                    where = where + ` AND "${options.apply.field}" ${options.apply.ineq.op} '${options.apply.ineq.value}'`;
                }
                if (options.apply.sort) {
                    sort = `ORDER BY "${options.apply.field}" ${options.apply.sort}`
                }
            }
            else if (options.sort) {
                sort = `ORDER BY`
                for (let i = 0; i < options.sort.length; i++) {
                    sort = sort + ` "${options.sort[i].field}" ${options.sort[i].order}`;
                    if (i < options.sort.length - 1) {
                        sort = sort + ' , ';
                    }

                }
            }
        }
        var query = `SELECT * FROM ${modelname} WHERE ${where} ${sort} `
        var row = await this.run(query)
        this.metrics.get(modelname, filter, options, span)

        return row.rows
    }

    async getOne(modelname, filter) {
        const span = this.metrics.getOneSpan()
        var where = ''
        for (var key in filter) {
            where = where + `"${key}" = '${filter[key]}' AND `
        }
        where = where + " 1 = 1 ";
        var query = `SELECT * FROM ${modelname} WHERE ${where} AND rownum < 2`
        var row = await this.run(query)
        this.metrics.getOne(modelname, filter, span)
        return row.rows[0];
    }

    async create(modelname, sampleObject) {
        this.sync.create(modelname, sampleObject)
        const span = this.metrics.createSpan()

        var cols = ''
        for (var key in sampleObject) {
            var type = this.dataMap[typeof (sampleObject[key])] || 'VARCHAR(4000)'
            if (Array.isArray(sampleObject[key])) {
                type = this.dataMap['array']
            }
            if (key == 'id') {
                type = this.dataMap['id']
            }
            cols = cols + `"${key}" ${type}, `
        }
        cols = cols.substring(0, cols.length - 2)
        var query = `CREATE TABLE ${modelname} (${cols})`
        try {
            const res = await this.run(query)
            this.metrics.create(modelname, sampleObject, span)
            return res
        } catch (err) {
            if (!err.message.indexOf("name is already used")) {
                console.log(err)
            }
            return undefined;
        }
    }

    async insert(modelname, object) {
        this.sync.insert(modelname, object)
        const span = this.metrics.insertSpan()
        var cols = ''
        var vals = ''
        for (var key in object) {
            cols = cols + `"${key}",`
            let value = object[key]
            if (typeof value == 'object')
                value = JSON.stringify(value)
            vals = vals + `'${value}',`
        }
        cols = cols.substring(0, cols.length - 1)
        vals = vals.substring(0, vals.length - 1)

        var query = `INSERT INTO ${modelname} (${cols}) VALUES(${vals})`

        try {
            const res = await this.run(query)
            this.metrics.insert(modelname, object, span)
            return res
        } catch (err) {
            if (err.message && err.message.indexOf('SQLITE_ERROR: no such table: ') > -1) {
                await this.create(modelname, object);
                const res = await this.run(query)
                this.metrics.insert(modelname, object, span)
                return res
            }
            else
                throw err;
        }
    }

    async update(modelname, filter, object) {
        this.sync.update(modelname, filter, object)
        const span = this.metrics.updateSpan()

        this.metrics.update(modelname, filter, object)

        var where = ''
        var vals = ''
        for (var key in filter) {
            where = where + `"${key}" = '${filter[key]}' AND `
        }
        for (var key in object) {
            vals = vals + ` "${key}" = '${object[key]}',`
        }
        where = where + " 1 = 1";
        vals = vals.substring(0, vals.length - 1)

        var query = `UPDATE ${modelname} SET ${vals} WHERE ${where}`
        const res = await this.run(query)
        this.metrics.update(modelname, filter, object, span)
        return res
    }

    async delete(modelname, filter) {
        this.sync.delete(modelname, filter)
        const span = this.metrics.deleteSpan()

        this.metrics.delete(modelname, filter)

        var where = ''
        for (var key in filter) {
            where = where + `"${key}" = '${filter[key]}' AND `
        }
        where = where + " 1 = 1";
        var query = `DELETE FROM ${modelname} WHERE ${where}`
        const res = await this.run(query)
        this.metrics.delete(modelname, filter, span)
        return res
    }
}



module.exports = {
    OracleDB
}