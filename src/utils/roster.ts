import { BUILTIN_HERO_IDS, DEFAULT_ROSTER, type RosterHero } from '../types/roster'
import type { Participant, PlayerId } from '../types/game'
import { DEFAULT_PARTICIPANTS } from '../types/game'

export function cloneRoster(list: RosterHero[]): RosterHero[] {
  return list.map((h) => ({ ...h }))
}

export function defaultRoster(): RosterHero[] {
  return cloneRoster(DEFAULT_ROSTER)
}

export function normalizeRoster(input: RosterHero[] | undefined): RosterHero[] {
  const builtins = defaultRoster()
  if (!input?.length) return builtins

  const custom = input.filter((h) => !h.builtin && h.id !== BUILTIN_HERO_IDS.A && h.id !== BUILTIN_HERO_IDS.B)
  const heroA = input.find((h) => h.id === BUILTIN_HERO_IDS.A) ?? builtins[0]!
  const heroB = input.find((h) => h.id === BUILTIN_HERO_IDS.B) ?? builtins[1]!

  return [
    { ...builtins[0]!, name: heroA.builtin ? builtins[0]!.name : heroA.name, emoji: builtins[0]!.emoji, builtin: true },
    { ...builtins[1]!, name: heroB.builtin ? builtins[1]!.name : heroB.name, emoji: builtins[1]!.emoji, builtin: true },
    ...custom.map((h) => ({
      id: h.id,
      name: h.name.trim() || '新选手',
      emoji: h.emoji || '⭐',
      builtin: false as const,
    })),
  ]
}

export function rosterHeroById(roster: RosterHero[], id: string | null | undefined): RosterHero | undefined {
  if (!id) return undefined
  return roster.find((h) => h.id === id)
}

export function participantFromHero(id: PlayerId, hero: RosterHero): Participant {
  return { id, name: hero.name, emoji: hero.emoji, rosterId: hero.id }
}

export function defaultParticipants(): Participant[] {
  const roster = defaultRoster()
  return [
    participantFromHero('A', roster[0]!),
    participantFromHero('B', roster[1]!),
  ]
}

export function participantsFromRosterIds(
  roster: RosterHero[],
  rosterIdA: string,
  rosterIdB: string,
): Participant[] {
  const heroA = rosterHeroById(roster, rosterIdA) ?? roster.find((h) => h.id === BUILTIN_HERO_IDS.A)!
  const heroB = rosterHeroById(roster, rosterIdB) ?? roster.find((h) => h.id === BUILTIN_HERO_IDS.B)!
  return [participantFromHero('A', heroA), participantFromHero('B', heroB)]
}

export function rosterIdForPlayer(participants: Participant[], id: PlayerId): string {
  const p = participants.find((x) => x.id === id)
  if (p?.rosterId) return p.rosterId
  return id === 'A' ? BUILTIN_HERO_IDS.A : BUILTIN_HERO_IDS.B
}

/** 街机式点选：1P=A 槽，2P=B 槽 */
export function applyRosterTap(
  heroId: string,
  slotA: string | null,
  slotB: string | null,
): { slotA: string | null; slotB: string | null; changed: boolean } {
  if (slotA === heroId) {
    return { slotA: null, slotB, changed: true }
  }
  if (slotB === heroId) {
    return { slotA, slotB: null, changed: true }
  }
  if (!slotA) {
    return { slotA: heroId, slotB, changed: true }
  }
  if (!slotB && heroId !== slotA) {
    return { slotA, slotB: heroId, changed: true }
  }
  return { slotA, slotB, changed: false }
}

export function slotLabelForRosterId(
  rosterId: string,
  slotA: string | null,
  slotB: string | null,
): '1P' | '2P' | null {
  if (slotA === rosterId) return '1P'
  if (slotB === rosterId) return '2P'
  return null
}

export function isHeroInUse(rosterId: string, slotA: string | null, slotB: string | null): boolean {
  return rosterId === slotA || rosterId === slotB
}

export function createCustomHeroId(): string {
  return `hero-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

export function migrateParticipantsToRoster(
  participants: Participant[] | undefined,
  roster: RosterHero[] | undefined,
): { roster: RosterHero[]; participants: Participant[] } {
  const nextRoster = normalizeRoster(roster)
  const legacy = participants?.length ? participants : DEFAULT_PARTICIPANTS

  const rosterIdA = legacy.find((p) => p.id === 'A')?.rosterId ?? BUILTIN_HERO_IDS.A
  const rosterIdB = legacy.find((p) => p.id === 'B')?.rosterId ?? BUILTIN_HERO_IDS.B

  const withEmoji = legacy.every((p) => 'emoji' in p && p.emoji)
  if (withEmoji && roster?.length) {
    return {
      roster: nextRoster,
      participants: participantsFromRosterIds(nextRoster, rosterIdA, rosterIdB),
    }
  }

  return {
    roster: nextRoster,
    participants: participantsFromRosterIds(nextRoster, BUILTIN_HERO_IDS.A, BUILTIN_HERO_IDS.B),
  }
}
