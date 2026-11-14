import { describe, expect, it } from 'vitest'
import { creepXp, heroLevelForXp, levelProgress, xpFromKill } from '../xp'
import { parseBuildOrder, newRoute, newStep, simulateRoute } from '../route'
import { HERO_BY_NAME, validateSkill } from '../heroes'
import { MAP_BY_ID, MAPS, campInstances } from '../../data/maps'
import { decodeShare, encodeShare, sanitizeRoute } from '../../store/routes'

describe('xp', () => {
  it('creep xp table', () => {
    expect(creepXp(1)).toBe(25)
    expect(creepXp(5)).toBe(115)
    expect(creepXp(10)).toBe(340)
  })
  it('hero levels', () => {
    expect(heroLevelForXp(0)).toBe(1)
    expect(heroLevelForXp(199)).toBe(1)
    expect(heroLevelForXp(200)).toBe(2)
    expect(heroLevelForXp(1400)).toBe(5)
  })
  it('xp rate drops with hero level and stops at 5', () => {
    expect(xpFromKill(0, 2)).toBeCloseTo(32) // 40 * 0.8
    expect(xpFromKill(250, 2)).toBeCloseTo(28) // 40 * 0.7
    expect(xpFromKill(1400, 5)).toBe(0)
  })
  it('level progress', () => {
    const p = levelProgress(350)
    expect(p.level).toBe(2)
    expect(p.exact).toBeCloseTo(2.5)
  })
})

describe('maps', () => {
  it('loads all maps with camps', () => {
    expect(MAPS.length).toBeGreaterThanOrEqual(5)
    for (const m of MAPS) {
      expect(m.camps.length).toBeGreaterThan(0)
      for (const c of m.camps) {
        expect(c.position.x).toBeGreaterThanOrEqual(0)
        expect(c.position.x).toBeLessThanOrEqual(m.width)
        expect(c.position.y).toBeLessThanOrEqual(m.height)
      }
      expect(new Set(m.camps.map((c) => c.id)).size).toBe(m.camps.length)
    }
  })
  it('autumn leaves is present and mirrored', () => {
    const al = MAP_BY_ID['autumn_leaves']
    expect(al.name).toBe('Autumn Leaves')
    const camp = al.camps.find((c) => c.id === 'green-camp-wolves-1')!
    expect(campInstances(camp)).toHaveLength(3)
  })
})

describe('route simulation', () => {
  it('accumulates xp across camps in order', () => {
    const map = MAP_BY_ID['autumn_leaves']
    const steps = ['green-camp-wolves-1', 'green-camp-trolls-1'].map(newStep)
    const { results, final } = simulateRoute(map, steps)
    // wolves camp: 3 level-2 creeps = 3 * 40 * 0.8 = 96
    expect(results[0].xpGained).toBeCloseTo(96)
    expect(results[1].levelUps).toEqual([2])
    expect(final.level).toBe(2)
  })
  it('respects skipped creeps', () => {
    const map = MAP_BY_ID['autumn_leaves']
    const step = { ...newStep('green-camp-wolves-1'), skipped: ['1-0', '1-1'] }
    expect(simulateRoute(map, [step]).results[0].xpGained).toBeCloseTo(32)
  })
})

describe('skills', () => {
  const dk = HERO_BY_NAME['Death Knight']
  it('rejects early ultimate and over-ranked basics', () => {
    const s = ['Death Coil', 'Death Coil', 'Death Coil', '', '', 'Animate Dead', '', '', '', '']
    expect(validateSkill(dk, s, 0)).toBeNull()
    expect(validateSkill(dk, s, 1)).toMatch(/level 3/)
    expect(validateSkill(dk, s, 5)).toBeNull()
    expect(validateSkill(dk, ['Animate Dead'], 0)).toMatch(/level 6/)
  })
})

describe('build order parser', () => {
  it('parses common formats', () => {
    const steps = parseBuildOrder('5 - Altar\n6 Barracks\n1:45 12 Hero\n- Farm\n2:10 - 14/20 Shop')
    expect(steps.map((s) => [s.time, s.supply, s.action])).toEqual([
      ['', '5', 'Altar'],
      ['', '6', 'Barracks'],
      ['1:45', '12', 'Hero'],
      ['', '', 'Farm'],
      ['2:10', '14/20', 'Shop'],
    ])
  })
})

describe('storage', () => {
  it('sanitizes junk and keeps valid routes', () => {
    expect(sanitizeRoute({ mapId: 'nope' })).toBeNull()
    const r = sanitizeRoute({ mapId: 'autumn_leaves', name: 'x', skills: ['Blizzard'], steps: [{ campId: 'red-camp-granite-1' }, { bad: 1 }] })!
    expect(r.skills).toHaveLength(10)
    expect(r.steps).toHaveLength(1)
  })
  it('share links round-trip (unicode safe)', () => {
    const r = newRoute('autumn_leaves', { name: 'Fast expo ⚔️', notes: 'naïve' })
    const back = decodeShare(encodeShare(r))!
    expect(back.name).toBe('Fast expo ⚔️')
    expect(back.notes).toBe('naïve')
  })
})
