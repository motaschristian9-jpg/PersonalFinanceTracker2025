# Use Node.js 20 Alpine
FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all other files
COPY . .

# Build the React app
RUN npm run build

# Install 'serve' globally to serve static files
RUN npm install -g serve

# Expose frontend port
EXPOSE 3000

# Start the app
CMD ["serve", "-s", "build", "-l", "3000"]
