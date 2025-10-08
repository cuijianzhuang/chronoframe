# ChronoFrame

<p align="center">
  <img src="public/favicon.svg" alt="Chronoframe Logo" width="192">
  <br/>
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License">
  <img src="https://img.shields.io/badge/Nuxt-4.0+-00DC82.svg" alt="Nuxt">
  <img src="https://img.shields.io/badge/TypeScript-5.0+-3178C6.svg" alt="TypeScript">
  <img src="https://img.shields.io/badge/WebGL-2.0-FF6600.svg" alt="WebGL">
</p>

**Languages:** English | [中文](README_zh.md)

A smooth photo display and management application, supporting multiple image formats and large-size image rendering.

[Live Demo: TimoYin's Mems](https://lens.bh8.ga)

## ✨ Features

### 🖼️ Powerful Photo Management

- **Manage photos online** - Easily manage and browse photos via the web interface
- **Explore map** - Browse photo locations on a map
- **Smart EXIF parsing** - Automatically extracts metadata such as capture time, geolocation, and camera parameters
- **Reverse geocoding** - Automatically identifies photo shooting locations
- **Multi-format support** - Supports mainstream formats including JPEG, PNG, HEIC/HEIF
- **Smart thumbnails** - Efficient thumbnail generation using ThumbHash

### 🔧 Modern Tech Stack

- **Nuxt 4** - Built on the latest Nuxt framework with SSR/SSG support
- **TypeScript** - Full type safety
- **TailwindCSS** - Modern CSS framework
- **Drizzle ORM** - Type-safe database ORM

### ☁️ Flexible Storage Solutions

- **Multiple storage backends** - Supports S3-compatible storage, GitHub (WIP), and local filesystem (WIP)
- **CDN acceleration** - Configurable CDN URL for faster photo delivery

## 🐳 Deployment

We recommend deploying with the prebuilt Docker image. [View the image on ghcr](https://github.com/HoshinoSuzumi/chronoframe/pkgs/container/chronoframe)

Before deployment, create a `.env` file and configure environment variables.

You can copy the example file to get started:
```bash
cp env.example .env
```

Then edit the `.env` file with your configuration. For complete configuration reference, see [env.example](./env.example).

```env
# Admin user email (required)
CFRAME_ADMIN_EMAIL=
# Admin user name (default to Chronoframe, optional)
CFRAME_ADMIN_NAME=
# Admin user password (default to CF1234@!, optional)
CFRAME_ADMIN_PASSWORD=

# App info
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
# S3 storage config
NUXT_PROVIDER_S3_ENDPOINT=
NUXT_PROVIDER_S3_BUCKET=chronoframe
NUXT_PROVIDER_S3_REGION=auto
NUXT_PROVIDER_S3_ACCESS_KEY_ID=
NUXT_PROVIDER_S3_SECRET_ACCESS_KEY=
NUXT_PROVIDER_S3_PREFIX=photos/
NUXT_PROVIDER_S3_CDN_URL=

# Session password (32 chars, required)
NUXT_SESSION_PASSWORD=

# GitHub OAuth
NUXT_PUBLIC_OAUTH_GITHUB_ENABLED=false
NUXT_OAUTH_GITHUB_CLIENT_ID=
NUXT_OAUTH_GITHUB_CLIENT_SECRET=

# Upload file type whitelist (optional)
NUXT_UPLOAD_MIME_WHITELIST_ENABLED=true
NUXT_UPLOAD_MIME_WHITELIST=image/jpeg,image/png,image/webp,image/gif,image/bmp,image/tiff,image/heic,image/heif,video/quicktime,video/mp4
```

### Docker

Run with customized environment variables:

```bash
docker run -d --name chronoframe -p 3000:3000 -v $(pwd)/data:/app/data --env-file .env ghcr.io/hoshinosuzumi/chronoframe:latest
```

### Docker Compose

Create docker-compose.yml:

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

Start:

```bash
docker-compose up -d
```

### Environment Variables

| Variable                             | Description                            | Default     | Required                        |
| :----------------------------------- | :------------------------------------- | :---------- | :------------------------------ |
| CFRAME_ADMIN_EMAIL                   | Email of the initial admin user        | None        | Yes                             |
| CFRAME_ADMIN_NAME                    | Username of the initial admin          | Chronoframe | No                              |
| CFRAME_ADMIN_PASSWORD                | Password of the initial admin          | CF1234@!    | No                              |
| NUXT_PUBLIC_APP_TITLE                | Application title                      | ChronoFrame | No                              |
| NUXT_PUBLIC_APP_SLOGAN               | Application slogan                     | None        | No                              |
| NUXT_PUBLIC_APP_AUTHOR               | Application author                     | None        | No                              |
| NUXT_PUBLIC_APP_AVATAR_URL           | Application avatar URL                 | None        | No                              |
| NUXT_PUBLIC_MAPBOX_ACCESS_TOKEN      | Mapbox access token for map service    | None        | Yes                             |
| NUXT_MAPBOX_ACCESS_TOKEN             | Mapbox access token for location info  | None        | No                              |
| NUXT_STORAGE_PROVIDER                | Storage provider (s3, github, local)   | s3          | Yes                             |
| NUXT_PROVIDER_S3_ENDPOINT            | S3 endpoint                            | None        | Required if provider is s3      |
| NUXT_PROVIDER_S3_BUCKET              | S3 bucket name                         | chronoframe | Required if provider is s3      |
| NUXT_PROVIDER_S3_REGION              | S3 bucket region                       | auto        | Required if provider is s3      |
| NUXT_PROVIDER_S3_ACCESS_KEY_ID       | S3 access key ID                       | None        | Required if provider is s3      |
| NUXT_PROVIDER_S3_SECRET_ACCESS_KEY   | S3 secret access key                   | None        | Required if provider is s3      |
| NUXT_PROVIDER_S3_PREFIX              | S3 object prefix                       | photos/     | No                              |
| NUXT_PROVIDER_S3_CDN_URL             | S3 CDN URL                             | None        | No                              |
| NUXT_PUBLIC_OAUTH_GITHUB_ENABLED     | Enable GitHub OAuth login              | false       | No                              |
| NUXT_OAUTH_GITHUB_CLIENT_ID          | GitHub OAuth app Client ID             | None        | No (optional, for GitHub login) |
| NUXT_OAUTH_GITHUB_CLIENT_SECRET      | GitHub OAuth app Client Secret         | None        | No (optional, for GitHub login) |
| NUXT_SESSION_PASSWORD                | Session encryption password (32 chars) | None        | Yes                             |
| NUXT_PUBLIC_GTAG_ID                  | Google Analytics Measurement ID        | None        | No                              |
| NUXT_PUBLIC_ANALYTICS_MATOMO_ENABLED | Enable Matomo analytics                | false       | No                              |
| NUXT_PUBLIC_ANALYTICS_MATOMO_URL     | Matomo instance URL                    | None        | No (required if Matomo enabled) |
| NUXT_PUBLIC_ANALYTICS_MATOMO_SITE_ID | Matomo site ID                         | None        | No (required if Matomo enabled) |

## 📖 User Guide

> If `CFRAME_ADMIN_EMAIL` and `CFRAME_ADMIN_PASSWORD` are not set, the default admin account is:
>
> - Email: `admin@chronoframe.com`
> - Password: `CF1234@!`

### Logging into the Dashboard

1. Click avatar to sign in with GitHub OAuth or use email/password login

### Uploading Photos

1. Go to the dashboard at /dashboard
2. On the Photos page, select and upload images (supports batch & drag-and-drop)
3. System will automatically parse EXIF data, generate thumbnails, and perform reverse geocoding

## 📸 Screenshots

![Gallery](./docs/images/screenshot1.png)
![Photo Detail](./docs/images/screenshot2.png)
![Map Explore](./docs/images/screenshot3.png)
![Dashboard](./docs/images/screenshot4.png)

## 🛠️ Development

### Requirements

- Node.js 18+
- pnpm 9.0+

### Install dependencies

```bash
# With pnpm (recommended)
pnpm install

# Or with other package managers
npm install
yarn install
```

### Configure environment variables

```bash
cp .env.example .env
```

### Initialize database

```bash
# 2. Generate migration files (optional)
pnpm db:generate

# 3. Run database migrations
pnpm db:migrate
```

### Start development server

```bash
pnpm dev
```

App will start at http://localhost:3000.

### Project Structure

```
chronoframe/
├── app/                    # Nuxt app
│   ├── components/         # Components
│   ├── pages/              # Page routes
│   ├── composables/        # Composables
│   └── stores/             # Pinia stores
├── packages/
│   └── webgl-image/        # WebGL image viewer
├── server/
│   ├── api/                # API routes
│   ├── database/           # DB schema & migrations
│   └── services/           # Business logic services
└── shared/                 # Shared types & utils
```

### Build commands

```bash
# Development (with dependencies build)
pnpm dev

# Build only dependencies
pnpm build:deps

# Production build
pnpm build

# Database operations
pnpm db:generate    # Generate migration files
pnpm db:migrate     # Run migrations

# Preview production build
pnpm preview
```

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repo
2. Create a feature branch (git checkout -b feature/amazing-feature)
3. Commit changes (git commit -m 'Add some amazing feature')
4. Push to branch (git push origin feature/amazing-feature)
5. Open a Pull Request

### Coding Guidelines

- Use TypeScript for type safety
- Follow ESLint and Prettier conventions
- Update documentation accordingly

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

**Timothy Yin**

- Email: master@uniiem.com
- GitHub: @HoshinoSuzumi
- Website: bh8.ga
- Gallery: lens.bh8.ga

## ❓ FAQ

<details>
  <summary>How is the admin user created?</summary>
  <p>
    On first startup, an admin user is created based on <code>CFRAME_ADMIN_EMAIL</code>, <code>CFRAME_ADMIN_NAME</code>, and <code>CFRAME_ADMIN_PASSWORD</code>. The email must match your GitHub account email used for login.
  </p>
</details>
<details>
  <summary>Which image formats are supported?</summary>
  <p>
    Supported formats: JPEG, PNG, HEIC/HEIF, MOV (for Live Photos).
  </p>
</details>
<details>
  <summary>Why can’t I use GitHub/Local storage?</summary>
  <p>
    Currently only S3-compatible storage is supported. GitHub and local storage support is planned.
  </p>
</details>
<details>
  <summary>Why is a map service required and how to configure it?</summary>
  <p>
    The map is used to browse photo locations and render mini-maps in photo details. Currently Mapbox is used. After registering, <a href="https://console.mapbox.com/account/access-tokens/">get an access token</a> and set it to the <code>MAPBOX_TOKEN</code> variable.
  </p>
</details>
<details>
  <summary>Why wasn’t my MOV file recognized as a Live Photo?</summary>
  <p>
    Ensure the image (.heic) and video (.mov) share the same filename (e.g., <code>IMG_1234.heic</code> and <code>IMG_1234.mov</code>). Upload order does not matter. If not recognized, you can trigger pairing manually from the dashboard.
  </p>
</details>
<details>
  <summary>How do I import existing photos from storage?</summary>
  <p>
    Direct import of existing photos is not yet supported. A directory scanning import feature is planned.
  </p>
</details>
<details>
  <summary>How is this different from Afilmory?</summary>
  <p>
    Afilmory generates a manifest from photos during local/CI processing and serves them statically. ChronoFrame is a dynamic photo management app, offering online upload, management, and browsing—better for frequently updated galleries.
    In other words, Afilmory = static; ChronoFrame = dynamic, online upload/manage.
  </p>
</details>

## 🙏 Acknowledgements

This project was inspired by [Afilmory](https://github.com/Afilmory/afilmory), another excellent personal gallery project.

Thanks to the following open-source projects and libraries:

- [Nuxt](https://nuxt.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [Drizzle ORM](https://orm.drizzle.team/)

## ⭐️ Stargazers

[![Stargazers over time](https://starchart.cc/HoshinoSuzumi/chronoframe.svg?variant=adaptive)](https://starchart.cc/HoshinoSuzumi/chronoframe)
