const { MultiDbORM } = require("./multidb");

function removeUndefined(obj) {
    try {

        Object.keys(obj).forEach(function (key) {
            if (typeof obj[key] === 'undefined') {
                delete obj[key];
            }
        });
        return obj
    } catch (e) {
        console.log('Error in sanitizing update of object ! ', e.message)
    }
}

class FireStoreDB extends MultiDbORM {

    admin
    serviceAccount
    constructor(serviceAccount,appname) {
        super()

        var admin = require('firebase-admin');
        this.serviceAccount = serviceAccount;

        if(appname){
              admin = admin.initializeApp({
                credential: admin.credential.cert(this.serviceAccount),
                databaseURL: `https://${this.serviceAccount.project_id}.firebaseio.com`
             },appname);
        }else
            admin = admin.initializeApp({
                credential: admin.credential.cert(this.serviceAccount),
                databaseURL: `https://${this.serviceAccount.project_id}.firebaseio.com`
            });

        const db = admin.firestore();
        this.db = db
        this.admin = admin
        console.log("Firestore Initialized");
        this.dbType = 'firestore'
    }

    async run(query) {
        if (this.loglevel > 3)
            console.log('RUN : Not Supported in DB Type', this.dbType)
    }

    attachOptions(modelref, options) {

        if (options.apply) {
            if (options.apply.ineq) {
                modelref = modelref.where(options.apply.field, options.apply.ineq.op, options.apply.ineq.value)
            }
            if (options.apply.sort) {
                modelref = modelref.orderBy(options.apply.field, options.apply.sort)
            }
        }
        else if (options.sort) {
            options.sort.forEach(srt => {
                modelref = modelref.orderBy(srt.field, srt.order)
            });
        }
        if (options.limit) {
            modelref = modelref.limit(options.limit)
        }

        if (options.offset) {
            modelref = modelref.offset(options.offset)
        }

        return modelref;
    }

    async _get(modelname, filter, options) {

        const modelref = this.getdb().collection(modelname);
        var where = modelref
        for (var key in filter) {
            where = where.where(key, '==', filter[key])
        }
        if (options) {
            where = this.attachOptions(where, options);
        }
        const snapshot = await where.get();
        if (snapshot.empty) {
            return;
        }

        return snapshot;
    }

    async get(modelname, filter, options) {
        var result = []
        var snapshot = await this._get(modelname, filter, options)
        if (snapshot == undefined)
            return []
        this.metrics.get(modelname, filter, options)
        let that = this;
        snapshot.forEach(doc => {
            that.metrics.getOne(modelname, filter, options);
            result.push(doc.data())
        });
        if (this.loglevel > 2)
            console.log('Retrieved ', result)

        return result;

    }

    async getOne(modelname, filter, id, options) {
        var idx = id || filter.id
        if (idx) {
            this.metrics.getOne(modelname, filter, options);
            const modelref = this.getdb().collection(modelname).doc(idx);
            const doc = await modelref.get();
            if (this.loglevel > 2)
                console.log('Retrieved ', doc.data())
            return doc.data();

        }
        else {
            var rows = await this.get(modelname, filter, options)
            if (rows != undefined) {
                if (this.loglevel > 2)
                    console.log('Retrieved ', rows[0])
                return rows[0]
            }
            else {
                return undefined;
            }
        }
    }

    async create(modelname, sampleObject) {
        this.sync.create(modelname, sampleObject)
        this.metrics.create(modelname, sampleObject);

        if (this.loglevel > 3)
            console.log('CREATE : Not required in DB Type', this.dbType)
    }

    async insert(modelname, object, id) {
        this.sync.insert(modelname, object, id)
        this.metrics.insert(modelname, object, id)

        var db = this.getdb();
        var idx = id || object.id || Date.now()
        const docref = db.collection(modelname).doc("" + idx);
        try {
            removeUndefined(object)
            return await docref.set(object);
        } catch (e) {

            if (e.message.indexOf("Firestore doesn't support JavaScript objects with custom prototypes") > -1) {
                return await docref.set(JSON.parse(JSON.stringify(object)));
            }
            else {
                throw e;
            }

        }

    }

    async update(modelname, filter, object, id) {
        this.sync.update(modelname, filter, object, id)

        var idx = id || filter.id || object.id


        try {
            removeUndefined(object)
            if (idx) {
                this.metrics.update(modelname, filter, object, id)
                await this.getdb().collection(modelname).doc(idx).update(object);

            } else {
                var snaps = await this._get(modelname, filter)
                let that = this;
                snaps.forEach(async function (element) {
                    that.metrics.getOne(modelname, filter, id)
                    that.metrics.update(modelname, filter, object, id)
                    await element.ref.update(object)
                });
            }
        } catch (e) {

            if (e.message.indexOf("Firestore doesn't support JavaScript objects with custom prototypes") > -1) {
                return await this.update(modelname, filter, JSON.parse(JSON.stringify(object)), id);
            }
            else {
                throw e;
            }
        }

    }

    async delete(modelname, filter, id) {
        this.sync.delete(modelname, filter, id)


        var idx = id || filter.id

        if (idx) {
            this.metrics.delete(modelname, filter, id)
            await this.getdb().collection(modelname).doc(idx).delete();

        } else {
            var snaps = await this._get(modelname, filter)
            let that = this;
            snaps.forEach(async function (element) {
                that.metrics.getOne(modelname, filter, id)
                that.metrics.delete(modelname, filter, id)
                await element.ref.delete();
            });
        }
    }
}



module.exports = {
    FireStoreDB
}
