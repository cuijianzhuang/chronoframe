# 快速开始

:::warning 🚧施工中
文档正在编写中，部分功能文档尚未完成。
:::

## 🛠️ 前置准备

- 可用的 [Docker](https://docs.docker.com/get-docker/) 环境。
- 一个支持 S3 协议的存储桶 *(GitHub 仓库存储和本地文件系统存储仍在开发中)*。
  :::tip
  使用 S3 存储时，你至少需要从服务商处获取以下信息：`ACCESS_KEY_ID`、`SECRET_ACCESS_KEY`、`ENDPOINT`、`BUCKET_NAME`、`REGION`，当存储桶的外链地址和 `ENDPOINT` 不同时，你还需要提供外链地址 `CDN_URL`。
  :::
- 两个 [Mapbox 访问令牌](https://console.mapbox.com/account/access-tokens/)。
  :::details 为什么需要两个 Token？
  - 第一个 Token 用于前端显示地图，要求有 `styles:read` 权限。建议将此 Token 的 URL 限制为你的 ChronoFrame 实例域名以防止滥用。
  - 第二个 Token 用于后端进行地理位置反向解析，此 Token **不能**有 URL 限制。这个 Token 是**可选**的。
  :::
- [GitHub OAuth 应用](https://github.com/settings/applications/new)的 `CLIENT_ID` 和 `CLIENT_SECRET` *(可选，用于启用 GitHub 登录)*。
  :::tip
  创建 OAuth 应用时，`Authorization callback URL` 应设置为 `http(s)://<你的域名>/api/auth/github`。
  :::

## 🐳 快速部署

推荐使用预构建的 docker 镜像部署，[在 ghcr 上查看镜像](https://github.com/HoshinoSuzumi/chronoframe/pkgs/container/chronoframe)。

按喜好选择 Docker 或 Docker Compose 进行部署。

### 使用 Docker 部署

运行以下命令启动 ChronoFrame 实例：

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

### 使用 Docker Compose 部署

创建 `.env` 文件

```env
# Admin user email (required)
CFRAME_ADMIN_EMAIL=
# Admin user name (default to Chronoframe, optional)
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

创建 `docker-compose.yml` 文件

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

启动 ChronoFrame 实例

```bash
docker compose up -d
```