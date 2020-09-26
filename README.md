# multi-db-safe
Backup and Restore library for multiple databases

## Usage 

### Mongo DB

### Migration

Modify the docker file and add your SOURCE and TARGET DB credentials and run
```
docker -t migrateDb migrate.Dockerfile
docker run migrateDb
```

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