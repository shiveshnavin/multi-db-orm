#!/bin/bash
echo "Enter Your Name"

echo "Source DB $1" 
echo "Target DB $2" 
echo "Dedup DB $3" 

node backup.js $1 dump.json 

node restore.js dump.json $2 $3