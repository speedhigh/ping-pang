import { BUILTIN_HERO_EMOJI } from '../types/roster'

export interface EmojiCategory {
  id: string
  label: string
  emojis: string[]
}

export const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    id: 'people',
    label: '人物',
    emojis: ['😀', '😎', '🤓', '🧑', '👦', '👧', '🧔', '👩', '🧑‍🦱', '👨‍🦰', '👩‍🦱', '🦸', '🦹', '🧙', '🧚', '👻', '🤖', '👽'],
  },
  {
    id: 'animals',
    label: '动物',
    emojis: ['🐱', '🐶', '🐰', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🦊', '🐺', '🦄', '🐔', '🐧', '🦋', '🐝', '🐢'],
  },
  {
    id: 'plants',
    label: '植物',
    emojis: ['🌸', '🌺', '🌻', '🌹', '🌷', '🌼', '🍀', '🌿', '🌳', '🌴', '🌵', '🍄', '🌾', '🍁', '🍂'],
  },
  {
    id: 'food',
    label: '美食',
    emojis: ['🍎', '🍊', '🍋', '🍉', '🍇', '🍓', '🍑', '🥝', '🍕', '🍔', '🍟', '🌮', '🍣', '🍜', '🍦', '🧁', '☕', '🍵'],
  },
  {
    id: 'sport',
    label: '运动',
    emojis: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🥊', '🥋', '⛳', '🎱', '🎯', '🛹', '🚴', '🏊', '⛷️', '🏂'],
  },
  {
    id: 'objects',
    label: '物件',
    emojis: ['⭐', '🌟', '💫', '🔥', '💎', '🎸', '🎹', '🎮', '🎲', '🧩', '🚀', '🛸', '🎈', '🎁', '🏆', '🥇', '🎖️', '⚡'],
  },
]

/** 供自定义角色选择（不含内置专属 emoji） */
export function selectableEmojis(): string[] {
  const all = EMOJI_CATEGORIES.flatMap((c) => c.emojis)
  return all.filter((e) => e !== BUILTIN_HERO_EMOJI)
}
