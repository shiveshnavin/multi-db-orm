const { MultiDbORM } = require('./multidb');

class MySQLDB extends MultiDbORM {

    mysql;
    pool;
    dataMap = {
        "id": "VARCHAR(50) NOT NULL PRIMARY KEY",
        "string": "VARCHAR(4000)",
        "stringlarge": "TEXT",
        "stringsmall": "VARCHAR(255)",
        "number": "DOUBLE",
        "boolean": "BOOL",
        "array": "TEXT",
        "object": "JSON"
    };

    constructor(credentials) {
        super();
        const mysql = require('mysql');
        this.mysql = mysql;
        this.pool = mysql.createPool({
            connectionLimit: credentials.connectionLimit || 10,
            host: credentials.host,
            port: credentials.port,
            user: credentials.username,
            password: credentials.password,
            database: credentials.database,
            waitForConnections: true,
            queueLimit: 0,
            connectTimeout: credentials.connectTimeout || 10000,
            acquireTimeout: credentials.acquireTimeout || 10000,
            timeout: credentials.timeout || 60000
        });
        this.db = this.pool
        this.pool.on('connection', (connection) => {
            if (this.loglevel > 1)
                console.log('MySQLDB: New connection acquired');
        });

        this.pool.on('error', (err) => {
            if (this.loglevel > 0)
                console.error('MySQLDB: Pool error:', err);
        });

        this.dbType = 'mysql';
        this.reqMade = 0;
    }

    async run(query) {
        var that = this;
        this.reqMade++;
        return new Promise(function (resolve, reject) {
            that.pool.query(query, function (err, results) {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
                if (that.loglevel > 3) {
                    console.log("Query ", query, ' -> ', results);
                }
            });
        });
    }

    async get(modelname, filter, options) {
        this.metrics.get(modelname, filter, options);
        var where = '';
        for (var key in filter) {
            where = where + `${key} = '${filter[key]}' AND `;
        }
        where = where + " 1 ";
        var sort = "";
        if (options) {
            if (options.apply) {
                if (options.apply.ineq) {
                    where = where + ` AND '${options.apply.field}' ${options.apply.ineq.op} '${options.apply.ineq.value}'`;
                }
                if (options.apply.sort) {
                    sort = `ORDER BY ${options.apply.field} ${options.apply.sort}`;
                }
            } else if (options.sort) {
                sort = `ORDER BY`;
                for (let i = 0; i < options.sort.length; i++) {
                    sort = sort + ` ${options.sort[i].field} ${options.sort[i].order}`;
                    if (i < options.sort.length - 1) {
                        sort = sort + ' , ';
                    }
                }
            }
        }
        let limit = ''
        let offset = ''
        if(options?.limit){
            limit = `LIMIT ${options.offset}`
        }
        if(options?.offset){
            offset = `OFFSET ${options.offset}`
        }
        var query = `SELECT * FROM ${modelname} WHERE ${where} ${sort} ${limit} ${offset};`;
        return await this.run(query);
    }

    async getOne(modelname, filter) {
        this.metrics.getOne(modelname, filter);
        var where = '';
        for (var key in filter) {
            where = where + `${key} = '${filter[key]}' AND `;
        }
        where = where + " 1 ";
        var query = `SELECT * FROM ${modelname} WHERE ${where} LIMIT 1;`;
        var row = await this.run(query);
        return row[0];
    }

    async create(modelname, sampleObject) {
        this.sync.create(modelname, sampleObject);
        this.metrics.create(modelname, sampleObject);

        var cols = '';
        for (var key in sampleObject) {
            var type;
            if (this.dataMap[sampleObject[key]]) {
                type = this.dataMap[sampleObject[key]]
            } else {
                type = this.dataMap[typeof (sampleObject[key])] || 'TEXT';
                if (typeof (sampleObject[key]) == 'string') {
                    if (sampleObject[key].length > 4000) {
                        type = this.dataMap['stringlarge']
                    }
                    if (sampleObject[key].length <= 255) {
                        type = this.dataMap['stringsmall']
                    }
                }
            }
            cols = cols + `${key} ${type},`;
        }
        cols = cols.substring(0, cols.length - 1);
        var query = `CREATE TABLE IF NOT EXISTS ${modelname} (${cols});`;
        try {
            return await this.run(query);
        } catch (err) {
            if (this.loglevel > 0)
                console.log(err);
            throw err
        }
    }

    async insert(modelname, object) {
        this.sync.insert(modelname, object);
        this.metrics.insert(modelname, object);
        var cols = '';
        var vals = '';
        for (var key in object) {
            cols = cols + `${key},`;
            let val = object[key]
            if (typeof val == 'object')
                val = JSON.stringify(object[key])
            if (typeof val == "undefined")
                vals = vals + `Null,`;
            else if (typeof val == 'boolean')
                vals = vals + `${val},`;
            else
                vals = vals + `'${val}',`;
        }
        cols = cols.substring(0, cols.length - 1);
        vals = vals.substring(0, vals.length - 1);

        var query = `INSERT INTO ${modelname} (${cols}) VALUES(${vals});`;

        try {
            return await this.run(query);
        } catch (err) {
            if (err.code && err.code === 'ER_NO_SUCH_TABLE') {
                await this.create(modelname, object);
                return await this.run(query);
            } else {
                throw err;
            }
        }
    }

    async update(modelname, filter, object) {
        this.sync.update(modelname, filter, object);
        this.metrics.update(modelname, filter, object);

        var where = '';
        var vals = '';
        for (var key in filter) {
            where = where + `${key} = '${filter[key]}' AND `;
        }
        for (var key in object) {
            let val = object[key]
            if ( val == "undefined" ||  val == undefined ||  val == 'null'||  val == null)
                vals = vals + `${key} = Null,`;
            else if (typeof val == 'object')
                val = vals + `${key} = '${JSON.stringify(object[key])}',`
            else if (typeof val == 'boolean')
                vals = vals + `${key} = ${val},`;
            else
                vals = vals + `${key} = '${val}',`;
        }
        where = where + " 1 ";
        vals = vals.substring(0, vals.length - 1);

        var query = `UPDATE ${modelname} SET ${vals} WHERE ${where};`;
        return await this.run(query);
    }

    async delete(modelname, filter) {
        this.sync.delete(modelname, filter);
        this.metrics.delete(modelname, filter);

        var where = '';
        for (var key in filter) {
            where = where + `${key} = '${filter[key]}' AND `;
        }
        where = where + " 1 ";
        var query = `DELETE FROM ${modelname} WHERE ${where};`;
        return await this.run(query);
    }

    closePool() {
        return new Promise((res, rej) => {
            this.pool.end((err) => {
                if (err) {
                    rej(err)
                    if (this.loglevel > 1)
                        console.error('Error closing connection pool:', err);
                } else {
                    res()
                    if (this.loglevel > 1)
                        console.log('MySQLDB: Connection pool closed');
                }
            });
        })
    }
}

module.exports = {
    MySQLDB
};
