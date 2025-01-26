# Base stage for installing dependencies and building the application
FROM node:20-alpine AS builder
WORKDIR /usr/src/app
RUN apk add --no-cache python3 make g++ openssl
COPY package.json yarn.lock ./
RUN yarn install --production=false
COPY . .
RUN yarn prisma generate && yarn build

# Development stage for running the application in dev mode
FROM node:20-alpine AS development
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/ ./
COPY wait-for-it.sh ./  
RUN chmod +x wait-for-it.sh  # Make wait-for-it.sh executable
COPY entrypoint.sh ./  
RUN chmod +x entrypoint.sh  # Make entrypoint.sh executable
EXPOSE 3000
ENV NODE_ENV=development
ENTRYPOINT ["./entrypoint.sh"]
CMD ["yarn", "start:dev"]