# multi-db-orm
Backup and Restore library for multiple databases

## ORM

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


```

### Usage 
You can perform Create,Insert,Get,GetOne,Update,Delete queries . You only need to base your code on the interface MultiDbORM

You can create a Table from a sample object in SQlite




## Migration

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

## Backup 

#### Mongo DB
```
node backup.js 'mongodb://username:paswd@dbhost:13873/sourceDBName'
```

This will create a dump file in dumps/

##  Restore

#### Mongo DB
```
Without Deduplication : node restore.js dumpfile.json 'mongodb://username:paswd@dbhost:13873/targetDBName' 

With Deduplication : node restore.js dumpfile.json 'mongodb://username:paswd@dbhost:13873/targetDBName' 1
```


### MySQL

- [ ] Add Backup support
- [ ] Add Restore support
