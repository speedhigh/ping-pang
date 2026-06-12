import { watchEffect, type ComputedRef } from 'vue'
import { THEMES, applyThemeToDocument, getTheme } from '../themes/config'

export function useTheme(options: {
  themeId: ComputedRef<string>
  setThemeId: (id: string) => void
}) {
  watchEffect(() => {
    applyThemeToDocument(getTheme(options.themeId.value))
  })

  return {
    themes: THEMES,
    themeId: options.themeId,
    setThemeId: options.setThemeId,
  }
}
