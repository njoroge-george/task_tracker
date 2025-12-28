FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy server file
COPY server.js ./

# Expose port
EXPOSE 8080

# Start server
CMD ["npm", "start"]
