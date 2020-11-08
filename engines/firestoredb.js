const { model } = require("mongoose");
const { MultiDBSafe } = require("./multidb");

class FireStoreDB extends MultiDBSafe {

    admin
    serviceAccount
    constructor(serviceAccountKeypath) {
        super()

        const admin = require('firebase-admin');
        this.serviceAccount = require(serviceAccountKeypath);

        admin.initializeApp({
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
        console.log('RUN : Not Supported in DB Type', this.dbType)
    }

    async _get(modelname,filter){

        const modelref = this.getdb().collection(modelname);
        var where = modelref
        for (var key in filter) {
            where = where.where(key, '==', filter[key])
        }
        const snapshot = await where.get();
        if (snapshot.empty) {
            return;
        }
      
        return snapshot;
    }

    async get(modelname, filter) {
        var result = []
        var snapshot=await this._get(modelname,filter)
        if(snapshot==undefined)
            return []
        snapshot.forEach(doc => {
            result.push(doc.data())
        });
        if (this.loglevel > 2)
            console.log('Retrieved ', result)

        return result;

    }

    async getOne(modelname, filter, id) {
        var idx = id || filter.id
        if (idx) {

            const modelref = this.getdb().collection(modelname).doc(idx);
            const doc = await modelref.get();
            if (this.loglevel > 2)
                console.log('Retrieved ', doc.data())
            return doc.data();

        }
        else {
            var rows = await this.get(modelname, filter)
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
        this.sync.create(modelname,sampleObject)

        console.log('CREATE : Not required in DB Type', this.dbType)
    }

    async insert(modelname, object, id) {
        this.sync.insert(modelname,object,id)

        var db = this.getdb();
        var idx = id || object.id || Date.now()
        const docref = db.collection(modelname).doc("" + idx);
        try {
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

    async update(modelname, filter, object,id) {
        this.sync.update(modelname,filter,object,id)

        var idx = id || filter.id || object.id

        if(idx){

            await this.getdb().collection(modelname).doc(idx).update(object);

        }else{
            var snaps=await this._get(modelname,filter)
            snaps.forEach(async function (element) {
                await element.ref.update(object)
            });
        } 
    }

    async delete(modelname, filter,id) {
        this.sync.delete(modelname,filter,id)


        var idx = id || filter.id 

        if(idx){

            await this.getdb().collection(modelname).doc(idx).delete();

        }else{
            var snaps=await this._get(modelname,filter)
            snaps.forEach(async function (element) {
                await element.ref.delete();
            });
        }
    }
}



module.exports = {
    FireStoreDB
}