#!/usr/bin/env node
// Copies the icons W3Atlas uses from a full Warcraft III icon folder into public/icons, renamed to
// the names the app looks up (e.g. BTNHeroAvatarOfFlame.png -> public/icons/firelord.png).
//
//   npm run build-icons                         # reads public/warcraft3_icons
//   npm run build-icons -- path/to/icon/folder
//
// Which file each thing uses:
//   - heroes, creeps, units and items: the game data (wc3data) records each one's button art
//   - hero abilities: the table below
// Reforged/HD variants are skipped: only the classic file with the exact name is used.
// The big source folder stays out of git (.gitignore); commit public/icons.

import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { units, items } = require('wc3data')

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const SRC = path.resolve(process.argv[2] ?? path.join(ROOT, 'public/warcraft3_icons'))
const OUT = path.join(ROOT, 'public/icons')

// slug the app uses for a name: lowercase letters/digits, trailing "+N" dropped (items)
const slug = (name) => name.toLowerCase().replace(/\+?\d+$/, '').replace(/[^a-z0-9]/g, '')

// hero abilities -> button art (classic names; PASBTN* are the passive variants, used as fallback)
const ABILITIES = {
  'Blizzard': 'BTNBlizzard', 'Summon Water Elemental': 'BTNSummonWaterElemental', 'Brilliance Aura': 'BTNBrilliance', 'Mass Teleport': 'BTNMassTeleport',
  'Storm Bolt': 'BTNStormBolt', 'Thunder Clap': 'BTNThunderclap', 'Bash': 'BTNBash', 'Avatar': 'BTNAvatar',
  'Holy Light': 'BTNHolyBolt', 'Divine Shield': 'BTNDivineIntervention', 'Devotion Aura': 'BTNDevotion', 'Resurrection': 'BTNResurrection',
  'Flame Strike': 'BTNWallOfFire', 'Banish': 'BTNBanish', 'Siphon Mana': 'BTNManaDrain', 'Phoenix': 'BTNMarkOfFire',
  'Wind Walk': 'BTNWindWalkOn', 'Mirror Image': 'BTNMirrorImage', 'Critical Strike': 'BTNCriticalStrike', 'Bladestorm': 'BTNWhirlwind',
  'Chain Lightning': 'BTNChainLightning', 'Far Sight': 'BTNFarSight', 'Feral Spirit': 'BTNSpiritWolf', 'Earthquake': 'BTNEarthquake',
  'Shockwave': 'BTNShockWave', 'War Stomp': 'BTNWarStomp', 'Endurance Aura': 'BTNCommand', 'Reincarnation': 'BTNReincarnation',
  'Healing Wave': 'BTNHealingWave', 'Hex': 'BTNHex', 'Serpent Ward': 'BTNSerpentWard', 'Big Bad Voodoo': 'BTNBigBadVoodooSpell',
  'Mana Burn': 'BTNManaBurn', 'Immolation': 'BTNImmolationOn', 'Evasion': 'BTNEvasion', 'Metamorphosis': 'BTNMetamorphosis',
  'Entangling Roots': 'BTNEntanglingRoots', 'Force of Nature': 'BTNEnt', 'Thorns Aura': 'BTNThorns', 'Tranquility': 'BTNTranquility',
  'Scout': 'BTNScout', 'Searing Arrows': 'BTNSearingArrowsOn', 'Trueshot Aura': 'BTNTrueShot', 'Starfall': 'BTNStarfall',
  'Fan of Knives': 'BTNFanOfKnives', 'Blink': 'BTNBlink', 'Shadow Strike': 'BTNShadowStrike', 'Vengeance': 'BTNSpiritOfVengeance',
  'Death Coil': 'BTNDeathCoil', 'Death Pact': 'BTNDeathPact', 'Unholy Aura': 'BTNUnholyAura', 'Animate Dead': 'BTNAnimateDead',
  'Carrion Swarm': 'BTNCarrionSwarm', 'Sleep': 'BTNSleep', 'Vampiric Aura': 'BTNVampiricAura', 'Inferno': 'BTNInfernal',
  'Frost Nova': 'BTNGlacier', 'Frost Armor': 'BTNFrostArmor', 'Dark Ritual': 'BTNDarkRitual', 'Death and Decay': 'BTNDeathAndDecay',
  'Impale': 'BTNImpale', 'Spiked Carapace': 'BTNThornShield', 'Carrion Beetles': 'BTNCarrionScarabs', 'Locust Swarm': 'BTNLocustSwarm',
  'Forked Lightning': 'BTNMonsoon', 'Frost Arrows': 'BTNColdArrowsOn', 'Mana Shield': 'BTNNeutralManaShield', 'Tornado': 'BTNTornado',
  'Silence': 'BTNSilence', 'Black Arrow': 'BTNTheBlackArrow', 'Life Drain': 'BTNLifeDrain', 'Charm': 'BTNCharm',
  'Breath of Fire': 'BTNBreathOfFire', 'Drunken Haze': 'BTNStrongDrink', 'Drunken Brawler': 'BTNDrunkenDodge', 'Storm, Earth, and Fire': 'BTNStormEarth&Fire',
  'Summon Bear': 'BTNGrizzlyBear', 'Summon Quilbeast': 'BTNQuillBeast', 'Summon Hawk': 'BTNWarEagle', 'Stampede': 'BTNStampede',
  'Rain of Fire': 'BTNFire', 'Howl of Terror': 'BTNHowlOfTerror', 'Cleaving Attack': 'BTNCleavingAttack', 'Doom': 'BTNDoom',
  'Pocket Factory': 'BTNPocketFactory', 'Cluster Rockets': 'BTNClusterRockets', 'Engineering Upgrade': 'BTNEngineeringUpgrade', 'Robo-Goblin': 'BTNROBOGOBLIN',
  'Soul Burn': 'BTNSoulBurn', 'Summon Lava Spawn': 'BTNLavaSpawn', 'Incinerate': 'BTNIncinerate', 'Volcano': 'BTNVolcano',
  'Healing Spray': 'BTNHealingSpray', 'Acid Bomb': 'BTNAcidBomb', 'Chemical Rage': 'BTNChemicalRage', 'Transmute': 'BTNTransmute',
}

// melee heroes by unit id (looking them up by name finds campaign versions, e.g. Arthas for Paladin)
const HEROES = {
  Archmage: 'Hamg', 'Mountain King': 'Hmkg', Paladin: 'Hpal', 'Blood Mage': 'Hblm',
  Blademaster: 'Obla', 'Far Seer': 'Ofar', 'Tauren Chieftain': 'Otch', 'Shadow Hunter': 'Oshd',
  'Demon Hunter': 'Edem', 'Keeper of the Grove': 'Ekee', 'Priestess of the Moon': 'Emoo', Warden: 'Ewar',
  'Death Knight': 'Udea', Dreadlord: 'Udre', Lich: 'Ulic', 'Crypt Lord': 'Ucrl',
  'Naga Sea Witch': 'Nngs', 'Dark Ranger': 'Nbrn', 'Pandaren Brewmaster': 'Npbm', Beastmaster: 'Nbst',
  'Pit Lord': 'Nplh', 'Goblin Tinker': 'Ntin', Firelord: 'Nfir', 'Goblin Alchemist': 'Nalc',
}

if (!fs.existsSync(SRC)) {
  console.error(`No icon folder at ${path.relative(ROOT, SRC) || SRC}. Put the Warcraft III icons there or pass a path.`)
  process.exit(1)
}

// ----- index the source folder: lowercase basename -> best file -----
const isReforged = (p) => /reforged|[\\/_ -]hd[\\/_ .-]|\(hd\)|[\\/]hd[\\/]/i.test(p)
const index = new Map()
const dupes = new Map()
;(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p)
    else if (/\.(png|jpe?g|webp)$/i.test(e.name)) {
      const key = e.name.replace(/\.[^.]+$/, '').toLowerCase()
      const prev = index.get(key)
      if (isReforged(path.relative(SRC, p))) {
        if (!prev) index.set(key, { file: p, reforged: true })
        continue
      }
      if (prev && !prev.reforged) (dupes.get(key) ?? dupes.set(key, [prev.file]).get(key)).push(p)
      if (!prev || prev.reforged) index.set(key, { file: p, reforged: false })
    }
  }
})(SRC)

const find = (...names) => {
  for (const n of names) {
    const hit = index.get(n.toLowerCase())
    if (hit && !hit.reforged) return hit.file
  }
  return null
}
const artName = (art) => (art ? art.split('\\').pop().replace(/\.blp$/i, '') : null)

// ----- what the app needs: slug -> candidate file names -----
const wanted = new Map() // slug -> { label, names[] }
const want = (label, names, s = slug(label)) => {
  if (!wanted.has(s)) wanted.set(s, { label, names: names.filter(Boolean) })
}

// hero abilities
for (const [name, btn] of Object.entries(ABILITIES)) want(name, [btn, `PAS${btn}`, btn.replace(/On$/, '')])

// heroes (by melee unit id); a few have no art in the game data tables
const HERO_ART = { Edem: 'BTNHeroDemonHunter', Udea: 'BTNHeroDeathKnight', Ulic: 'BTNLichVersion2' }
for (const [display, id] of Object.entries(HEROES)) want(display, [artName(units[id]?.art?.Art), HERO_ART[id]])

// every other unit the game knows (creeps, helpers, ...); melee versions win over campaign ones
const byName = new Map()
const ordered = Object.values(units).sort((a, b) => !!a.editor?.campaign - !!b.editor?.campaign)
for (const u of ordered) {
  const n = u.text?.Name
  const a = artName(u.art?.Art)
  if (n && a && !byName.has(n)) byName.set(n, a)
}
for (const [n, a] of byName) want(n, [a])

// items (random drop pools and anything else in the game)
for (const it of Object.values(items)) {
  const n = it.text?.Name
  const a = artName(it.art?.Art)
  if (n && a) want(n, [a])
}

// ----- copy -----
fs.mkdirSync(OUT, { recursive: true })
let copied = 0
const missing = []
for (const [s, { label, names }] of wanted) {
  const file = find(...names)
  if (!file) {
    missing.push(`${label} (${names[0]})`)
    continue
  }
  fs.copyFileSync(file, path.join(OUT, `${s}${path.extname(file).toLowerCase() === '.png' ? '.png' : path.extname(file)}`))
  copied++
}

console.log(`✓ copied ${copied} icons into public/icons (from ${index.size} files in ${path.relative(ROOT, SRC) || SRC})`)
const abilityMissing = missing.filter((m) => Object.keys(ABILITIES).some((a) => m.startsWith(a + ' (')))
if (abilityMissing.length) console.log(`! hero ability icons not found (please report): ${abilityMissing.join(', ')}`)
console.log(`  ${missing.length - abilityMissing.length} units/items had no matching file (mostly campaign-only; fine)`)
if (dupes.size) console.log(`  note: ${dupes.size} names exist in more than one non-Reforged folder; the first one found was used`)
