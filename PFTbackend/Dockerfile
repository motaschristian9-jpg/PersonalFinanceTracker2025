# PFTbackend/Dockerfile
FROM php:8.2-fpm

# system deps and php extensions
RUN apt-get update && apt-get install -y \
    git unzip libzip-dev libpng-dev libonig-dev libxml2-dev curl \
    && docker-php-ext-install pdo pdo_mysql zip mbstring exif pcntl bcmath

# install composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# copy composer files first for caching (optional)
COPY composer.json composer.lock* ./

# copy app
COPY . .

# permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# expose php-fpm port
EXPOSE 9000

CMD ["php-fpm"]
