# ChronoFrame

<p align="center">
  <img src="public/favicon.svg" alt="Chronoframe Logo" width="192">
  <br/>
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License">
  <img src="https://img.shields.io/badge/Nuxt-4.0+-00DC82.svg" alt="Nuxt">
  <img src="https://img.shields.io/badge/TypeScript-5.0+-3178C6.svg" alt="TypeScript">
  <img src="https://img.shields.io/badge/WebGL-2.0-FF6600.svg" alt="WebGL">
</p>

丝滑的照片展示和管理应用，支持多种图片格式和大尺寸图片渲染。

[在线演示: TimoYin's Mems](https://lens.bh8.ga)

## ✨ 特性

### 🖼️ 强大的图片管理

- **在线管理照片** - 通过 Web 界面轻松管理和浏览照片
- **探索地图** - 在地图上浏览照片拍摄位置
- **智能 EXIF 解析** - 自动提取拍摄时间、地理位置、相机参数等元数据
- **地理位置识别** - 自动识别(Reverse Geocoding)照片拍摄地点
- **多格式支持** - 支持 JPEG、PNG、HEIC/HEIF 等主流图片格式
- **智能缩略图** - 基于 ThumbHash 技术的高效缩略图生成

### 🔧 现代技术栈

- **Nuxt 4** - 基于最新的 Nuxt 框架，提供 SSR/SSG 支持
- **TypeScript** - 完整的类型安全保障
- **TailwindCSS** - 现代化的 CSS 框架
- **Drizzle ORM** - 类型安全的数据库 ORM

### ☁️ 灵活的存储方案

- **多存储后端** - 支持 S3 兼容存储、GitHub(WIP)、本地文件系统(WIP) 等
- **CDN 加速** - 可配置 CDN 地址加速图片访问

## 🐳 部署

推荐使用预构建的 docker 镜像部署，[在 ghcr 上查看镜像](https://github.com/HoshinoSuzumi/chronoframe/pkgs/container/chronoframe)

### Docker

修改命令中的环境变量后运行：

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
  -e NUXT_PUBLIC_APP_AVATAR_URL="" \
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
  -e MAPBOX_TOKEN="" \
  ghcr.io/hoshinosuzumi/chronoframe:latest
```

### Docker Compose

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
NUXT_PUBLIC_APP_AVATAR_URL=

# 存储配置（使用 S3）
NUXT_STORAGE_PROVIDER=s3
NUXT_PROVIDER_S3_ENDPOINT=
NUXT_PROVIDER_S3_BUCKET=chronoframe
NUXT_PROVIDER_S3_REGION=auto
NUXT_PROVIDER_S3_ACCESS_KEY_ID=
NUXT_PROVIDER_S3_SECRET_ACCESS_KEY=
NUXT_PROVIDER_S3_PREFIX=photos/
NUXT_PROVIDER_S3_CDN_URL=

# 会话密码（必须设置，建议为一个随机长字符串）
NUXT_SESSION_PASSWORD=

# GitHub OAuth
NUXT_OAUTH_GITHUB_CLIENT_ID=
NUXT_OAUTH_GITHUB_CLIENT_SECRET=

# Mapbox Token
MAPBOX_TOKEN=
```

创建 `docker-compose.yml`：

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

启动：

```bash
docker-compose up -d
```

### 环境变量列表

| 环境变量                           | 说明                                     | 默认值      | 必需                                      |
| :--------------------------------- | :--------------------------------------- | :---------- | :---------------------------------------- |
| CFRAME_ADMIN_EMAIL                 | 初始管理员用户的邮箱                     | 无          | 是，填写登录使用的 GitHub 账户的邮箱      |
| CFRAME_ADMIN_NAME                  | 初始管理员用户的用户名                   | Chronoframe | 否                                        |
| CFRAME_ADMIN_PASSWORD              | 初始管理员用户的密码                     | CF1234@!    | 否                                        |
| NUXT_PUBLIC_APP_TITLE              | 应用标题                                 | ChronoFrame | 否                                        |
| NUXT_PUBLIC_APP_SLOGAN             | 应用口号                                 | 无          | 否                                        |
| NUXT_PUBLIC_APP_AVATAR_URL         | 应用头像 URL                             | 无          | 否                                        |
| NUXT_STORAGE_PROVIDER              | 存储提供者，支持 `s3`、`github`、`local` | `s3`        | 是                                        |
| NUXT_PROVIDER_S3_ENDPOINT          | S3 兼容存储服务的 Endpoint               | 无          | 当 `NUXT_STORAGE_PROVIDER` 为 `s3` 时必需 |
| NUXT_PROVIDER_S3_BUCKET            | S3 存储桶名称                            | chronoframe | 当 `NUXT_STORAGE_PROVIDER` 为 `s3` 时必需 |
| NUXT_PROVIDER_S3_REGION            | S3 存储桶区域                            | auto        | 当 `NUXT_STORAGE_PROVIDER` 为 `s3` 时必需 |
| NUXT_PROVIDER_S3_ACCESS_KEY_ID     | S3 访问密钥 ID                           | 无          | 当 `NUXT_STORAGE_PROVIDER` 为 `s3` 时必需 |
| NUXT_PROVIDER_S3_SECRET_ACCESS_KEY | S3 访问密钥                              | 无          | 当 `NUXT_STORAGE_PROVIDER` 为 `s3` 时必需 |
| NUXT_PROVIDER_S3_PREFIX            | S3 存储前缀                              | photos/     | 否                                        |
| NUXT_PROVIDER_S3_CDN_URL           | S3 存储的 CDN 地址                       | 无          | 否                                        |
| NUXT_OAUTH_GITHUB_CLIENT_ID        | GitHub OAuth 应用的 Client ID            | 无          | 是                                        |
| NUXT_OAUTH_GITHUB_CLIENT_SECRET    | GitHub OAuth 应用的 Client Secret        | 无          | 是                                        |
| NUXT_SESSION_PASSWORD              | 用于加密会话的密码，32 位随机字符串      | 无          | 是                                        |
| MAPBOX_TOKEN                       | Mapbox 访问令牌，用于地图服务            | 无          | 是                                        |

## 📸 截图

![Gallery](./docs/images/screenshot1.png)
![Photo Detail](./docs/images/screenshot2.png)
![Map Explore](./docs/images/screenshot3.png)
![Dashboard](./docs/images/screenshot4.png)

## 🛠️ 开发

### 环境要求

- Node.js 18+
- pnpm 9.0+

### 安装依赖

```bash
# 使用 pnpm (推荐)
pnpm install

# 或使用其他包管理器
npm install
yarn install
```

### 配置环境变量

复制环境变量模板并根据需要配置：

```bash
cp .env.example .env
```

### 数据库初始化

```bash
# 2. 生成数据库迁移文件(可选)
pnpm db:generate

# 3. 执行数据库迁移
pnpm db:migrate
```

### 启动开发服务器

```bash
pnpm dev
```

应用将在 `http://localhost:3000` 启动。

### 项目结构

```
chronoframe/
├── app/                    # Nuxt 应用
│   ├── components/         # 组件
│   ├── pages/              # 页面路由
│   ├── composables/        # 组合式函数
│   └── stores/             # Pinia 状态管理
├── packages/
│   └── webgl-image/        # WebGL 图片查看器
├── server/
│   ├── api/                # API 路由
│   ├── database/           # 数据库 schema 和迁移
│   └── services/           # 业务逻辑服务
└── shared/                 # 共享类型和工具
```

### 构建命令

```bash
# 开发模式 (包含依赖包构建)
pnpm dev

# 仅构建依赖包
pnpm build:deps

# 构建生产版本
pnpm build

# 数据库操作
pnpm db:generate    # 生成迁移文件
pnpm db:migrate     # 执行迁移

# 预览生产版本
pnpm preview
```

## 📖 使用指南

### 上传照片

1. 点击头像跳转到 GitHub 认证登录
2. 访问仪表板页面 `/dashboard`
3. 在 `Photos` 页面中选择图片并点击上传（支持批量上传和拖拽上传）
4. 系统将自动提取 EXIF 信息、生成缩略图并逆编码照片地理位置

## 🤝 贡献

欢迎贡献代码！请确保：

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启 Pull Request

### 开发规范

- 使用 TypeScript 进行类型安全的开发
- 遵循 ESLint 和 Prettier 代码规范
- 更新相关文档

## 📄 许可证

本项目基于 [MIT 许可证](LICENSE) 开源。

## 👤 作者

**Timothy Yin**

- Email: master@uniiem.com
- GitHub: [@HoshinoSuzumi](https://github.com/HoshinoSuzumi)
- Website: [bh8.ga](https://bh8.ga)
- Gallery: [lens.bh8.ga](https://lens.bh8.ga)
