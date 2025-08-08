# compose/vite/Dockerfile
FROM node:22-alpine

WORKDIR /app

# Copy package.json and install dependencies
COPY package.json .yarnrc.yml ./
RUN corepack enable && yarn set version stable
RUN yarn install --frozen-lockfile

# Copy application files
COPY . .
