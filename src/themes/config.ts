import { setMetaThemeColor } from '../utils/themeColor'

export interface ThemeConfig {
  id: string
  name: string
  playerA: string
  playerB: string
  /** 状态栏 / 浏览器顶栏色（与 Header 一致） */
  statusBarColor: string
  /** 弹窗打开时的状态栏色 */
  overlayStatusBarColor: string
  hubBg: string
  hubText: string
  hubMuted: string
  overlayBg: string
  panelBg: string
  panelText: string
  panelMuted: string
  panelBorder: string
}

export const THEMES: ThemeConfig[] = [
  {
    id: 'arena-duo',
    name: '炎 & 潮',
    playerA: '#E84855',
    playerB: '#3B82C4',
    statusBarColor: '#E84855',
    overlayStatusBarColor: '#1C1C1E',
    hubBg: '#FFFFFF',
    hubText: '#1C1C1E',
    hubMuted: '#8E8E93',
    overlayBg: 'rgba(0, 0, 0, 0.55)',
    panelBg: '#1C1C1E',
    panelText: '#FFFFFF',
    panelMuted: 'rgba(255, 255, 255, 0.55)',
    panelBorder: 'rgba(255, 255, 255, 0.12)',
  },
  {
    id: 'classic-arena',
    name: '林 & 渊',
    playerA: '#2D8B57',
    playerB: '#2A6B7C',
    statusBarColor: '#2D8B57',
    overlayStatusBarColor: '#142420',
    hubBg: '#F5F7F6',
    hubText: '#1A2E28',
    hubMuted: '#6B7F78',
    overlayBg: 'rgba(10, 20, 16, 0.62)',
    panelBg: '#142420',
    panelText: '#FFFFFF',
    panelMuted: 'rgba(255, 255, 255, 0.55)',
    panelBorder: 'rgba(255, 255, 255, 0.1)',
  },
  {
    id: 'terracotta-slate',
    name: '焰 & 刃',
    playerA: '#C4684A',
    playerB: '#5A7282',
    statusBarColor: '#C4684A',
    overlayStatusBarColor: '#2A2420',
    hubBg: '#FAF8F6',
    hubText: '#2C2420',
    hubMuted: '#8A7F78',
    overlayBg: 'rgba(30, 24, 20, 0.58)',
    panelBg: '#2A2420',
    panelText: '#FFFFFF',
    panelMuted: 'rgba(255, 255, 255, 0.55)',
    panelBorder: 'rgba(255, 255, 255, 0.1)',
  },
  {
    id: 'plum-steel',
    name: '紫 & 钢',
    playerA: '#7B5E8A',
    playerB: '#4A6572',
    statusBarColor: '#7B5E8A',
    overlayStatusBarColor: '#221E28',
    hubBg: '#F7F6F8',
    hubText: '#2A2430',
    hubMuted: '#857A8F',
    overlayBg: 'rgba(20, 16, 28, 0.58)',
    panelBg: '#221E28',
    panelText: '#FFFFFF',
    panelMuted: 'rgba(255, 255, 255, 0.55)',
    panelBorder: 'rgba(255, 255, 255, 0.1)',
  },
  {
    id: 'glow-mist',
    name: '霞 & 雾',
    playerA: '#D46B7A',
    playerB: '#889098',
    statusBarColor: '#D46B7A',
    overlayStatusBarColor: '#241E22',
    hubBg: '#FAF7F8',
    hubText: '#2C2428',
    hubMuted: '#8F858A',
    overlayBg: 'rgba(28, 22, 26, 0.58)',
    panelBg: '#241E22',
    panelText: '#FFFFFF',
    panelMuted: 'rgba(255, 255, 255, 0.55)',
    panelBorder: 'rgba(255, 255, 255, 0.1)',
  },
  {
    id: 'star-sea',
    name: '星 & 海',
    playerA: '#C9A038',
    playerB: '#2E6088',
    statusBarColor: '#C9A038',
    overlayStatusBarColor: '#1A2430',
    hubBg: '#F7F6F2',
    hubText: '#242830',
    hubMuted: '#848A90',
    overlayBg: 'rgba(16, 24, 36, 0.58)',
    panelBg: '#1A2430',
    panelText: '#FFFFFF',
    panelMuted: 'rgba(255, 255, 255, 0.55)',
    panelBorder: 'rgba(255, 255, 255, 0.1)',
  },
]

export const THEME_IDS = THEMES.map((t) => t.id)

export type ThemeId = (typeof THEME_IDS)[number]

export function getTheme(id: string): ThemeConfig {
  return THEMES.find((t) => t.id === id) ?? THEMES[0]!
}

export function applyThemeToDocument(theme: ThemeConfig) {
  const root = document.documentElement
  root.dataset.theme = theme.id
  root.style.setProperty('--player-a-bg', theme.playerA)
  root.style.setProperty('--player-b-bg', theme.playerB)
  root.style.setProperty('--header-bg', theme.playerA)
  root.style.setProperty('--header-text', '#ffffff')
  root.style.setProperty('--hub-bg', theme.hubBg)
  root.style.setProperty('--hub-text', theme.hubText)
  root.style.setProperty('--hub-muted', theme.hubMuted)
  root.style.setProperty('--overlay-bg', theme.overlayBg)
  root.style.setProperty('--panel-bg', theme.panelBg)
  root.style.setProperty('--panel-text', theme.panelText)
  root.style.setProperty('--panel-muted', theme.panelMuted)
  root.style.setProperty('--panel-border', theme.panelBorder)
  root.style.setProperty('--player-text', '#ffffff')
  root.style.setProperty('--player-text-muted', 'rgba(255, 255, 255, 0.82)')
  root.style.setProperty('--hub-shadow', '0 8px 32px rgba(0, 0, 0, 0.22)')
  root.style.setProperty(
    '--score-box-gradient',
    `linear-gradient(180deg, ${theme.playerA} 0%, ${theme.playerB} 100%)`,
  )
  setMetaThemeColor(theme.statusBarColor)
}

export function applyOverlayStatusBar(theme: ThemeConfig) {
  setMetaThemeColor(theme.overlayStatusBarColor)
}

export function restoreStatusBar(theme: ThemeConfig) {
  setMetaThemeColor(theme.statusBarColor)
}
