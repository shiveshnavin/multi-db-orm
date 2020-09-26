FROM node:10   

WORKDIR /  
COPY ../ /multi-db-safe
WORKDIR /multi-db-safe  
RUN npm install
CMD ["echo","Starting Migration..."]
ENTRYPOINT ["/multi-db-safe/migrate.sh"]
 