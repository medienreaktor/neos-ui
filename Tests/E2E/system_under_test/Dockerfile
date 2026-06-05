# minimum PHP version is '8.4' because that's the lowest version frankenPHP provides an image for.
# Reasoning: If it runs with PHP 8.4, it will also run with higher versions.
FROM dunglas/frankenphp:1-php8.4-trixie

COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer

# reference: https://github.com/mlocati/docker-php-extension-installer
# `gd` is required for the Imagine driver configured in Settings.yaml (driver: Gd).
# Without it, asset import fails when refreshing image metadata, leaving the media
# library empty and breaking any test that picks an asset.
RUN install-php-extensions \
    intl \
    pdo_mysql \
    gd \
    redis

RUN apt update \
    && apt install -y git unzip mariadb-client \
    && apt clean \
    && rm -rf /var/lib/apt/lists/*

# Add config files
COPY Tests/E2E/system_under_test/sut_file_system_overrides/ /

ARG USER=www-data
RUN \
    useradd ${USER}; \
    mkdir -p /app/Data  /app/Web/_Resources /composer_cache \
    && chown -R ${USER}:${USER} /app /composer_cache /config/caddy /data/caddy \
    && chmod +x /entrypoint.sh

WORKDIR /app
USER ${USER}

ENTRYPOINT ["/entrypoint.sh"]
