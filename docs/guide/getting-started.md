# Getting Started

:::warning 🚧WIP
The documentation is under construction, and some feature docs are not yet complete.
:::

## 🛠️ Prerequisites

- A working [Docker](https://docs.docker.com/get-docker/) environment.
- An S3-compatible storage bucket *(GitHub repository storage and local filesystem storage are still under development)*.
  :::tip
  When using S3 storage, you need at least the following information from your provider: `ACCESS_KEY_ID`, `SECRET_ACCESS_KEY`, `ENDPOINT`, `BUCKET_NAME`, `REGION`. If your bucket's public URL differs from the `ENDPOINT`, you'll also need to provide the public URL as `CDN_URL`.
  :::
- Two [Mapbox access tokens](https://console.mapbox.com/account/access-tokens/).
  :::details Why do I need two tokens?
  - The first token is for frontend map display and requires `styles:read` permission. It's recommended to restrict this token's URL to your ChronoFrame instance domain to prevent abuse.
  - The second token is for backend reverse geocoding and **cannot** have URL restrictions. This token is **optional**.
  :::
- `CLIENT_ID` and `CLIENT_SECRET` from a [GitHub OAuth App](https://github.com/settings/applications/new) *(optional, for enabling GitHub login)*.
  :::tip
  When creating the OAuth app, set the `Authorization callback URL` to `http(s)://<your-domain>/api/auth/github`.
  :::

## 🐳 Quick Deployment

We recommend using the pre-built Docker image for deployment. [View the image on ghcr](https://github.com/HoshinoSuzumi/chronoframe/pkgs/container/chronoframe).

Choose between Docker or Docker Compose based on your preference.

### Deploy with Docker

Run the following command to start a ChronoFrame instance:

```bash
docker run -d \
  --name chronoframe \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  -e CFRAME_ADMIN_EMAIL="" \
  -e CFRAME_ADMIN_NAME="" \
  -e CFRAME_ADMIN_PASSWORD="" \
  -e NUXT_PUBLIC_APP_TITLE="" \
  -e NUXT_PUBLIC_APP_SLOGAN="" \
  -e NUXT_PUBLIC_APP_AUTHOR="" \
  -e NUXT_PUBLIC_APP_AVATAR_URL="" \
  -e NUXT_PUBLIC_MAPBOX_ACCESS_TOKEN="" \
  -e NUXT_STORAGE_PROVIDER="s3" \
  -e NUXT_PROVIDER_S3_ENDPOINT="" \
  -e NUXT_PROVIDER_S3_BUCKET="chronoframe" \
  -e NUXT_PROVIDER_S3_REGION="auto" \
  -e NUXT_PROVIDER_S3_ACCESS_KEY_ID="" \
  -e NUXT_PROVIDER_S3_SECRET_ACCESS_KEY="" \
  -e NUXT_PROVIDER_S3_PREFIX="photos/" \
  -e NUXT_PROVIDER_S3_CDN_URL="" \
  -e NUXT_OAUTH_GITHUB_CLIENT_ID="" \
  -e NUXT_OAUTH_GITHUB_CLIENT_SECRET="" \
  -e NUXT_SESSION_PASSWORD="" \
  ghcr.io/hoshinosuzumi/chronoframe:latest
```

### Deploy with Docker Compose

Create a `.env` file:

```env
# Admin user email (required)
CFRAME_ADMIN_EMAIL=
# Admin user name (default to Chronoframe, optional)
CFRAME_ADMIN_NAME=
# Admin user password (default to CF1234@!, optional)
CFRAME_ADMIN_PASSWORD=

# App title and slogan
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

Create a `docker-compose.yml` file:

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

Start the ChronoFrame instance:

```bash
docker compose up -d
```


