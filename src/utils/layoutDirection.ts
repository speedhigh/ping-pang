export type LayoutDirection = 'up' | 'down' | 'left' | 'right'

export type LayoutDirectionPreset = LayoutDirection | 'custom'

export type LayoutDirectionTarget = 'scoreA' | 'hub' | 'scoreB' | 'gameWinsA' | 'gameWinsB'

export interface LayoutDirections {
  scoreA: LayoutDirection
  hub: LayoutDirection
  scoreB: LayoutDirection
  gameWinsA: LayoutDirection
  gameWinsB: LayoutDirection
}

export const DEFAULT_LAYOUT_DIRECTIONS: LayoutDirections = {
  scoreA: 'up',
  hub: 'up',
  scoreB: 'up',
  gameWinsA: 'up',
  gameWinsB: 'up',
}

export const DIRECTION_OPTIONS: { value: LayoutDirection; label: string }[] = [
  { value: 'up', label: '上' },
  { value: 'down', label: '下' },
  { value: 'left', label: '左' },
  { value: 'right', label: '右' },
]

export const DIRECTION_PRESET_OPTIONS: { value: LayoutDirectionPreset; label: string }[] = [
  ...DIRECTION_OPTIONS,
  { value: 'custom', label: '自定义' },
]

const LAYOUT_DIRECTION_TARGETS: LayoutDirectionTarget[] = [
  'scoreA',
  'hub',
  'scoreB',
  'gameWinsA',
  'gameWinsB',
]

const VALID_DIRECTIONS = new Set<LayoutDirection>(['up', 'down', 'left', 'right'])

export function normalizeLayoutDirections(input: Partial<LayoutDirections> | undefined): LayoutDirections {
  return {
    scoreA: VALID_DIRECTIONS.has(input?.scoreA as LayoutDirection) ? input!.scoreA! : 'up',
    hub: VALID_DIRECTIONS.has(input?.hub as LayoutDirection) ? input!.hub! : 'up',
    scoreB: VALID_DIRECTIONS.has(input?.scoreB as LayoutDirection) ? input!.scoreB! : 'up',
    gameWinsA: VALID_DIRECTIONS.has(input?.gameWinsA as LayoutDirection) ? input!.gameWinsA! : 'up',
    gameWinsB: VALID_DIRECTIONS.has(input?.gameWinsB as LayoutDirection) ? input!.gameWinsB! : 'up',
  }
}

export function layoutDirectionsFromPreset(direction: LayoutDirection): LayoutDirections {
  return {
    scoreA: direction,
    hub: direction,
    scoreB: direction,
    gameWinsA: direction,
    gameWinsB: direction,
  }
}

export function getLayoutDirectionPreset(directions: LayoutDirections): LayoutDirectionPreset {
  const values = LAYOUT_DIRECTION_TARGETS.map((target) => directions[target])
  const first = values[0]!
  return values.every((value) => value === first) ? first : 'custom'
}

/** 旧版横屏对打 → 独立方向配置 */
export function layoutDirectionsFromLegacyViewMode(viewMode: string | undefined): LayoutDirections {
  if (viewMode === 'landscape') {
    return {
      scoreA: 'left',
      hub: 'right',
      scoreB: 'right',
      gameWinsA: 'left',
      gameWinsB: 'right',
    }
  }
  return DEFAULT_LAYOUT_DIRECTIONS
}

export function directionRotateClass(direction: LayoutDirection): string {
  switch (direction) {
    case 'down':
      return 'dir-rotate-down'
    case 'left':
      return 'dir-rotate-left'
    case 'right':
      return 'dir-rotate-right'
    default:
      return ''
  }
}
