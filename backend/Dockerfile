# Development Dockerfile
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies for Prisma
RUN apk add --no-cache openssl

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy prisma schema first to optimize layer caching
COPY src/prisma ./src/prisma

# Generate Prisma Client early to catch schema issues
RUN npm run prisma:generate

# Copy the rest of the application
COPY . .

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "run", "dev"]