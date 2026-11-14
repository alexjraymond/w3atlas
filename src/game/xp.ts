// Warcraft III hero experience rules (current ladder patches).

/** Raw XP a creep of a given level is worth. */
export const CREEP_XP_BY_LEVEL = [0, 25, 40, 60, 85, 115, 150, 190, 235, 285, 340] as const

/** Total XP needed to *reach* each hero level (index = level). */
export const HERO_XP_TO_REACH = [0, 0, 200, 500, 900, 1400, 2000, 2700, 3500, 4400, 5400] as const

/** Share of creep XP a hero receives at its current level. Heroes stop gaining creep XP at 5. */
export const CREEP_XP_RATE_BY_HERO_LEVEL = [0, 0.8, 0.7, 0.62, 0.55, 0, 0, 0, 0, 0, 0] as const

export const MAX_HERO_LEVEL = 10

export function creepXp(level: number): number {
  if (level <= 0) return 0
  if (level >= CREEP_XP_BY_LEVEL.length) {
    // Beyond table: WC3 formula continues growing by +5 per level step
    const last = CREEP_XP_BY_LEVEL.length - 1
    let xp: number = CREEP_XP_BY_LEVEL[last]
    let inc = CREEP_XP_BY_LEVEL[last] - CREEP_XP_BY_LEVEL[last - 1]
    for (let l = last + 1; l <= level; l++) {
      inc += 5
      xp += inc
    }
    return xp
  }
  return CREEP_XP_BY_LEVEL[level]
}

export function heroLevelForXp(xp: number): number {
  let level = 1
  for (let l = 2; l <= MAX_HERO_LEVEL; l++) {
    if (xp >= HERO_XP_TO_REACH[l]) level = l
    else break
  }
  return level
}

/** XP a hero with `heroXp` total experience gains from killing one creep of `creepLevel`. */
export function xpFromKill(heroXp: number, creepLevel: number): number {
  const rate = CREEP_XP_RATE_BY_HERO_LEVEL[heroLevelForXp(heroXp)] ?? 0
  return creepXp(creepLevel) * rate
}

export interface LevelProgress {
  xp: number
  level: number
  /** 0..1 progress toward next level (1 when capped). */
  progress: number
  /** Fractional level, e.g. 2.45 */
  exact: number
  intoLevel: number
  levelSpan: number
}

export function levelProgress(xp: number): LevelProgress {
  const level = heroLevelForXp(xp)
  if (level >= MAX_HERO_LEVEL) {
    return { xp, level, progress: 1, exact: level, intoLevel: 0, levelSpan: 0 }
  }
  const base = HERO_XP_TO_REACH[level]
  const span = HERO_XP_TO_REACH[level + 1] - base
  const into = xp - base
  const progress = Math.min(1, into / span)
  return { xp, level, progress, exact: level + progress, intoLevel: into, levelSpan: span }
}
