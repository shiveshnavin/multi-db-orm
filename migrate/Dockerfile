FROM node:10   

WORKDIR /  
RUN git clone https://github.com/shiveshnavin/multi-db-safe
WORKDIR /multi-db-safe  
RUN npm install
CMD ["echo","Starting Migration..."]
ENTRYPOINT ["/multi-db-safe/migrate.sh"]
 