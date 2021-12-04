const { MultiDbORM } = require("./multidb");

class MongoDB extends MultiDbORM {

    mongodbname
    dbc
    client
    url
    constructor(secureUrl, mongodbname) {
        super()

        this.url = secureUrl;
        this.mongodbname = mongodbname

        const MongoClient = require('mongodb').MongoClient;
        this.client = new MongoClient(this.url, {
            useUnifiedTopology: true,
            useNewUrlParser: true
        });
        this._connect();
    }

    async _close() {
        this.dbc.close();
    }

    async _connect() {
        var dbc = await this.client.connect();
        this.dbc = dbc;
        this.db = dbc.db(this.mongodbname);
        console.log("MongoDB Initialized");
        this.dbType = 'mongodb'
    }

    async run(query) {
        if (this.loglevel > 3)
            console.log('RUN : Not Supported in DB Type', this.dbType)
    }
    _inq2mongop(symbol) {
        switch (symbol) {
            case "=":
                return "$eq";
            case ">":
                return "$gt";
            case ">=":
                return "$gte";
            case "<":
                return "$lt";
            case "<=":
                return "$lte";
            case "!=":
                return "$ne";
        }
    }
    async get(modelname, filter, options) {
        this.metrics.get(modelname, filter, options);
        if (options && options.apply && options.apply.ineq) {
            filter[`${options.apply.field}`] = {};
            filter[`${options.apply.field}`][`${this._inq2mongop(options.apply.ineq.op)}`] = options.apply.ineq.value
        }
        var crs = this.getdb().collection(modelname).find(filter);
        if (options) {
            if (options.apply) {
                if (options.apply.sort) {
                    var order = 1;
                    if (options.apply.sort == 'desc') {
                        order = -1;
                    }
                    var sortOption = {};
                    sortOption[`${options.apply.field}`] = order;
                    crs = crs.sort(sortOption);
                }

            } else if (options.sort) {

                var sortOption = {};
                options.sort.forEach(srt => {
                    var order = 1;
                    if (srt.order == 'desc') {
                        order = -1;
                    }
                    sortOption[`${srt.field}`] = order;
                });
                crs = crs.sort(sortOption);
            }

            if (options.limit) {
                crs.limit(options.limit)
            }

            if (options.offset) {
                crs.skip(options.offset)
            }
        }

        var snapshot = await crs.toArray()
        return snapshot;

    }

    async getOne(modelname, filter, options) {
        this.metrics.getOne(modelname, filter, options);
        var snapshot = await this.getdb().collection(modelname).findOne(filter)
        return snapshot;
    }

    async create(modelname, sampleObject) {
        this.sync.create(modelname, sampleObject)
        this.metrics.create(modelname, sampleObject);

        if (this.loglevel > 3)
            console.log('CREATE : Not required in DB Type', this.dbType)
    }

    async insert(modelname, object) {
        this.sync.insert(modelname, object)
        this.metrics.insert(modelname, object)

        const collref = this.getdb().collection(modelname)
        try {
            return await collref.insertOne(object);
        } catch (e) {

            throw e;

        }

    }

    async update(modelname, filter, object) {
        this.sync.update(modelname, filter, object)
        this.metrics.update(modelname, filter, object)
        var resp = await this.getdb().collection(modelname).updateMany(filter, { $set: object })
        return resp;
    }

    async delete(modelname, filter) {
        this.sync.delete(modelname, filter)
        this.metrics.delete(modelname, filter)
        var resp = await this.getdb().collection(modelname).deleteMany(filter)
        return resp;
    }
}



module.exports = {
    MongoDB
}