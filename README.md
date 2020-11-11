# multi-db-orm
ORM for multiple SQL and NoSQL databases like firestore , MongoDB , SQlite with Sync ,  Backup and Restore support .

## 1. Object Relational Mapping

Supported databases:
1. MongoDB
2. Google Firestore
3. SQlite3

### Install
The package is available on npm
`
npm install multi-db-orm
`

### Initialize
```
const { MultiDbORM, FireStoreDB, MongoDB, SQLiteDB, Sync } = require("multi-db-orm");

// You can choose to initialize any or all of the supported databases in singe app

// Firestore
var firebasedb = new FireStoreDB("/path/to/serviceAccountFile.json");

// Sqlite
var sqlitedb = new SQLiteDB("/path/to/mydatabase.db"); // if no path is passed , an in-memory db is used

// MongoDB
var mongodb = new MongoDB("mongodb+srv://username:PassW0rd@host.server.net/my_db_name","my_db_name");

var db = firebasedb;
```

### Usage 
You can perform Create,Insert,Get,GetOne,Update,Delete queries . You only need to base your code on the interface MultiDbORM

<b>Note:</b>
 1. Firestore DB requires a `documentPath` specified for each document in a collection . For FirestoreDB functions you can optionally specify this path as the last parameter in getOne,update,insert,delete functions or have a 'id' field in all your objects . If none are specified the Date.now() is used.
 2. All the functions are `async` i.e. they return a promise so you can use `..then()` or `await`

#### Create
You can create a Table from a sample object in SQlite . NoSQL databases need not create a entity explicitly .
```
// db.create(modelname,sampleObject)

var db = new SQLiteDB("/path/to/mydatabase.db"); // if no path is passed , an in-memory db is used
db.create('game',aSampleGameObject); 
// creates a game table in db . 
// The fields and their data types are extracted from aSampleGameObject but aSampleGameObject is not saved in db
```

#### Insert
The same code will insert a object to the database entity based on the Implementation of MultiDbORM selected from Initialize Step above . Calling `db.insert()` returns a promise so can be used with async/await easily .
```
// db.insert(modelname,object)

var res = await db.insert('game', gm);

OR

db.insert('game', gm).then(response=>{
 console.log(response);
}).catch(err=>{
 console.log(err);
});
```

#### Get
The code will retrieve object(s) from the database .
```
// db.get(modelname,filter)

var games = await db.get('game', { amount: 19.00 , type: 'Hockey' }); 
// returns an array of games having amount = 19.00 and type = Hockey

var oneGame = await db.getOne('game', { country: 'India' }); // returns single game having country = 19.00 

var oneGameFr = await db.getOne('game', { country: 'India' },"32g274hfn48vnf")); 
// Only for firestore if docPath is passed optionally , filter is ignored and the object is returned
```

#### Update
The code will update objects in the database .
```
// db.update(modelname,filter,object)


var result = await db.update('game', { amount: 19.00 , type: 'Hockey' },{status : "cancelled",closingTime:Date.now()}); 
// updates all the games having amount=19.00 and type=Hockey to status=cancelled 
// and closingTime as current time while other fields are not touched

var result_fire = await db.update('game', { amount: 19.00 , type: 'Hockey' },"32g274hfn48vnf"); 
/* Only for firestore with optional docPath , it will update collection("game").doc("32g274hfn48vnf") .
The filters amount and type are ignored when docPath is passed */
```

#### Delete
The code will delete objects in the database .
````
// db.delete(modelname,filter)


var result = await db.delete('game', { amount: 19.00 , type: 'Hockey' }); 
// deletes all the games having amount=19.00 and type=Hockey  

var result_fire = await db.delete('game', { amount: 19.00 , type: 'Hockey' },"32g274hfn48vnf");
/* Only for firestore with optional docPath , it will delete collection("game").doc("32g274hfn48vnf") .
The filters amount and type are ignored when docPath is passed */
````




## 2. Migration

#### Mongo DB

Pass your SOURCE and TARGET DB credentials 

Using Docker
```
docker run shiveshnavin/multi-db-safe 'mongodb://username:paswd@dbhost:13873/sourceDBName' 'mongodb://username:paswd@dbhost:13873/targetDBName' 0
 
```
Using Shell
```
./migrate.sh 'mongodb://username:paswd@dbhost:13873/sourceDBName' 'mongodb://username:paswd@dbhost:13873/targetDBName' 0
 
```
 
Note : To run deduplication as well set 1 instead of 0 at last cmd line argument

## 3. Backup 

#### Mongo DB
```
node backup.js 'mongodb://username:paswd@dbhost:13873/sourceDBName'
```

This will create a dump file in dumps/

## 4. Restore

#### Mongo DB
```
Without Deduplication : node restore.js dumpfile.json 'mongodb://username:paswd@dbhost:13873/targetDBName' 

With Deduplication : node restore.js dumpfile.json 'mongodb://username:paswd@dbhost:13873/targetDBName' 1
```


## 5. Work in Progress
Working on enhancing the tool with below features in progress. Feel free to contribute and create a PR .

- [ ] Add Backup support for other databases
- [ ] Add Restore support for other databases
- [ ] Range Operations like `>=` `<=` 
- [ ] Aggregations
- [ ] InsertMany
