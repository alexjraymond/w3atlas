import type { Race, Matchup } from '../types'

export interface Ability {
  name: string
  icon: string
  ultimate?: boolean
}

export interface Hero {
  name: string
  icon: string
  race: Race | 'neutral'
  abilities: Ability[] // 3 basics + ultimate last
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')

function hero(name: string, race: Hero['race'], basics: string[], ult: string): Hero {
  return {
    name,
    race,
    icon: slug(name),
    abilities: [
      ...basics.map((b) => ({ name: b, icon: slug(b) })),
      { name: ult, icon: slug(ult), ultimate: true },
    ],
  }
}

export const HEROES: Hero[] = [
  hero('Archmage', 'human', ['Blizzard', 'Summon Water Elemental', 'Brilliance Aura'], 'Mass Teleport'),
  hero('Mountain King', 'human', ['Storm Bolt', 'Thunder Clap', 'Bash'], 'Avatar'),
  hero('Paladin', 'human', ['Holy Light', 'Divine Shield', 'Devotion Aura'], 'Resurrection'),
  hero('Blood Mage', 'human', ['Flame Strike', 'Banish', 'Siphon Mana'], 'Phoenix'),

  hero('Blademaster', 'orc', ['Wind Walk', 'Mirror Image', 'Critical Strike'], 'Bladestorm'),
  hero('Far Seer', 'orc', ['Chain Lightning', 'Far Sight', 'Feral Spirit'], 'Earthquake'),
  hero('Tauren Chieftain', 'orc', ['Shockwave', 'War Stomp', 'Endurance Aura'], 'Reincarnation'),
  hero('Shadow Hunter', 'orc', ['Healing Wave', 'Hex', 'Serpent Ward'], 'Big Bad Voodoo'),

  hero('Demon Hunter', 'nightelf', ['Mana Burn', 'Immolation', 'Evasion'], 'Metamorphosis'),
  hero('Keeper of the Grove', 'nightelf', ['Entangling Roots', 'Force of Nature', 'Thorns Aura'], 'Tranquility'),
  hero('Priestess of the Moon', 'nightelf', ['Scout', 'Searing Arrows', 'Trueshot Aura'], 'Starfall'),
  hero('Warden', 'nightelf', ['Fan of Knives', 'Blink', 'Shadow Strike'], 'Vengeance'),

  hero('Death Knight', 'undead', ['Death Coil', 'Death Pact', 'Unholy Aura'], 'Animate Dead'),
  hero('Dreadlord', 'undead', ['Carrion Swarm', 'Sleep', 'Vampiric Aura'], 'Inferno'),
  hero('Lich', 'undead', ['Frost Nova', 'Frost Armor', 'Dark Ritual'], 'Death and Decay'),
  hero('Crypt Lord', 'undead', ['Impale', 'Spiked Carapace', 'Carrion Beetles'], 'Locust Swarm'),

  hero('Naga Sea Witch', 'neutral', ['Forked Lightning', 'Frost Arrows', 'Mana Shield'], 'Tornado'),
  hero('Dark Ranger', 'neutral', ['Silence', 'Black Arrow', 'Life Drain'], 'Charm'),
  hero('Pandaren Brewmaster', 'neutral', ['Breath of Fire', 'Drunken Haze', 'Drunken Brawler'], 'Storm, Earth, and Fire'),
  hero('Beastmaster', 'neutral', ['Summon Bear', 'Summon Quilbeast', 'Summon Hawk'], 'Stampede'),
  hero('Pit Lord', 'neutral', ['Rain of Fire', 'Howl of Terror', 'Cleaving Attack'], 'Doom'),
  hero('Goblin Tinker', 'neutral', ['Pocket Factory', 'Cluster Rockets', 'Engineering Upgrade'], 'Robo-Goblin'),
  hero('Firelord', 'neutral', ['Soul Burn', 'Summon Lava Spawn', 'Incinerate'], 'Volcano'),
  hero('Goblin Alchemist', 'neutral', ['Healing Spray', 'Acid Bomb', 'Chemical Rage'], 'Transmute'),
]

// Icon filenames that don't match the slug of the display name.
const ICON_ALIASES: Record<string, string> = {
  goblintinker: 'tinker',
  goblinalchemist: 'alchemist',
  divineshield: 'holyshield',
  flamestrike: 'flamestrike',
  inferno: 'infernal',
  stormearthandfire: 'stormearth&fire',
}
for (const h of HEROES) {
  h.icon = ICON_ALIASES[h.icon] ?? h.icon
  for (const a of h.abilities) a.icon = ICON_ALIASES[a.icon] ?? a.icon
}

export const HERO_BY_NAME: Record<string, Hero> = Object.fromEntries(HEROES.map((h) => [h.name, h]))

export const RACES: { id: Race; label: string; icon: string }[] = [
  { id: 'human', label: 'Human', icon: 'human' },
  { id: 'orc', label: 'Orc', icon: 'orc' },
  { id: 'nightelf', label: 'Night Elf', icon: 'nightelf' },
  { id: 'undead', label: 'Undead', icon: 'undead' },
]

export const RACE_LABEL: Record<Matchup, string> = {
  human: 'Human',
  orc: 'Orc',
  nightelf: 'Night Elf',
  undead: 'Undead',
  random: 'Random',
  any: 'Any',
}

export const RACE_SHORT: Record<Matchup, string> = {
  human: 'H',
  orc: 'O',
  nightelf: 'NE',
  undead: 'UD',
  random: 'R',
  any: 'X',
}

/** Units commonly used to help a hero creep, by race. */
export const HELPERS: Record<Race, string[]> = {
  human: ['Militia', 'Footman', 'Rifleman', 'Water Elemental'],
  orc: ['Grunt', 'Headhunter', 'Spirit Wolf', 'Peon'],
  nightelf: ['Ancient of War', 'Ancient Protector', 'Archer', 'Huntress', 'Treant', 'Wisp'],
  undead: ['Ghoul', 'Crypt Fiend', 'Acolyte', 'Skeleton'],
}

/**
 * Skill order validation: a hero can learn a basic ability at hero levels 1/3/5 (ranks 1/2/3)
 * and the ultimate at level 6. Returns an error string for the slot or null.
 */
export function validateSkill(hero: Hero, skills: string[], index: number): string | null {
  const name = skills[index]
  if (!name) return null
  const heroLevel = index + 1
  const ability = hero.abilities.find((a) => a.name === name)
  if (!ability) return 'Unknown ability'
  const rank = skills.slice(0, index + 1).filter((s) => s === name).length
  if (ability.ultimate) {
    if (heroLevel < 6) return 'Ultimate requires hero level 6'
    if (rank > 1) return 'Ultimate has only 1 rank'
    return null
  }
  if (rank > 3) return 'Basic abilities have 3 ranks'
  const minLevel = rank * 2 - 1 // rank 1 → L1, rank 2 → L3, rank 3 → L5
  if (heroLevel < minLevel) return `Rank ${rank} requires hero level ${minLevel}`
  return null
}

export function heroesForRace(race: Race | null, includeTavern: boolean): Hero[] {
  return HEROES.filter((h) => (includeTavern && h.race === 'neutral') || (race && h.race === race))
}
