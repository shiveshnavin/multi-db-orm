const { MultiDbORM } = require("./multidb");
const { Metrics } = require("./metrics");
const { Sync } = require("../sync");
// const { MultiDbORM } = require('./multidb');

class BigQueryDB {
  sync = new Sync();
  metrics = new Metrics();
  bq;
  serviceAccount;
  loglevel = 0;
  constructor(serviceAccountObject, datasetname) {
    // super();
    this.serviceAccount = serviceAccountObject;

    const { BigQuery } = require("@google-cloud/bigquery");

    this.datasetname = datasetname;
    this.bq = new BigQuery({
      credentials: serviceAccountObject,
      projectId: serviceAccountObject.project_id,
    });
    this.dbType = "bigquery";
    this.reqMade = 0;
    this.db = this.bq;
  }

  sleep(timeout) {
    return new Promise((resolve) => {
      setTimeout(resolve, timeout);
    });
  }

  async run(query) {
    this.reqMade++;
    try {
      const [job] = await this.bq.createQueryJob({ query });
      const [rows] = await job.getQueryResults();
      if (this.loglevel > 3) {
        console.log("Query ", query, " -> ", rows);
      }
      return rows;
    } catch (err) {
      if (this.loglevel > 0) {
        console.error("BigQuery Error:", query, " -> ", err);
      }
      throw err;
    }
  }

  mapToKV(key, value) {
    let kv;
    switch (typeof value) {
      case "string":
        kv = `${key} = '${value}'`;
        break;
      case "number":
      case "boolean":
        kv = `${key} = ${value}`;
        break;
      case "object":
        kv = `${key} = '${JSON.stringify(value)}'`;
        break;
      default:
        kv = `${key} = '${value}'`;
    }
    return kv;
  }

  constructWhereClause(filter) {
    return (
      Object.entries(filter)
        .map(([key, value]) => this.mapToKV(key, value))
        .join(" AND ") + " AND TRUE"
    );
  }

  async get(modelname, filter, options) {
    this.metrics.get(modelname, filter, options);
    var where = this.constructWhereClause(filter);
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
    let limit = "";
    let offset = "";
    if (options?.limit) {
      limit = `LIMIT ${options.limit}`;
    }
    if (options?.offset) {
      offset = `OFFSET ${options.offset}`;
    }
    var query = `SELECT * FROM \`${this.datasetname}\`.${modelname} WHERE ${where} ${sort} ${limit} ${offset};`;
    return await this.run(query);
  }

  async getOne(modelname, filter) {
    this.metrics.getOne(modelname, filter);
    let where = this.constructWhereClause(filter);
    let query = `SELECT * FROM \`${this.datasetname}.${modelname}\` WHERE ${where} LIMIT 1;`;
    let rows = await this.run(query);
    return rows[0];
  }

  async create(modelname, sampleObject) {
    this.sync.create(modelname, sampleObject);
    this.metrics.create(modelname, sampleObject);

    let schema = Object.entries(sampleObject).map(([key, value]) => {
      let type;
      switch (typeof value) {
        case "string":
          type = value.length > 255 ? "STRING" : "STRING";
          break;
        case "number":
          type = "FLOAT";
          break;
        case "boolean":
          type = "BOOL";
          break;
        case "object":
          type = "STRING";
          break;
        default:
          type = "STRING";
      }
      return { name: key, type: type };
    });

    const table = this.bq.dataset(this.datasetname).table(modelname);
    try {
      await table.create({ schema });
    } catch (err) {
      if (err.code !== 409) {
        if (this.loglevel > 0) console.error(err);
        throw err;
      }
    }
  }

  async insert(modelname, object) {
    this.sync.insert(modelname, object);
    this.metrics.insert(modelname, object);
    Object.keys(object).forEach((k) => {
      if (typeof object[k] == "object") object[k] = JSON.stringify(object[k]);
    });
    const table = this.bq.dataset(this.datasetname).table(modelname);
    try {
      await table.insert(object);
    } catch (err) {
      if (this.loglevel > 0) console.error(err);
      throw err;
    }
  }

  async update(modelname, filter, object) {
    this.sync.update(modelname, filter, object);
    this.metrics.update(modelname, filter, object);

    let where = this.constructWhereClause(filter);
    let setClauses = Object.entries(object)
      .map(([key, value]) => `${key} = '${JSON.stringify(value)}'`)
      .join(", ");

    let query = `UPDATE \`${this.datasetname}.${modelname}\` SET ${setClauses} WHERE ${where};`;
    try {
      await this.run(query);
    } catch (err) {
      if (err.message?.indexOf("would affect rows in the streaming buffer")) {
        return this.withRetry(() => {
          return this.run(query);
        });
      }
      if (this.loglevel > 4) console.error("Error in update", err);
      throw err;
    }
  }

  async delete(modelname, filter) {
    this.sync.delete(modelname, filter);
    this.metrics.delete(modelname, filter);

    let where = this.constructWhereClause(filter);
    let query = `DELETE FROM \`${this.datasetname}.${modelname}\` WHERE ${where};`;
    try {
      return await this.run(query);
    } catch (err) {
      if (err.message?.indexOf("would affect rows in the streaming buffer")) {
        return this.withRetry(() => {
          return this.run(query);
        });
      }
      if (this.loglevel > 4) console.error("Error in delete", err);
      throw err;
    }
  }

  async withRetry(funct, delay = 100, times = 0) {
    let ct = 0;
    while (true) {
      try {
        await this.sleep(delay);
        return await funct();
      } catch (e) {
        if (ct++ > times) throw e;
      }
    }
  }

  async close() {
    if (this.loglevel > 1) {
      console.log("BigQueryDB: Cleanup complete");
    }
  }
}

module.exports = {
  BigQueryDB,
};
