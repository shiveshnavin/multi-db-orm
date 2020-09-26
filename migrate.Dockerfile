FROM node:10 
ARG srcdb='mongodb+srv://nodepaytm:Baloney1@juntos.0v96x.gcp.mongodb.net/nodepaytm?retryWrites=true&w=majority'
ARG tardb='mongodb+srv://nodepaytm:Baloney1@juntos.0v96x.gcp.mongodb.net/testdest?retryWrites=true&w=majority'
ARG dedup=0

WORKDIR /  
RUN git clone https://github.com/shiveshnavin/multi-db-safe
WORKDIR /multi-db-safe  
RUN npm install
CMD ["node","/multi-db-safe/backup.js",srcdb,'dump.json']
CMD ["node","/multi-db-safe/restore.js",'dump.json',tardb,dedup]

 