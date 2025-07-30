# compose/vite/Dockerfile
FROM node:22-alpine

WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
RUN yarn install --network-timeout 100000 && yarn cache clean

# Copy application files
COPY . .

# Build the application
RUN yarn build
