/**
 * 上传相关的提示消息
 */

export const UploadMessages = {
  // 重复文件相关
  duplicate: {
    block: {
      zh: (fileName: string) => ({
        title: '文件已存在',
        message: `照片 "${fileName}" 已存在，无法上传重复文件`,
        suggestion: '您可以：1) 重命名文件后重新上传；2) 在设置中切换到"警告模式"以允许覆盖',
      }),
      en: (fileName: string) => ({
        title: 'File Already Exists',
        message: `Photo "${fileName}" already exists and duplicate uploads are not allowed`,
        suggestion: 'You can: 1) Rename the file and upload again; 2) Switch to "warn mode" in settings to allow overwriting',
      }),
    },
    skip: {
      zh: (fileName: string, photoInfo?: any) => ({
        title: '跳过重复文件',
        message: `照片 "${fileName}" 已存在，已自动跳过上传`,
        info: photoInfo ? `现有照片拍摄于 ${photoInfo.dateTaken || '未知日期'}` : undefined,
      }),
      en: (fileName: string, photoInfo?: any) => ({
        title: 'Duplicate File Skipped',
        message: `Photo "${fileName}" already exists and has been automatically skipped`,
        info: photoInfo ? `Existing photo taken on ${photoInfo.dateTaken || 'unknown date'}` : undefined,
      }),
    },
    warn: {
      zh: (fileName: string, photoInfo?: any) => ({
        title: '检测到重复文件',
        message: `照片 "${fileName}" 已存在，继续上传将会覆盖现有照片`,
        warning: '覆盖后，原有照片的所有信息（EXIF、标签、表态等）将被替换',
        info: photoInfo ? `现有照片：${photoInfo.title || fileName}，拍摄于 ${photoInfo.dateTaken || '未知日期'}` : undefined,
      }),
      en: (fileName: string, photoInfo?: any) => ({
        title: 'Duplicate File Detected',
        message: `Photo "${fileName}" already exists. Continuing will overwrite the existing photo`,
        warning: 'After overwriting, all information of the original photo (EXIF, tags, reactions, etc.) will be replaced',
        info: photoInfo ? `Existing photo: ${photoInfo.title || fileName}, taken on ${photoInfo.dateTaken || 'unknown date'}` : undefined,
      }),
    },
  },

  // 成功消息
  success: {
    upload: {
      zh: (count: number) => ({
        title: '上传成功',
        message: count === 1 
          ? '照片已成功上传，正在处理中...' 
          : `已成功上传 ${count} 张照片，正在处理中...`,
      }),
      en: (count: number) => ({
        title: 'Upload Successful',
        message: count === 1
          ? 'Photo uploaded successfully, processing...'
          : `${count} photos uploaded successfully, processing...`,
      }),
    },
    check: {
      zh: (total: number, duplicates: number) => ({
        title: '检查完成',
        message: `已检查 ${total} 个文件，发现 ${duplicates} 个重复文件`,
      }),
      en: (total: number, duplicates: number) => ({
        title: 'Check Complete',
        message: `Checked ${total} files, found ${duplicates} duplicates`,
      }),
    },
  },

  // 错误消息
  error: {
    required: {
      zh: (field: string) => ({
        title: '缺少必填参数',
        message: `请提供 ${field} 参数`,
      }),
      en: (field: string) => ({
        title: 'Missing Required Parameter',
        message: `Please provide ${field} parameter`,
      }),
    },
    invalidType: {
      zh: (type: string, allowed: string[]) => ({
        title: '不支持的文件类型',
        message: `不支持的媒体类型：${type}`,
        suggestion: `允许的类型：${allowed.join(', ')}`,
      }),
      en: (type: string, allowed: string[]) => ({
        title: 'Unsupported File Type',
        message: `Unsupported media type: ${type}`,
        suggestion: `Allowed types: ${allowed.join(', ')}`,
      }),
    },
    tooLarge: {
      zh: (size: number, maxSize: number) => ({
        title: '文件太大',
        message: `文件大小 ${(size / 1024 / 1024).toFixed(2)}MB 超过限制`,
        suggestion: `最大允许 ${maxSize}MB`,
      }),
      en: (size: number, maxSize: number) => ({
        title: 'File Too Large',
        message: `File size ${(size / 1024 / 1024).toFixed(2)}MB exceeds limit`,
        suggestion: `Maximum allowed: ${maxSize}MB`,
      }),
    },
    uploadFailed: {
      zh: (reason?: string) => ({
        title: '上传失败',
        message: reason || '上传过程中发生错误，请稍后重试',
      }),
      en: (reason?: string) => ({
        title: 'Upload Failed',
        message: reason || 'An error occurred during upload, please try again later',
      }),
    },
  },
}

/**
 * 获取消息内容（支持语言参数）
 */
export function getMessage(
  category: keyof typeof UploadMessages,
  type: string,
  lang: 'zh' | 'en' = 'zh',
  ...args: any[]
) {
  try {
    const messageGroup = UploadMessages[category] as any
    if (!messageGroup || !messageGroup[type]) {
      return null
    }

    const messageFunc = messageGroup[type][lang]
    if (typeof messageFunc === 'function') {
      return messageFunc(...args)
    }

    return messageFunc
  } catch (error) {
    return null
  }
}

/**
 * 从请求头获取客户端语言偏好
 */
export function getPreferredLanguage(event: any): 'zh' | 'en' {
  const acceptLanguage = getHeader(event, 'accept-language') || ''
  
  // 检查是否包含中文
  if (acceptLanguage.includes('zh')) {
    return 'zh'
  }
  
  return 'en'
}

/**
 * 创建格式化的错误响应
 */
export function createFormattedError(
  statusCode: number,
  messageKey: string,
  event: any,
  ...args: any[]
) {
  const lang = getPreferredLanguage(event)
  const [category, type] = messageKey.split('.')
  const message = getMessage(category as any, type, lang, ...args)
  
  if (message) {
    return createError({
      statusCode,
      statusMessage: message.title,
      data: message,
    })
  }
  
  return createError({
    statusCode,
    statusMessage: 'An error occurred',
  })
}

