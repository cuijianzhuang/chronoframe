# 配置项说明

无论是使用 Docker 还是 Docker Compose (.env) 方式部署，均通过环境变量进行配置。

## 环境变量列表

| 环境变量                           | 说明                                           | 默认值      | 必需                                      |
| ---------------------------------- | ---------------------------------------------- | ----------- | ----------------------------------------- |
| CFRAME_ADMIN_EMAIL                 | 初始管理员用户的邮箱                           | 无          | 是，填写登录使用的 GitHub 账户的邮箱      |
| CFRAME_ADMIN_NAME                  | 初始管理员用户的用户名                         | Chronoframe | 否                                        |
| CFRAME_ADMIN_PASSWORD              | 初始管理员用户的密码                           | CF1234@!    | 否                                        |
| NUXT_PUBLIC_APP_TITLE              | 应用标题                                       | ChronoFrame | 否                                        |
| NUXT_PUBLIC_APP_SLOGAN             | 应用口号                                       | 无          | 否                                        |
| NUXT_PUBLIC_APP_AUTHOR             | 应用作者                                       | 无          | 否                                        |
| NUXT_PUBLIC_APP_AVATAR_URL         | 应用头像 URL                                   | 无          | 否                                        |
| NUXT_PUBLIC_MAPBOX_ACCESS_TOKEN    | Mapbox 访问令牌(可限制 URL)，用于地图服务      | 无          | 是                                        |
| NUXT_MAPBOX_ACCESS_TOKEN           | Mapbox 访问令牌(无 URL 限制)，用于位置信息服务 | 无          | 否                                        |
| NUXT_STORAGE_PROVIDER              | 存储提供者，支持 `s3`、`github`、`local`       | `s3`        | 是                                        |
| NUXT_PROVIDER_S3_ENDPOINT          | S3 兼容存储服务的 Endpoint                     | 无          | 当 `NUXT_STORAGE_PROVIDER` 为 `s3` 时必需 |
| NUXT_PROVIDER_S3_BUCKET            | S3 存储桶名称                                  | chronoframe | 当 `NUXT_STORAGE_PROVIDER` 为 `s3` 时必需 |
| NUXT_PROVIDER_S3_REGION            | S3 存储桶区域                                  | auto        | 当 `NUXT_STORAGE_PROVIDER` 为 `s3` 时必需 |
| NUXT_PROVIDER_S3_ACCESS_KEY_ID     | S3 访问密钥 ID                                 | 无          | 当 `NUXT_STORAGE_PROVIDER` 为 `s3` 时必需 |
| NUXT_PROVIDER_S3_SECRET_ACCESS_KEY | S3 访问密钥                                    | 无          | 当 `NUXT_STORAGE_PROVIDER` 为 `s3` 时必需 |
| NUXT_PROVIDER_S3_PREFIX            | S3 存储前缀                                    | photos/     | 否                                        |
| NUXT_PROVIDER_S3_CDN_URL           | S3 存储的 CDN 地址                             | 无          | 否                                        |
| NUXT_OAUTH_GITHUB_CLIENT_ID        | GitHub OAuth 应用的 Client ID                  | 无          | 是                                        |
| NUXT_OAUTH_GITHUB_CLIENT_SECRET    | GitHub OAuth 应用的 Client Secret              | 无          | 是                                        |
| NUXT_SESSION_PASSWORD              | 用于加密会话的密码，32 位随机字符串            | 无          | 是                                        |
| NUXT_PUBLIC_GTAG_ID                        | Google Analytics 追踪 ID                       | 无          | 否                                        |
