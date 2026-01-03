export function detectLanguage(text: string): string | null {
  if (!text || text.trim().length === 0) {
    return null
  }

  if (/[\u4e00-\u9fff\u3400-\u4dbf]/.test(text)) {
    return "zh"
  }

  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) {
    return "ja"
  }

  if (/[\uac00-\ud7af]/.test(text)) {
    return "ko"
  }

  if (/[\u0400-\u04ff]/.test(text)) {
    return "ru"
  }

  if (/[\u0600-\u06ff]/.test(text)) {
    return "ar"
  }

  if (/[\u0e00-\u0e7f]/.test(text)) {
    return "th"
  }

  if (/[\u0590-\u05ff]/.test(text)) {
    return "he"
  }

  if (/[\u0900-\u097f]/.test(text)) {
    return "hi"
  }

  if (/[\u0980-\u09ff]/.test(text)) {
    return "bn"
  }

  if (/[\u0a80-\u0aff]/.test(text)) {
    return "gu"
  }

  if (/[\u0b80-\u0bff]/.test(text)) {
    return "ta"
  }

  if (/[\u0c00-\u0c7f]/.test(text)) {
    return "te"
  }

  if (/[\u0c80-\u0cff]/.test(text)) {
    return "kn"
  }

  if (/[\u0d00-\u0d7f]/.test(text)) {
    return "ml"
  }

  if (/[\u10a0-\u10ff]/.test(text)) {
    return "ka"
  }

  return null
}
