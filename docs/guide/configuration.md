# Configuration Reference

Whether using Docker or Docker Compose (.env) deployment, configuration is done through environment variables.

## Environment Variables List

| Environment Variable                 | Description                                                     | Default     | Required                                      |
| ------------------------------------ | --------------------------------------------------------------- | ----------- | --------------------------------------------- |
| CFRAME_ADMIN_EMAIL                   | Initial admin user email                                        | None        | Yes                                           |
| CFRAME_ADMIN_NAME                    | Initial admin username                                          | Chronoframe | No                                            |
| CFRAME_ADMIN_PASSWORD                | Initial admin user password                                     | CF1234@!    | No                                            |
| NUXT_PUBLIC_APP_TITLE                | Application title                                               | ChronoFrame | No                                            |
| NUXT_PUBLIC_APP_SLOGAN               | Application slogan                                              | None        | No                                            |
| NUXT_PUBLIC_APP_AUTHOR               | Application author                                              | None        | No                                            |
| NUXT_PUBLIC_APP_AVATAR_URL           | Application avatar URL                                          | None        | No                                            |
| NUXT_PUBLIC_MAPBOX_ACCESS_TOKEN      | Mapbox access token (URL restricted), for map services          | None        | Yes                                           |
| NUXT_MAPBOX_ACCESS_TOKEN             | Mapbox access token (no URL restriction), for location services | None        | No                                            |
| NUXT_STORAGE_PROVIDER                | Storage provider, supports `s3`, `github`, `local`              | `s3`        | Yes                                           |
| NUXT_PROVIDER_S3_ENDPOINT            | S3 compatible storage service endpoint                          | None        | Required when `NUXT_STORAGE_PROVIDER` is `s3` |
| NUXT_PROVIDER_S3_BUCKET              | S3 bucket name                                                  | chronoframe | Required when `NUXT_STORAGE_PROVIDER` is `s3` |
| NUXT_PROVIDER_S3_REGION              | S3 bucket region                                                | auto        | Required when `NUXT_STORAGE_PROVIDER` is `s3` |
| NUXT_PROVIDER_S3_ACCESS_KEY_ID       | S3 access key ID                                                | None        | Required when `NUXT_STORAGE_PROVIDER` is `s3` |
| NUXT_PROVIDER_S3_SECRET_ACCESS_KEY   | S3 secret access key                                            | None        | Required when `NUXT_STORAGE_PROVIDER` is `s3` |
| NUXT_PROVIDER_S3_PREFIX              | S3 storage prefix                                               | photos/     | No                                            |
| NUXT_PROVIDER_S3_CDN_URL             | S3 storage CDN URL                                              | None        | No                                            |
| NUXT_PUBLIC_OAUTH_GITHUB_ENABLED     | Enable GitHub OAuth login                                       | false       | No                                            |
| NUXT_OAUTH_GITHUB_CLIENT_ID          | GitHub OAuth app Client ID                                      | None        | No (optional, for GitHub login)               |
| NUXT_OAUTH_GITHUB_CLIENT_SECRET      | GitHub OAuth app Client Secret                                  | None        | No (optional, for GitHub login)               |
| NUXT_SESSION_PASSWORD                | Password for encrypting sessions, 32-character random string    | None        | Yes                                           |
| NUXT_PUBLIC_GTAG_ID                  | Google Analytics Tracking ID                                    | None        | No                                            |
| NUXT_PUBLIC_ANALYTICS_MATOMO_ENABLED | Enable Matomo analytics tracking                                | false       | No                                            |
| NUXT_PUBLIC_ANALYTICS_MATOMO_URL     | Matomo instance URL (e.g., https://matomo.example.com)          | None        | No (required if Matomo is enabled)            |
| NUXT_PUBLIC_ANALYTICS_MATOMO_SITE_ID | Matomo site ID                                                  | None        | No (required if Matomo is enabled)            |
