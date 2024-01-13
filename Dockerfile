# Use an official Node.js runtime as a base image
FROM --platform=linux/amd64 node:20

# image name
LABEL Name=store Version=0.0.1

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
RUN npm install

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

ENV REDIS_HOST redis
ENV REDIS_PORT 6379
ENV REDIS_PASSWORD ''

# Command to run your application
CMD ["npm", "start"]
