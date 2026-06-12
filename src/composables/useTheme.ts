import { THEMES, applyThemeToDocument, getTheme } from '../themes/config'

export function useTheme(options: {
  themeId: ComputedRef<string>
  setThemeId: (id: string) => void
  sidesSwapped?: ComputedRef<boolean>
}) {
  watchEffect(() => {
    const theme = getTheme(options.themeId.value)
    const headerPlayer = options.sidesSwapped?.value ? 'B' : 'A'
    applyThemeToDocument(theme, { headerPlayer })
  })

  return {
    themes: THEMES,
    themeId: options.themeId,
    setThemeId: options.setThemeId,
  }
}
