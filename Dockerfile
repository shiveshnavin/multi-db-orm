FROM node:10   

WORKDIR /multi-db-safe  
COPY . .
RUN npm install
CMD ["echo","Starting Migration..."]
ENTRYPOINT ["/multi-db-safe/migrate.sh"]
 