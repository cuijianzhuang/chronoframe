import { localizeExifValue } from '~/utils/exif-localization'

/**
 * EXIF本地化的Composable
 * 提供在组件中使用的便捷方法
 */
export function useExifLocalization() {
  const { $i18n } = useNuxtApp()

  /**
   * 本地化EXIF字段值
   * @param fieldName EXIF字段名
   * @param value 原始值
   * @returns 本地化后的值
   */
  const localizeExif = (fieldName: string, value: string | number | undefined): string => {
    return localizeExifValue(fieldName, value, $i18n.t)
  }

  return {
    localizeExif,
  }
}
