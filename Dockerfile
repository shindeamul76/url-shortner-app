# Base stage for installing dependencies and building the application
FROM node:20-alpine AS base_builder

# Set working directory
WORKDIR /usr/src/app

# Install necessary dependencies for Prisma (e.g., sqlite for local development, or client generation)
RUN apk add --no-cache python3 make g++ openssl

# Install Yarn globally
RUN npm install -g yarn --force

# Copy package files and install dependencies
COPY package.json yarn.lock ./
RUN yarn install --production=false

# Copy the entire project
COPY . .

# Generate Prisma client
RUN yarn prisma generate

# Build the application
RUN yarn build

# -------------------------------------
# Production stage for running the application
FROM node:20-alpine AS production

# Set working directory
WORKDIR /usr/src/app

# Copy the build and runtime dependencies from the base image
COPY --from=base_builder /usr/src/app/dist ./dist
COPY --from=base_builder /usr/src/app/node_modules ./node_modules
COPY --from=base_builder /usr/src/app/prisma ./prisma
COPY package.json ./

# Expose the application port
EXPOSE 3000

# Define environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start the application
CMD ["node", "dist/main.js"]

# -------------------------------------
# Development stage for running the application in dev mode
FROM node:20-alpine AS development

# Set working directory
WORKDIR /usr/src/app

# Copy the build and runtime dependencies from the base image
COPY --from=base_builder /usr/src/app/dist ./dist
COPY --from=base_builder /usr/src/app/node_modules ./node_modules
COPY --from=base_builder /usr/src/app/prisma ./prisma
COPY package.json ./

# Expose the application port
EXPOSE 3000

# Define environment variables
ENV NODE_ENV=development
ENV PORT=3000

# Start the application
CMD ["yarn", "start:dev"]