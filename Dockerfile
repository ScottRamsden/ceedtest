# Use Node.js LTS (Long Term Support) image
FROM node:20-slim AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code and config files
COPY . .

# Build the TypeScript code
RUN npm run build

# --- Production Stage ---
FROM node:20-slim

WORKDIR /app

# Copy only production dependencies and the built dist folder
COPY package*.json ./
COPY config.js ./
# We need to install production dependencies, and since we use React/Lucide, 
# they must be in the production image.
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
