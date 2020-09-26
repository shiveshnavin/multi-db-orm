#!/bin/bash 
SRCDB=$1
TARDB=$1
DEDUPDB=$1

echo "Source DB $SRCDB" 
echo "Target DB $TARDB" 
echo "Dedup DB $DEDUPDB" 

node backup.js $SRCDB dump.json 

node restore.js dump.json $TARDB $DEDUPDB