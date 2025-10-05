# Getting Started

This documentation will guide you on how to quickly deploy and start using ChronoFrame.

:::warning 🚧 Under Construction
Documentation is being written, some feature documentation is not yet complete.
:::

## Prerequisites

- Available [Docker](https://docs.docker.com/get-docker/) environment.
- An S3 protocol-compatible storage bucket *(GitHub repository storage and local filesystem storage are still in development)*.
  :::tip
  When using S3 storage, you need to obtain at least the following information from your service provider: `ACCESS_KEY_ID`, `SECRET_ACCESS_KEY`, `ENDPOINT`, `BUCKET_NAME`, `REGION`. When the bucket's external URL is different from the `ENDPOINT`, you also need to provide the external URL `CDN_URL`.
  :::
- Two [Mapbox access tokens](https://console.mapbox.com/account/access-tokens/).
  :::details Why do I need two tokens?
  - The first token is used for frontend map display, requires `styles:read` permission. It's recommended to restrict this token's URL to your ChronoFrame instance domain to prevent abuse.
  - The second token is used for backend reverse geocoding, this token **cannot** have URL restrictions. This token is **optional**.
  :::
- [GitHub OAuth App](https://github.com/settings/applications/new) `CLIENT_ID` and `CLIENT_SECRET` *(optional, for enabling GitHub login)*.
  :::tip
  When creating the OAuth app, the `Authorization callback URL` should be set to `http(s)://<your-domain>/api/auth/github`.
  :::

## Quick Deployment

### Pre-built Images

We recommend using pre-built Docker images for deployment, hosted on GitHub Container Registry:

```
ghcr.io/hoshinosuzumi/chronoframe:latest
```

[View all available versions](https://github.com/HoshinoSuzumi/chronoframe/pkgs/container/chronoframe)

### Create Configuration File

Create a `.env` file in a directory beforehand. To see all configuration options, please refer to the [Configuration Guide](/guide/configuration).

```env
# Admin user email (required)
CFRAME_ADMIN_EMAIL=
# Admin username (default to Chronoframe, optional)
CFRAME_ADMIN_NAME=
# Admin user password (default to CF1234@!, optional)
CFRAME_ADMIN_PASSWORD=

# 应用标题与口号
NUXT_PUBLIC_APP_TITLE=
NUXT_PUBLIC_APP_SLOGAN=
NUXT_PUBLIC_APP_AUTHOR=
NUXT_PUBLIC_APP_AVATAR_URL=

# Mapbox access token for map features, Mapbox GL JS (Client-side, public)
NUXT_PUBLIC_MAPBOX_ACCESS_TOKEN=
# Mapbox secret access token for server-side, Mapbox Search API (Reverse Geocoding)
NUXT_MAPBOX_ACCESS_TOKEN=

# 存储提供者（s3/github/local）
NUXT_STORAGE_PROVIDER=s3
# S3 存储服务配置
NUXT_PROVIDER_S3_ENDPOINT=
NUXT_PROVIDER_S3_BUCKET=chronoframe
NUXT_PROVIDER_S3_REGION=auto
NUXT_PROVIDER_S3_ACCESS_KEY_ID=
NUXT_PROVIDER_S3_SECRET_ACCESS_KEY=
NUXT_PROVIDER_S3_PREFIX=photos/
NUXT_PROVIDER_S3_CDN_URL=

# 会话密码（32 位随机字符串，必须设置）
NUXT_SESSION_PASSWORD=

# GitHub OAuth
NUXT_OAUTH_GITHUB_CLIENT_ID=
NUXT_OAUTH_GITHUB_CLIENT_SECRET=
```

### Docker Single Container Deployment

#### Quick Start

```bash
docker run -d --name chronoframe -p 3000:3000 -v $(pwd)/data:/app/data --env-file .env ghcr.io/hoshinosuzumi/chronoframe:latest
```

### Docker Compose Deployment

Recommended for production environment deployment using Docker Compose for easier management and configuration.

#### 1. Create `.env` file

```env
# Admin user email (required)
CFRAME_ADMIN_EMAIL=
# Admin username (default to Chronoframe, optional)
CFRAME_ADMIN_NAME=
# Admin user password (default to CF1234@!, optional)
CFRAME_ADMIN_PASSWORD=

# Application title and slogan
NUXT_PUBLIC_APP_TITLE=
NUXT_PUBLIC_APP_SLOGAN=
NUXT_PUBLIC_APP_AUTHOR=
NUXT_PUBLIC_APP_AVATAR_URL=

# Mapbox access token for map features, Mapbox GL JS (Client-side, public)
NUXT_PUBLIC_MAPBOX_ACCESS_TOKEN=
# Mapbox secret access token for server-side, Mapbox Search API (Reverse Geocoding)
NUXT_MAPBOX_ACCESS_TOKEN=

# Storage provider (s3/github/local)
NUXT_STORAGE_PROVIDER=s3
# S3 storage service configuration
NUXT_PROVIDER_S3_ENDPOINT=
NUXT_PROVIDER_S3_BUCKET=chronoframe
NUXT_PROVIDER_S3_REGION=auto
NUXT_PROVIDER_S3_ACCESS_KEY_ID=
NUXT_PROVIDER_S3_SECRET_ACCESS_KEY=
NUXT_PROVIDER_S3_PREFIX=photos/
NUXT_PROVIDER_S3_CDN_URL=

# Session password (32-character random string, required)
NUXT_SESSION_PASSWORD=

# GitHub OAuth
NUXT_OAUTH_GITHUB_CLIENT_ID=
NUXT_OAUTH_GITHUB_CLIENT_SECRET=
```

#### 2. Create `docker-compose.yml` file

```yaml
services:
  chronoframe:
    image: ghcr.io/hoshinosuzumi/chronoframe:latest
    container_name: chronoframe
    restart: unless-stopped
    ports:
      - '3000:3000'
    volumes:
      - ./data:/app/data
    env_file:
      - .env
```

#### 3. Start ChronoFrame Service

```bash
# Start service
docker compose up -d

# View logs
docker compose logs -f chronoframe

# Stop service
docker compose down

# Update to latest version
docker compose pull
docker compose up -d
```

## Reverse Proxy

When deploying in production environment, you usually need a reverse proxy server (like Nginx or Caddy) to handle HTTPS and domain resolution. Here are some example configurations.

### Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # HTTPS redirect
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    # SSL certificate configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    # SSL security configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Upload size limit
    client_max_body_size 100M;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # WebSocket support
        proxy_set_header Connection "upgrade";
        proxy_set_header Upgrade $http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Static resource caching
    location ~* \.(jpg|jpeg|png|gif|webp|svg|css|js|ico|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
        proxy_set_header Host $host;
    }
}
```

### Traefik

If you use Traefik as reverse proxy, you can add labels in `docker-compose.yml`:

```yaml
services:
  chronoframe:
    image: ghcr.io/hoshinosuzumi/chronoframe:latest
    container_name: chronoframe
    restart: unless-stopped
    volumes:
      - ./data:/app/data
    env_file:
      - .env
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.chronoframe.rule=Host(`your-domain.com`)"
      - "traefik.http.routers.chronoframe.entrypoints=websecure"
      - "traefik.http.routers.chronoframe.tls.certresolver=letsencrypt"
      - "traefik.http.services.chronoframe.loadbalancer.server.port=3000"
    networks:
      - traefik

networks:
  traefik:
    external: true
```

## Common Issues

:::details How to generate random `NUXT_SESSION_PASSWORD`?
```bash
# Linux / macOS
openssl rand -base64 32

# Windows (pwsh)
[Convert]::ToBase64String((1..32|%{[byte](Get-Random -Max 256)}))
```
:::

:::details After successful backend authentication login, redirect to homepage and still in unauthenticated state?
First, please make sure you're not accessing directly through IP address and port number. For security reasons, please access through the configured domain name.

If for some reason you insist on accessing through IP port, please add to configuration:
```env
NUXT_ALLOW_INSECURE_COOKIE=true
```
:::