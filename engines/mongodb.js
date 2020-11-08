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
 
    async get(modelname, filter) { 
        var snapshot = await this.getdb().collection(modelname).find(filter)  
        return snapshot;

    }

    async getOne(modelname, filter) {
        var snapshot = await this.getdb().collection(modelname).findOne(filter)  
        return snapshot;
    }

    async create(modelname, sampleObject) {
        this.sync.create(modelname, sampleObject)

        if (this.loglevel > 3)
            console.log('CREATE : Not required in DB Type', this.dbType)
    }

    async insert(modelname, object) {
        this.sync.insert(modelname, object)
 
        const collref = this.getdb().collection(modelname)
        try {
            return await collref.insertOne(object);
        } catch (e) {

            throw e;

        }

    }

    async update(modelname, filter, object) {
        this.sync.update(modelname, filter, object)
        var resp = await this.getdb().collection(modelname).updateMany(filter, {$set: object}) 
        return resp;
    }

    async delete(modelname, filter) {
        this.sync.delete(modelname, filter)
        var resp = await this.getdb().collection(modelname).deleteMany(filter)
        return resp;
    }
}



module.exports = {
    MongoDB
}