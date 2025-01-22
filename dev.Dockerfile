# Use a Node.js base image
FROM node:20-alpine AS base

# Set the working directory
WORKDIR /usr/src/app

# Install Yarn globally
RUN npm install -g yarn

# Copy the package files and install dependencies
COPY package.json yarn.lock ./
RUN yarn install --development

# Copy the entire project
COPY . .

# Build the application
RUN yarn build

# development stage
FROM node:20-alpine AS development

# Set working directory
WORKDIR /usr/src/app

# Copy the build and runtime dependencies from the base image
COPY --from=base /usr/src/app/dist ./dist
COPY --from=base /usr/src/app/node_modules ./node_modules
COPY package.json ./

# Expose the application port
EXPOSE 3000

# Define environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start the application
CMD ["node", "dist/main.js"]