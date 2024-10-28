FROM php:8.1-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    nginx \
    supervisor

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_mysql

# Configure nginx
COPY nginx.conf /etc/nginx/http.d/default.conf

# Configure PHP
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

# Configure supervisord
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Copy application code
COPY . /var/www/html/
RUN chown -R www-data:www-data /var/www/html

# Expose port
EXPOSE 9000

# Start supervisord
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]