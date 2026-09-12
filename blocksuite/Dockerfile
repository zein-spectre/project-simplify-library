FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Use Nginx to serve the static files
FROM nginx:alpine AS runner

# Copy custom nginx config (allows iframe embedding from localhost:2002)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from the builder stage to Nginx html folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose default Nginx port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
