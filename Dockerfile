# The base image
FROM node:10   

# The working directory inside the image
WORKDIR /multi-db-safe  

# Copy everything from folder with the docker file to /app
COPY . .

# Run a commandline when docker build
RUN npm install

# Upon start of image this command will run , This is taken as a startup command and can be overriden from cmd line when 'docker run'
CMD ["echo","Starting Migration..."]

# Upon start of image this command will run , This is taken as a stable command and cannot be overriden from cmd line when 'docker run'
ENTRYPOINT ["/multi-db-safe/migrate.sh"]
