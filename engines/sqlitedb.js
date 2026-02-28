const { MultiDbORM } = require("./multidb");
var fs = require("fs");

class SQLiteDB extends MultiDbORM {
  sqlite3;
  dataMap = {
    string: "TEXT",
    number: "REAL",
    boolean: "BOOLEAN",
  };
  constructor(filepath) {
    super();
    var sqlite3 = require("sqlite3");
    this.sqlite3 = sqlite3;
    if (filepath == undefined) filepath = ":memory:";
    else {
      var currentPath = process.cwd();
      if (!fs.existsSync(filepath)) {
        filepath = currentPath + "/" + filepath;
      }
    }
    this.db = new sqlite3.Database(filepath);
    console.log("SQLite3 Initialized");
    this.dbType = "sqlite3";
    this.reqMade = 0;
  }

  async run(query) {
    var db = this.db;
    var that = this;
    this.reqMade++;
    return new Promise(function (resolve, reject) {
      db.all(query, function (err, resp) {
        if (err) reject(err);
        else resolve(resp);
        if (that.loglevel > 3) console.log("Query ", query, " -> ", resp);
      });
    });
  }

  async get(modelname, filter, options) {
    const span = this.metrics.getSpan();
    var where = "";
    for (var key in filter) {
      where = where + `${key} = '${filter[key]}' AND `;
    }
    where = where + " 1 ";
    var sort = "";
    if (options) {
      if (options.apply) {
        if (options.apply.ineq) {
          where =
            where +
            ` AND '${options.apply.field}' ${options.apply.ineq.op} '${options.apply.ineq.value}'`;
        }
        if (options.apply.sort) {
          sort = `ORDER BY ${options.apply.field} ${options.apply.sort}`;
        }
      } else if (options.sort) {
        sort = `ORDER BY`;
        for (let i = 0; i < options.sort.length; i++) {
          sort = sort + ` ${options.sort[i].field} ${options.sort[i].order}`;
          if (i < options.sort.length - 1) {
            sort = sort + " , ";
          }
        }
      }
    }
    var query = `SELECT * FROM ${modelname} WHERE ${where} ${sort} ;`;
    const res = (await this.run(query)) || [];
    this.metrics.get(modelname, filter, options, span);
    return res;
  }

  async getOne(modelname, filter) {
    const span = this.metrics.getOneSpan();
    var where = "";
    for (var key in filter) {
      where = where + `${key} = '${filter[key]}' AND `;
    }
    where = where + " 1 ";
    var query = `SELECT * FROM ${modelname} WHERE ${where} LIMIT 1;`;
    var row = await this.run(query);
    this.metrics.getOne(modelname, filter, span);
    return row[0];
  }

  async create(modelname, sampleObject) {
    this.sync.create(modelname, sampleObject);
    const span = this.metrics.createSpan();

    var cols = "";
    for (var key in sampleObject) {
      var type = this.dataMap[typeof sampleObject[key]] || "TEXT";
      cols = cols + `${key} ${type},`;
    }
    cols = cols.substring(0, cols.length - 1);
    var query = `CREATE TABLE IF NOT EXISTS ${modelname} (${cols});`;
    try {
      const res = await this.run(query);
      this.metrics.create(modelname, sampleObject, span);
      return res;
    } catch (err) {
      console.log(err);
      return undefined;
    }
  }

  async insert(modelname, object) {
    this.sync.insert(modelname, object);
    const span = this.metrics.insertSpan();
    var cols = "";
    var vals = "";
    for (var key in object) {
      cols = cols + `${key},`;
      vals = vals + `'${object[key]}',`;
    }
    cols = cols.substring(0, cols.length - 1);
    vals = vals.substring(0, vals.length - 1);

    var query = `INSERT INTO ${modelname} (${cols}) VALUES(${vals});`;

    try {
      const res = await this.run(query);
      this.metrics.insert(modelname, object, span);
      return res;
    } catch (err) {
      if (
        err.message &&
        err.message.indexOf("SQLITE_ERROR: no such table: ") > -1
      ) {
        await this.create(modelname, object);
        const res = await this.run(query);
        this.metrics.insert(modelname, object, span);
        return res;
      } else throw err;
    }
  }

  async update(modelname, filter, object) {
    this.sync.update(modelname, filter, object);
    const span = this.metrics.updateSpan();

    var where = "";
    var vals = "";
    for (var key in filter) {
      where = where + `${key} = '${filter[key]}' AND `;
    }
    for (var key in object) {
      vals = vals + ` ${key} = '${object[key]}',`;
    }
    where = where + " 1 ";
    vals = vals.substring(0, vals.length - 1);

    var query = `UPDATE ${modelname} SET ${vals} WHERE ${where};`;
    const res = await this.run(query);
    this.metrics.update(modelname, filter, object, span);
    return res;
  }

  async delete(modelname, filter) {
    this.sync.delete(modelname, filter);
    const span = this.metrics.deleteSpan();

    var where = "";
    for (var key in filter) {
      where = where + `${key} = '${filter[key]}' AND `;
    }
    where = where + " 1 ";
    var query = `DELETE FROM ${modelname} WHERE ${where};`;
    const res = await this.run(query);
    this.metrics.delete(modelname, filter, span);
    return res;
  }
}

module.exports = {
  SQLiteDB,
};
