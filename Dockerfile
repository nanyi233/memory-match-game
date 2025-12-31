# Use nginx alpine as base image for smaller size
FROM nginx:alpine

# Set labels for image metadata
LABEL maintainer="developer"
LABEL description="Memory Match Game - A card matching puzzle game"
LABEL version="1.0"

# Remove default nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy project files to nginx html directory
COPY index.html /usr/share/nginx/html/
COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/

# Copy custom nginx configuration (optional, for better caching)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
