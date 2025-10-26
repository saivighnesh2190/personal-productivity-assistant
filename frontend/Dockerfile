# Multi-stage build for React application
FROM node:20-slim AS build
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
ENV ROLLUP_NO_NATIVE=1
RUN npm install --omit=optional --no-audit --no-fund
RUN npm ci

# Copy source code
COPY . .

# Install rollup platform-specific modules and build
RUN npm install @rollup/rollup-linux-x64-gnu --save-optional && npm run build

# Production stage with nginx
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Remove default nginx static files
RUN rm -rf ./*

# Copy built files from build stage
COPY --from=build /app/dist .

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
