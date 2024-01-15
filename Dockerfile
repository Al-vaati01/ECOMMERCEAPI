# Use an official Node.js runtime as a base image
FROM --platform=linux/amd64 node:20

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
RUN npm install

# Install Redis server
RUN apt-get update && apt-get install -y redis-server && redis-server --daemonize yes
RUN echo "/usr/src/app/run.sh" > /etc/rc.local
RUN chmod +x /etc/rc.local
COPY run.sh /usr/src/app/run.sh
RUN chmod +x /usr/src/app/run.sh


COPY redis.conf /etc/redis/redis.conf

# Copy the rest of the application code
COPY . .

# Expose the port your app will run on
EXPOSE 3000

# Define environment variables
ENV DB_HOST mongodb
ENV DB_PORT 27017
ENV DB_DATABASE store
ENV DB_USER storeuser
ENV DB_PASSWORD ''
ENV NODE_ENV production
ENV REDIS_HOST localhost
ENV REDIS_PORT 6380
ENV REDIS_PASSWORD ''

# Command to run the script
CMD ["bash", "/usr/src/app/run.sh"]
