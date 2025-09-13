/**
 * EXIF 字段值本地化工具函数
 * 用于将EXIF中的英文枚举值转换为本地化的显示文本
 */

// 曝光程序映射
export const exposureProgramMap: Record<string, string> = {
  'Manual': 'exif.values.exposureProgram.manual',
  'Program AE': 'exif.values.exposureProgram.programAE',
  'Aperture Priority': 'exif.values.exposureProgram.aperturePriority',
  'Aperture-priority AE': 'exif.values.exposureProgram.aperturePriority',
  'Shutter Priority': 'exif.values.exposureProgram.shutterPriority',
  'Shutter-priority AE': 'exif.values.exposureProgram.shutterPriority',
  'Creative Program': 'exif.values.exposureProgram.creative',
  'Action Program': 'exif.values.exposureProgram.action',
  'Portrait Mode': 'exif.values.exposureProgram.portrait',
  'Landscape Mode': 'exif.values.exposureProgram.landscape',
  'Bulb': 'exif.values.exposureProgram.bulb',
}

// 曝光模式映射
export const exposureModeMap: Record<string, string> = {
  'Auto': 'exif.values.exposureMode.auto',
  'Manual': 'exif.values.exposureMode.manual',
  'Auto bracket': 'exif.values.exposureMode.autoBracket',
  'Auto Exposure Bracketing': 'exif.values.exposureMode.autoBracket',
}

// 闪光灯状态映射
export const flashMap: Record<string, string> = {
  'No Flash': 'exif.values.flash.noFlash',
  'Off, Did not fire': 'exif.values.flash.offDidNotFire',
  'Flash did not fire': 'exif.values.flash.didNotFire',
  'Flash fired': 'exif.values.flash.fired',
  'Flash fired, auto mode': 'exif.values.flash.firedAuto',
  'Flash fired, auto mode, return light not detected': 'exif.values.flash.firedAutoNoReturn',
  'Flash fired, auto mode, return light detected': 'exif.values.flash.firedAutoReturn',
  'Flash fired, compulsory flash mode': 'exif.values.flash.firedCompulsory',
  'Flash fired, compulsory flash mode, return light not detected': 'exif.values.flash.firedCompulsoryNoReturn',
  'Flash fired, compulsory flash mode, return light detected': 'exif.values.flash.firedCompulsoryReturn',
  'Flash did not fire, auto mode': 'exif.values.flash.didNotFireAuto',
  'Flash did not fire, compulsory flash mode': 'exif.values.flash.didNotFireCompulsory',
  'No flash function': 'exif.values.flash.noFunction',
  'Flash fired, red-eye reduction mode': 'exif.values.flash.firedRedEye',
  'Flash fired, red-eye reduction mode, return light not detected': 'exif.values.flash.firedRedEyeNoReturn',
  'Flash fired, red-eye reduction mode, return light detected': 'exif.values.flash.firedRedEyeReturn',
}

// 测光模式映射
export const meteringModeMap: Record<string, string> = {
  'Unknown': 'exif.values.meteringMode.unknown',
  'Average': 'exif.values.meteringMode.average',
  'Center-weighted average': 'exif.values.meteringMode.centerWeighted',
  'Spot': 'exif.values.meteringMode.spot',
  'Multi-spot': 'exif.values.meteringMode.multiSpot',
  'Multi-segment': 'exif.values.meteringMode.multiSegment',
  'Pattern': 'exif.values.meteringMode.pattern',
  'Partial': 'exif.values.meteringMode.partial',
  'Other': 'exif.values.meteringMode.other',
}

// 白平衡映射
export const whiteBalanceMap: Record<string, string> = {
  'Auto': 'exif.values.whiteBalance.auto',
  'Manual': 'exif.values.whiteBalance.manual',
  'Daylight': 'exif.values.whiteBalance.daylight',
  'Cloudy': 'exif.values.whiteBalance.cloudy',
  'Shade': 'exif.values.whiteBalance.shade',
  'Tungsten': 'exif.values.whiteBalance.tungsten',
  'Fluorescent': 'exif.values.whiteBalance.fluorescent',
  'Flash': 'exif.values.whiteBalance.flash',
  'Fine Weather': 'exif.values.whiteBalance.fineWeather',
  'Cloudy Weather': 'exif.values.whiteBalance.cloudyWeather',
  'Tungsten (Incandescent)': 'exif.values.whiteBalance.tungsten',
  'White Fluorescent': 'exif.values.whiteBalance.whiteFluorescent',
  'Cool White Fluorescent': 'exif.values.whiteBalance.coolWhiteFluorescent',
  'Day White Fluorescent': 'exif.values.whiteBalance.dayWhiteFluorescent',
  'Daylight Fluorescent': 'exif.values.whiteBalance.daylightFluorescent',
  'Underwater': 'exif.values.whiteBalance.underwater',
}

// 闪光灯测光模式映射
export const flashMeteringModeMap: Record<string, string> = {
  'TTL': 'exif.values.flashMeteringMode.ttl',
  'Average': 'exif.values.flashMeteringMode.average',
  'Matrix': 'exif.values.flashMeteringMode.matrix',
  'Center-weighted': 'exif.values.flashMeteringMode.centerWeighted',
  'Spot': 'exif.values.flashMeteringMode.spot',
  'Multi-spot': 'exif.values.flashMeteringMode.multiSpot',
  'Other': 'exif.values.flashMeteringMode.other',
}

// 场景捕捉类型映射
export const sceneCaptureTypeMap: Record<string, string> = {
  'Standard': 'exif.values.sceneCaptureType.standard',
  'Landscape': 'exif.values.sceneCaptureType.landscape',
  'Portrait': 'exif.values.sceneCaptureType.portrait',
  'Night': 'exif.values.sceneCaptureType.night',
  'Night Scene': 'exif.values.sceneCaptureType.night',
  'Other': 'exif.values.sceneCaptureType.other',
}

// 感光方式映射
export const sensingMethodMap: Record<string, string> = {
  'Not defined': 'exif.values.sensingMethod.notDefined',
  'One-chip color area': 'exif.values.sensingMethod.oneChipColor',
  'Two-chip color area': 'exif.values.sensingMethod.twoChipColor',
  'Three-chip color area': 'exif.values.sensingMethod.threeChipColor',
  'Color sequential area': 'exif.values.sensingMethod.colorSequential',
  'Trilinear': 'exif.values.sensingMethod.trilinear',
  'Color sequential linear': 'exif.values.sensingMethod.colorSequentialLinear',
}

// 色彩空间映射
export const colorSpaceMap: Record<string, string> = {
  'sRGB': 'exif.values.colorSpace.sRGB',
  'Adobe RGB': 'exif.values.colorSpace.adobeRGB',
  'Uncalibrated': 'exif.values.colorSpace.uncalibrated',
  'ProPhoto RGB': 'exif.values.colorSpace.proPhotoRGB',
}

/**
 * 本地化EXIF字段值
 * @param fieldName EXIF字段名
 * @param value 原始值
 * @param $t 翻译函数
 * @returns 本地化后的值或原始值
 */
export function localizeExifValue(
  fieldName: string,
  value: string | number | undefined,
  $t: (key: string) => string,
): string {
  if (!value) return ''

  const stringValue = String(value)

  switch (fieldName) {
    case 'ExposureProgram':
      return exposureProgramMap[stringValue] 
        ? $t(exposureProgramMap[stringValue]) 
        : stringValue

    case 'ExposureMode':
      return exposureModeMap[stringValue] 
        ? $t(exposureModeMap[stringValue]) 
        : stringValue

    case 'Flash':
      return flashMap[stringValue] 
        ? $t(flashMap[stringValue]) 
        : stringValue

    case 'FlashMeteringMode':
      return flashMeteringModeMap[stringValue] 
        ? $t(flashMeteringModeMap[stringValue]) 
        : stringValue

    case 'MeteringMode':
      return meteringModeMap[stringValue] 
        ? $t(meteringModeMap[stringValue]) 
        : stringValue

    case 'WhiteBalance':
      return whiteBalanceMap[stringValue] 
        ? $t(whiteBalanceMap[stringValue]) 
        : stringValue

    case 'SceneCaptureType':
      return sceneCaptureTypeMap[stringValue] 
        ? $t(sceneCaptureTypeMap[stringValue]) 
        : stringValue

    case 'SensingMethod':
      return sensingMethodMap[stringValue] 
        ? $t(sensingMethodMap[stringValue]) 
        : stringValue

    case 'ColorSpace':
      return colorSpaceMap[stringValue] 
        ? $t(colorSpaceMap[stringValue]) 
        : stringValue

    default:
      return stringValue
  }
}
