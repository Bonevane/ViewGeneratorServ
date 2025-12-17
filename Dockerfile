# Stage 1: Build the React application
FROM node:18-alpine as build-stage

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Vite app for production (creates the 'dist' folder)
RUN npm run build

# Stage 2: Serve the application using Nginx
FROM nginx:stable-alpine as production-stage

# Copy the custom build from the build-stage to Nginx's web root
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Expose port 80 (Standard for web traffic)
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]