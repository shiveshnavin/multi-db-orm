# multi-db-safe
Backup and Restore library for multiple databases

## Usage 

### Mongo DB

### Migration
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

#### Backup 

```
node backup.js 'mongodb://username:paswd@dbhost:13873/sourceDBName'
```

This will create a dump file in dumps/

#### Restore

```
Without Deduplication : node restore.js dumpfile.json 'mongodb://username:paswd@dbhost:13873/targetDBName' 

With Deduplication : node restore.js dumpfile.json 'mongodb://username:paswd@dbhost:13873/targetDBName' 1
```


### MySQL

- [ ] Add Backup support
- [ ] Add Restore support
