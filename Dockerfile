# Use a lightweight Node.js image as the base
FROM node:22-alpine

# Set the working directory inside the container
# This will be /app for all subsequent commands in this Dockerfile
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install dependencies
# Use a separate npm install step so it's cached if only code changes
RUN npm install

# Copy the rest of your application code
COPY . .

# Expose the port your app listens on (e.g., 3000)
EXPOSE 3000

# Command to run your application when the container starts
# Make sure 'server.js' is your actual main entry file
CMD ["node", "app.js"]