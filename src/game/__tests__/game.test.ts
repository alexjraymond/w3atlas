import { describe, expect, it } from 'vitest'
import { creepXp, heroLevelForXp, levelProgress, xpFromKill } from '../xp'
import { parseBuildOrder, newRoute, newStep, newWaypoint, simulateRoute } from '../route'
import { autoSkills, HERO_BY_NAME, maxOrder, validateSkill } from '../heroes'
import { MAP_BY_ID, MAPS, POOL_MAPS, campInstances } from '../../data/maps'
import { sanitizeRoute } from '../../store/sanitize'
import { decodeShare, encodeShare } from '../../store'
import type { RouteStep } from '../../types'

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
  it('rate drops with hero level, rounds down per kill, stops at 5', () => {
    expect(xpFromKill(0, creepXp(2))).toBe(32) // 40 * 0.8
    expect(xpFromKill(250, creepXp(4))).toBe(59) // 85 * 0.7 = 59.5
    expect(xpFromKill(1400, creepXp(5))).toBe(0)
  })
  it('level progress', () => {
    const p = levelProgress(350)
    expect(p.level).toBe(2)
    expect(p.exact).toBeCloseTo(2.5)
  })
})

describe('maps', () => {
  it('loads all maps with sane camps', () => {
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
  it('reads multiple drops per creep and fills random drops from the item pools', () => {
    const magi = MAP_BY_ID['autumn_leaves'].camps.find((c) => c.id === 'orange-camp-expo-frontal-1')!
    const drops = magi.units.find((u) => u.name === 'Ogre Magi')!.drops
    expect(drops.map((d) => `${d.type}-${d.level}`)).toEqual(['permanent-1', 'powerup-2'])
    expect(drops.every((d) => d.items.length > 0)).toBe(true)
  })
  it('uses game-data levels: camp totals match', () => {
    const al = MAP_BY_ID['autumn_leaves']
    const total = (id: string) => al.camps.find((c) => c.id === id)!.level
    expect(total('green-camp-wolves-1')).toBe(7)
    // Giant Skeleton Warrior (nskg) is level 3 in the game data; Liquipedia lists a level 1 Skeleton Warrior
    expect(total('green-camp-sludge-1')).toBe(7)
    expect(total('green-camp-rogue-1')).toBe(8)
    expect(total('orange-camp-expo-corner-1')).toBe(14)
    expect(total('orange-camp-merc')).toBe(19)
    expect(total('orange-camp-lab')).toBe(17)
    expect(total('red-camp-granite-1')).toBe(21)
  })
  it('creep names come from the game data by unit id', () => {
    const sludge = MAP_BY_ID['autumn_leaves'].camps.find((c) => c.id === 'green-camp-sludge-1')!
    expect(sludge.units.map((u) => u.name)).toContain('Giant Skeleton Warrior')
  })
  it('hides maps outside the ladder pool from lists', () => {
    expect(MAP_BY_ID['concealed_hill'].hidden).toBe(true)
    expect(POOL_MAPS.some((m) => m.id === 'concealed_hill')).toBe(false)
  })
  it('names camps after the item dropper', () => {
    const shop = MAP_BY_ID['autumn_leaves'].camps.find((c) => c.id === 'orange-camp-shop-1')!
    expect(shop.title).toBe('Sasquatch +2')
    expect(shop.level).toBe(12)
  })
})

// The three stops from a warcraft-gym Autumn Leaves route (Archmage, HvH):
//   Sasquatch +2: trolls first (+116), then Sasquatch (+92) -> Lv 2, 208 xp
//   Forest Troll Berserker +2 -> Lv 2, 337 xp
//   Ogre Magi +2 -> Lv 3, 501 xp
describe('route simulation', () => {
  const map = MAP_BY_ID['autumn_leaves']
  it('matches a known route exactly', () => {
    const s1: RouteStep = { ...newStep('orange-camp-shop-1'), groups: [['1-0', '2-0'], ['0-0']] }
    const { results } = simulateRoute(map, [s1, newStep('green-camp-trolls-2'), newStep('orange-camp-expo-frontal-2')])
    expect(results[0].groups.map((g) => g.xpGained)).toEqual([116, 92])
    expect(results[0].groups[1].levelUps).toEqual([2])
    expect(results[0].after.xp).toBe(208)
    expect(results[1].after.xp).toBe(337)
    expect(results[2].after.xp).toBe(501)
    expect(results[2].after.level).toBe(3)
  })
  it('skip the rest only kills the chosen groups', () => {
    const step: RouteStep = { ...newStep('green-camp-wolves-1'), groups: [['0-0']], rest: 'skip' }
    const r = simulateRoute(map, [step]).results[0]
    expect(r.killed).toBe(1)
    expect(r.total).toBe(3)
  })
  it('waypoints give no xp but count as stops', () => {
    const { results } = simulateRoute(map, [newWaypoint(10, 10, 'Shop'), newStep('green-camp-wolves-1')])
    expect(results[0].xpGained).toBe(0)
    expect(results[1].xpGained).toBeGreaterThan(0)
  })
  it('instances expand counts', () => {
    expect(campInstances(map.camps.find((c) => c.id === 'green-camp-wolves-1')!)).toHaveLength(3)
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

describe('skill priority', () => {
  const dk = HERO_BY_NAME['Death Knight']
  it('fills 10 levels from a max order, ultimate at 6, respecting rank limits', () => {
    const s = autoSkills(dk, ['Death Coil', 'Unholy Aura'])
    expect(s).toEqual([
      'Death Coil', 'Unholy Aura', 'Death Coil', 'Unholy Aura', 'Death Coil',
      'Animate Dead', 'Unholy Aura', 'Death Pact', 'Death Pact', 'Death Pact',
    ])
    expect(s.every((_, i) => validateSkill(dk, s, i) === null)).toBe(true)
    expect(maxOrder(dk, s)).toEqual(['Death Coil', 'Unholy Aura', 'Death Pact'])
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
  it('rejects unknown maps and junk steps', () => {
    expect(sanitizeRoute({ mapId: 'nope' })).toBeNull()
    const r = sanitizeRoute({ mapId: 'autumn_leaves', skills: ['Blizzard'], steps: [{ campId: 'red-camp-granite-1' }, { bad: 1 }, { campId: 'nope' }] })!
    expect(r.route.skills).toHaveLength(10)
    expect(r.route.steps).toHaveLength(1)
  })
  it('migrates v1 routes: skipped creeps and inline build orders', () => {
    const v1 = {
      mapId: 'autumn_leaves',
      name: 'Old',
      vs: 'random',
      steps: [{ id: 'a', campId: 'green-camp-wolves-1', skipped: ['1-1'], helpers: { Militia: 3 }, note: 'x' }],
      build: [{ supply: '5', time: '', action: 'Altar' }],
    }
    const { route, legacyBuild } = sanitizeRoute(v1)!
    expect(route.vs).toBe('any')
    expect(route.steps[0].groups).toEqual([['0-0', '1-0']])
    expect(route.steps[0].rest).toBe('skip')
    expect(route.steps[0].helpers).toEqual({ Militia: 3 })
    expect(legacyBuild?.steps[0].action).toBe('Altar')
    expect(route.buildId).toBe(legacyBuild?.id)
  })
  it('share links round-trip (unicode safe)', () => {
    const r = newRoute('autumn_leaves', { name: 'Fast expo ⚔️', notes: 'naïve' })
    const back = decodeShare(encodeShare(r))!
    expect(back.route.name).toBe('Fast expo ⚔️')
    expect(back.route.notes).toBe('naïve')
  })
})
