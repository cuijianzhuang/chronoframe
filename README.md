# ChronoFrame

<p align="center">
  <img src="public/favicon.svg" alt="Chronoframe Logo" width="192">
  <br/>
  <img src="https://img.shields.io/badge/Version-0.1.14-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License">
  <img src="https://img.shields.io/badge/Nuxt-4.0+-00DC82.svg" alt="Nuxt">
  <img src="https://img.shields.io/badge/TypeScript-5.0+-3178C6.svg" alt="TypeScript">
  <img src="https://img.shields.io/badge/WebGL-2.0-FF6600.svg" alt="WebGL">
</p>

丝滑的照片管理和查看应用，使用 WebGL 硬件加速技术提供流畅的图片浏览体验。

[在线演示: TimoYin's Mems](https://lens.bh8.ga)

## ✨ 特性

### 🖼️ 强大的图片管理
- **在线管理照片** - 通过 Web 界面轻松管理和浏览照片
- **智能 EXIF 解析** - 自动提取拍摄时间、地理位置、相机参数等元数据
- **地理位置识别** - 自动识别照片拍摄地点，支持地图可视化
- **多格式支持** - 支持 JPEG、PNG、HEIC *(转换为 JPEG)*、RAW 等主流图片格式
- **智能缩略图** - 基于 ThumbHash 技术的高效缩略图生成

### 🚀 WebGL 硬件加速查看器
- **流畅缩放平移** - 基于 WebGL 的硬件加速渲染，支持丝滑的缩放和平移
- **渐进式加载** - 智能 LOD (Level of Detail) 系统，根据缩放级别加载最适合的图片质量
- **触控支持** - 完整的触摸手势支持，包括捏合缩放、双击缩放等
- **响应式设计** - 适配桌面端和移动端，提供一致的用户体验

### 🔧 现代技术栈
- **Nuxt 4** - 基于最新的 Nuxt 框架，提供 SSR/SSG 支持
- **TypeScript** - 完整的类型安全保障
- **Drizzle ORM** - 类型安全的数据库 ORM
- **TailwindCSS** - 现代化的 CSS 框架
- **Pinia** - Vue 3 状态管理

### ☁️ 灵活的存储方案
- **多存储后端** - 支持 S3 兼容存储、*GitHub、本地文件系统 (尚未实现)* 等
- **CDN 加速** - 可配置 CDN 加速图片访问

## 🚀 快速开始

### 环境要求

- Node.js 18+ 
- pnpm 9.0+
- 支持 WebGL 的现代浏览器

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

主要配置项：

```env
# 存储配置
NUXT_STORAGE_PROVIDER=s3

NUXT_PROVIDER_S3_ENDPOINT=
NUXT_PROVIDER_S3_BUCKET=
NUXT_PROVIDER_S3_REGION=auto
NUXT_PROVIDER_S3_ACCESS_KEY_ID=
NUXT_PROVIDER_S3_SECRET_ACCESS_KEY=
NUXT_PROVIDER_S3_PREFIX=photos/
NUXT_PROVIDER_S3_CDN_URL=

# 数据库配置 (可选，默认使用 SQLite)
NUXT_CLOUDFLARE_API_TOKEN=
NUXT_CLOUDFLARE_D1_UUID=

# GitHub OAuth
NUXT_OAUTH_GITHUB_CLIENT_ID=
NUXT_OAUTH_GITHUB_CLIENT_SECRET=
NUXT_SESSION_PASSWORD=

# 地图服务配置 (可选)
MAPBOX_TOKEN=
```

### 数据库初始化

```bash
# 1. 在 /server/database/migrations/0000_curvy_scarlet_witch.sql 中修改初始账号
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

## 📖 使用指南

### 上传照片

1. 点击头像跳转到 GitHub 认证登录
1. 访问仪表板页面 `/dashboard`
2. 在 `Photos` 页面中选择图片并点击上传（支持批量上传和拖拽上传）
3. 系统将自动提取 EXIF 信息、生成缩略图并逆编码照片地理位置

## 🛠️ 开发

### 项目结构

```
chronoframe/
├── app/                    # Nuxt 应用代码
│   ├── components/         # Vue 组件
│   ├── pages/             # 页面路由
│   ├── composables/       # 组合式函数
│   └── stores/            # Pinia 状态管理
├── packages/              # 内部包
│   └── webgl-image/       # WebGL 图片查看器包
├── server/                # 服务端代码
│   ├── api/              # API 路由
│   ├── database/         # 数据库 schema 和迁移
│   └── services/         # 业务逻辑服务
├── shared/               # 共享类型和工具
└── docs/                 # 项目文档
```

### 构建命令

```bash
# 开发模式 (包含依赖包监听)
pnpm dev

# 仅构建依赖包
pnpm build:deps

# 构建生产版本
pnpm build

# 预览生产版本
pnpm preview

# 数据库操作
pnpm db:generate    # 生成迁移文件
pnpm db:migrate     # 执行迁移
```

### WebGL 图片查看器包

ChronoFrame 包含一个独立的 WebGL 图片查看器包 `@chronoframe/webgl-image`，特性包括：

- 基于 WebGL 的硬件加速渲染
- 支持大尺寸图片的高性能显示
- 丰富的交互手势支持
- 完整的 TypeScript 类型定义
- 可独立使用于其他 Vue 项目

#### 在其他项目中使用

```bash
npm install @chronoframe/webgl-image
```

```vue
<template>
  <WebGLImageViewer
    :src="imageUrl"
    :min-scale="0.5"
    :max-scale="10"
    center-on-init
    @zoom-change="handleZoomChange"
  />
</template>

<script setup>
import { WebGLImageViewer } from '@chronoframe/webgl-image'
import '@chronoframe/webgl-image/style'
</script>
```

## 🐳 部署

### 使用 Docker

```bash
# 构建镜像
docker build -t chronoframe .

# 运行容器
docker run -p 3000:3000 chronoframe
```

### 使用 Docker Compose

```bash
# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f
```

### 也可以使用预构建 Docker 镜像

[在 ghcr 上查看](https://github.com/HoshinoSuzumi/chronoframe/pkgs/container/chronoframe)

```bash
docker pull ghcr.io/hoshinosuzumi/chronoframe:latest
```

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
- 编写必要的单元测试
- 更新相关文档

## 📄 许可证

本项目基于 [MIT 许可证](LICENSE) 开源。

## 👤 作者

**Timothy Yin**
- Email: master@uniiem.com
- GitHub: [@HoshinoSuzumi](https://github.com/HoshinoSuzumi)
- Website: [bh8.ga](https://bh8.ga)
- My Gallery: [lens.bh8.ga](https://lens.bh8.ga)
