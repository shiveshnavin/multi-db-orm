# multi-db-safe
Backup and Restore library for multiple databases

## Usage Mongo DB

### Backup 

```
node backup.js 'mongodb://username:paswd@dbhost:13873/dbname'
```

This will create a dump file in dumps/

### Restore

```
Without Deduplicationn : node restore.js dumpfile.json 'mongodb://username:paswd@dbhost:13873/dbname' 

With deduplication : node restore.js dumpfile.json 'mongodb://username:paswd@dbhost:13873/dbname' 1
```

