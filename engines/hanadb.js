const { MultiDbORM } = require("./multidb");

class HanaDB extends MultiDbORM {
  db;
  pool;
  dataMap = {
    id: "VARCHAR(50) NOT NULL PRIMARY KEY",
    string: "NVARCHAR(4000)",
    stringlarge: "NCLOB",
    stringsmall: "NVARCHAR(255)",
    number: "DOUBLE",
    boolean: "BOOLEAN",
    array: "NCLOB",
    object: "NCLOB",
  };

  constructor(credentials) {
    super();
    const hana = require("@sap/hana-client");
    this.db = hana;
    this.conn_params = {
      ...credentials,
      host: credentials.host,
      port: credentials.port,
      serverNode: `${credentials.host}:${credentials.port}`,
      uid: credentials.username,
      pwd: credentials.password,
      databaseName: credentials.database,
      communicationTimeout: credentials.connectionLimit || 60000,
      connectTimeout: credentials.connectionLimit || 60000,
      reconnect: credentials.reconnect ?? true,
      poolOptions: {
        maxPoolSize: credentials.connectionLimit || 10,
        idleTimeout: credentials.timeout || 60000,
      },
    };
    this.pool = hana.createPool(this.conn_params);
    this.db = this.pool;
    this.dbType = "hana";
    this.reqMade = 0;
  }

  async run(query) {
    const that = this;
    this.reqMade++;
    return new Promise((resolve, reject) => {
      var conn = this.pool.getConnection();
      conn.exec(query, (err, result) => {
        conn.disconnect();
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
        if (that.loglevel > 3) {
          console.log("Query", query, "->", result);
        }
      });
    });
  }

  async get(modelname, filter, options) {
    this.metrics.get(modelname, filter, options);
    let where = "";
    for (const key in filter) {
      where += `"${key}" = '${filter[key]}' AND `;
    }
    where += "1 = 1";
    let sort = "";
    if (options) {
      if (options.apply) {
        if (options.apply.ineq) {
          where += ` AND "${options.apply.field}" ${options.apply.ineq.op} '${options.apply.ineq.value}'`;
        }
        if (options.apply.sort) {
          sort = `ORDER BY "${options.apply.field}" ${options.apply.sort}`;
        }
      } else if (options.sort) {
        sort = "ORDER BY";
        for (let i = 0; i < options.sort.length; i++) {
          sort += ` "${options.sort[i].field}" ${options.sort[i].order}`;
          if (i < options.sort.length - 1) {
            sort += ", ";
          }
        }
      }
    }
    const limit = options?.limit ? `LIMIT ${options.limit}` : "";
    const offset = options?.offset ? `OFFSET ${options.offset}` : "";
    const query = `SELECT * FROM ${modelname} WHERE ${where} ${sort} ${limit} ${offset};`;
    return (await this.run(query)) || [];
  }
  escapeSQLValue(value) {
    if (typeof value === "string") {
      return `'${value.replace(/'/g, "''")}'`;
    } else if (value === null || value === undefined) {
      return "NULL";
    }
    return value;
  }
  async getOne(modelname, filter) {
    this.metrics.getOne(modelname, filter);
    let where = "";
    for (const key in filter) {
      where += `"${key}" = '${filter[key]}' AND `;
    }
    where += "1 = 1";
    const query = `SELECT * FROM ${modelname} WHERE ${where} LIMIT 1;`;
    const row = await this.run(query);
    return row[0];
  }

  async create(modelname, sampleObject) {
    this.sync.create(modelname, sampleObject);
    this.metrics.create(modelname, sampleObject);

    let cols = "";
    for (const key in sampleObject) {
      let type;
      if (this.dataMap[sampleObject[key]]) {
        type = this.dataMap[sampleObject[key]];
      } else {
        type = this.dataMap[typeof sampleObject[key]] || "NCLOB";
        if (typeof sampleObject[key] === "string") {
          if (sampleObject[key].length > 4000) {
            type = this.dataMap["stringlarge"];
          }
          if (sampleObject[key].length <= 255) {
            type = this.dataMap["stringsmall"];
          }
        }
      }

      if (key.toLowerCase().trim() === "id") {
        cols += `"${key}" ${type} PRIMARY KEY NOT NULL ,`;
      } else {
        cols += `"${key}" ${type},`;
      }
    }
    cols = cols.substring(0, cols.length - 1);
    const query = `CREATE COLUMN TABLE ${modelname} (${cols});`;
    try {
      return await this.run(query);
    } catch (err) {
      if (this.loglevel > 0) console.log(err);
      throw err;
    }
  }

  async insert(modelname, object) {
    this.sync.insert(modelname, object);
    this.metrics.insert(modelname, object);
    let cols = "";
    let vals = "";
    for (const key in object) {
      cols = cols + `"${key}",`;
      let val = object[key];
      if (typeof val == "object") val = JSON.stringify(object[key]);
      val = this.escapeSQLValue(val);
      if (typeof val == "undefined") vals = vals + `Null,`;
      else if (typeof val == "boolean") vals = vals + `${val},`;
      else if (typeof val == "number") vals = vals + `${val},`;
      else vals = vals + `${val},`;
    }
    cols = cols.slice(0, -1);
    vals = vals.slice(0, -1);

    const query = `INSERT INTO ${modelname} (${cols}) VALUES (${vals});`;

    try {
      return await this.run(query);
    } catch (err) {
      if (err.code && err.code === "259") {
        // Table does not exist
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

    let where = "";
    let vals = "";
    for (const key in filter) {
      where += `"${key}" = '${filter[key]}' AND `;
    }
    for (const key in object) {
      let val = object[key];
      if (typeof val === "object" && val != null)
        val = JSON.stringify(object[key]);
      val = this.escapeSQLValue(val);

      vals += `"${key}" = ${val},`;
    }
    where += "1 = 1";
    vals = vals.slice(0, -1);

    const query = `UPDATE ${modelname} SET ${vals} WHERE ${where};`;
    try {
      return await this.run(query);
    } catch (e) {
      if (this.loglevel > 4) console.log("Error in update", e);
      throw e;
    }
  }

  async delete(modelname, filter) {
    this.sync.delete(modelname, filter);
    this.metrics.delete(modelname, filter);

    let where = "";
    for (const key in filter) {
      where += `"${key}" = '${filter[key]}' AND `;
    }
    where += "1 = 1";
    const query = `DELETE FROM ${modelname} WHERE ${where};`;
    return await this.run(query);
  }

  closePool() {
    return new Promise((resolve, reject) => {
      this.pool.disconnect((err) => {
        if (err) {
          reject(err);
          if (this.loglevel > 1)
            console.error("Error closing connection pool:", err);
        } else {
          resolve();
          if (this.loglevel > 1) console.log("HanaDB: Connection pool closed");
        }
      });
    });
  }
}

module.exports = {
  HanaDB,
};
