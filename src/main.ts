import { createApp } from 'vue'
import { applyThemeToDocument, getTheme } from './themes/config'
import { DEFAULT_THEME_ID } from './types/game'
import './style.css'
import App from './App.vue'

function initialThemeId(): string {
  try {
    const raw = localStorage.getItem('ping-pang-state')
    if (raw) {
      const parsed = JSON.parse(raw) as { themeId?: string }
      if (parsed.themeId) return parsed.themeId
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_THEME_ID
}

applyThemeToDocument(getTheme(initialThemeId()))

createApp(App).mount('#app')
