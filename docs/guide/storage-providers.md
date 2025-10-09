# Storage Provider Configuration

ChronoFrame supports multiple storage backends to save your photos and thumbnails. This document will detail how to configure different storage providers.

| Provider             | Support | Use Case                                | Cost               |
| -------------------- | :-----: | --------------------------------------- | ------------------ |
| **S3 Compatible**    |   ✅    | Production environment                  | Varies by provider |
| **Local Filesystem** |   ✅    | Testing environment, offline deployment | Free               |

## S3 Compatible Storage

S3 compatible storage is the most recommended production environment option, supporting all major cloud service providers.

### Basic Configuration

```bash
# Set storage provider to S3
NUXT_STORAGE_PROVIDER=s3

# S3 basic configuration
NUXT_PROVIDER_S3_ENDPOINT=https://your-s3-endpoint.com
NUXT_PROVIDER_S3_BUCKET=chronoframe-photos
NUXT_PROVIDER_S3_REGION=us-east-1
NUXT_PROVIDER_S3_ACCESS_KEY_ID=your-access-key-id
NUXT_PROVIDER_S3_SECRET_ACCESS_KEY=your-secret-access-key

# Optional configuration
NUXT_PROVIDER_S3_PREFIX=photos/
NUXT_PROVIDER_S3_CDN_URL=https://cdn.example.com
```

### Cloud Provider Configuration Examples

#### AWS S3

```bash
NUXT_STORAGE_PROVIDER=s3
NUXT_PROVIDER_S3_ENDPOINT=https://s3.amazonaws.com
NUXT_PROVIDER_S3_BUCKET=my-chronoframe-bucket
NUXT_PROVIDER_S3_REGION=us-east-1
NUXT_PROVIDER_S3_ACCESS_KEY_ID=AKIA...
NUXT_PROVIDER_S3_SECRET_ACCESS_KEY=...
NUXT_PROVIDER_S3_CDN_URL=https://d1234567890.cloudfront.net
```

#### Cloudflare R2

```bash
NUXT_STORAGE_PROVIDER=s3
NUXT_PROVIDER_S3_ENDPOINT=https://[account-id].r2.cloudflarestorage.com
NUXT_PROVIDER_S3_BUCKET=chronoframe
NUXT_PROVIDER_S3_REGION=auto
NUXT_PROVIDER_S3_ACCESS_KEY_ID=...
NUXT_PROVIDER_S3_SECRET_ACCESS_KEY=...
NUXT_PROVIDER_S3_CDN_URL=https://photos.example.com
```

#### Alibaba Cloud OSS

```bash
NUXT_STORAGE_PROVIDER=s3
NUXT_PROVIDER_S3_ENDPOINT=https://oss-cn-hangzhou.aliyuncs.com
NUXT_PROVIDER_S3_BUCKET=chronoframe-photos
NUXT_PROVIDER_S3_REGION=oss-cn-hangzhou
NUXT_PROVIDER_S3_ACCESS_KEY_ID=LTAI...
NUXT_PROVIDER_S3_SECRET_ACCESS_KEY=...
NUXT_PROVIDER_S3_CDN_URL=https://cdn.example.com
```

#### Tencent Cloud COS

```bash
NUXT_STORAGE_PROVIDER=s3
NUXT_PROVIDER_S3_ENDPOINT=https://cos.ap-beijing.myqcloud.com
NUXT_PROVIDER_S3_BUCKET=chronoframe-1234567890
NUXT_PROVIDER_S3_REGION=ap-beijing
NUXT_PROVIDER_S3_ACCESS_KEY_ID=AKID...
NUXT_PROVIDER_S3_SECRET_ACCESS_KEY=...
```

#### MinIO Self-hosted

```bash
NUXT_STORAGE_PROVIDER=s3
NUXT_PROVIDER_S3_ENDPOINT=https://minio.example.com
NUXT_PROVIDER_S3_BUCKET=chronoframe
NUXT_PROVIDER_S3_REGION=us-east-1
NUXT_PROVIDER_S3_ACCESS_KEY_ID=minioadmin
NUXT_PROVIDER_S3_SECRET_ACCESS_KEY=minioadmin
```

### Bucket Configuration

#### CORS Settings

Recommended CORS configuration:

```json
[
  {
    "AllowedOrigins": ["https://your-domain.com"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

## Local Filesystem

Local storage saves files in the server filesystem.

```bash
# Set storage provider to local
NUXT_STORAGE_PROVIDER=local

# Local storage configuration
NUXT_PROVIDER_LOCAL_PATH=/app/data/storage
NUXT_PROVIDER_LOCAL_BASE_URL=/storage
```

## Common Issues

:::details `The AWS Access Key Id you provided does not exist in our records`
Access key error, check if `ACCESS_KEY_ID` and `SECRET_ACCESS_KEY` are correct.
:::

:::details `The specified bucket does not exist`
Bucket does not exist, confirm the bucket name is correct and exists in the specified region.
:::

:::details Can upload but cannot access images, console shows `Access to fetch at '...' from origin '...' has been blocked by CORS policy`
Bucket CORS configuration error, refer to [CORS Settings](#cors-settings) for configuration.
:::
