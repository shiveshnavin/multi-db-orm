FROM node:10   

WORKDIR /  
RUN git clone https://github.com/shiveshnavin/multi-db-safe
WORKDIR /multi-db-safe  
RUN npm install
CMD ["echo","hello"]
CMD ["node","/multi-db-safe/backup.js",'mongodb+srv://nodepaytm:Baloney1@juntos.0v96x.gcp.mongodb.net/nodepaytm?retryWrites=true&w=majority','dump.json']
CMD ["node","/multi-db-safe/restore.js",'dump.json','mongodb+srv://nodepaytm:Baloney1@juntos.0v96x.gcp.mongodb.net/testdest?retryWrites=true&w=majority',0]

 