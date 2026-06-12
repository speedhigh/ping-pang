const THEME_COLOR_META = 'meta[name="theme-color"]'

export function setMetaThemeColor(color: string) {
  let meta = document.querySelector<HTMLMetaElement>(THEME_COLOR_META)
  if (!meta) {
    meta = document.createElement('meta')
    meta.name = 'theme-color'
    document.head.appendChild(meta)
  }
  meta.content = color
}
