# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Warcraft III 1v1 ladder players, both groups equally:

- **Players learning and climbing** who want to find, save and follow proven creep routes and build orders. They need the plan to be easy to read.
- **Experienced players and streamers** who plan and refine their own routes. They want speed and depth: exact XP numbers, kill order, conditions.

Their job: decide before a game exactly where the hero creeps, in what order, with which units, what level it reaches and what items drop, and keep that plan on hand.

## Product Purpose

W3Atlas is a creep route and build order planner for the current 1v1 ladder map pool. Players click camps on an accurate minimap to build a route, and the app simulates hero XP kill by kill: level-ups, drops and timing. The route links to a build order, a hero skill order and (for Night Elf) the Ancient of War's walking path. Routes are saved to an account, can be made public, and are rated and discussed in Community.

Success: a player can pull up their plan in seconds before a game, and can build or adjust a route anywhere, including on a phone.

## Positioning

Compared with warcraft-gym and Liquipedia, W3Atlas offers all of these together:

- **Exact XP math**: per-kill XP simulation with level-dependent rates, kill-order groups and level-up markers, on map data imported from the real `.w3x` files.
- **The full game plan in one place**: route, companion build order, skill order with max priority, race helpers (Militia, Ghouls, Ancient of War) and the AoW path.
- **Community routes**: public routes with 1 to 5 star ratings and comments, so good routes rise.
- **Fast before games**: the quickest path from "I'm on Scrimmage as Night Elf" to the plan on screen.
- **Mobile-first route making**: most tools in this space don't work well on phones; W3Atlas must let players make and edit routes comfortably on a phone, away from their PC.

## Operating Context

- **Planning at a desk**: building and editing routes on a computer, between games or while studying replays.
- **Quick look before or during a game**: glancing at a saved route, often on a second monitor.
- **On a phone, away from the PC**: making new routes and editing existing ones, not only viewing. This is a primary use case, not a fallback.
- **Browsing Community**: finding, rating, copying and commenting on other players' routes.

Domain terms players use: camps (green/orange/red), creeping, item drops (permanent, charged, power up, artifact), hero level, XP, kill order, pulling, Militia, Ghouls, Ancient of War (AoW), uproot, tavern, shop, gold mine, start positions, matchups (HU, ORC, NE, UD), ladder map pool.

## Capabilities and Constraints

- React 19 + Vite + Mantine 8 + TypeScript single-page app with hash routing; a static build that runs on any host.
- Data lives in the browser (localStorage) and syncs to Supabase when signed in (Discord, Twitch or Google), with last-write-wins.
- Map pool: Autumn Leaves, Last Refuge, Northern Isles, Shallow Grave, Tidehunters, Turtle Rock, Twisted Meadows, Echo Isles, Springtime, Hammerfall, Scrimmage. Fading Autumn is pending (needs its `.w3x`). Concealed Hill is hidden.
- Minimaps are high-res top-down renders with neutral building sprites and start rings. The map is the centrepiece of the route page and must stay legible: camp circles, numbered stops, the yellow hero path and the green AoW path.
- Routes: camp and waypoint stops, kill-order groups, rest clear/skip, helpers with counts, conditions, notes, map sticky notes, AoW path, tags, Public toggle.
- Builds: supply/time/action steps; Community for builds comes later.
- Every interaction must work by touch on a phone: placing stops, dragging AoW points, reordering stops, editing kill order.
- Undecided: hosting (Vercel, Netlify or GitHub Pages), Community for builds, branching "two paths" routes, AoW placement reference pictures.

## Brand Commitments

- Name: **W3Atlas**.
- A fan project. Warcraft III is a trademark of Blizzard Entertainment and W3Atlas isn't affiliated with Blizzard; no Blizzard logos or impersonation.
- Game art: classic (non-Reforged) Warcraft III button icons from the user's own icon folder (`public/icons`).
- Credits open-source dependencies in the footer and README ("Built with open source").
- Visual references the user chose for the redesign (recorded here, applied in new-work, not expanded in this file):
  - The CauseHouse website (https://www.causehouse.co/), first reference.
  - Retro Y2K design guide and skill: `docs/design-references/retro-y2k-DESIGN.md`, `docs/design-references/retro-y2k-SKILL.md`.
  - Neobrutalism design guide and skill: `docs/design-references/neobrutalism-DESIGN.md`, `docs/design-references/neobrutalism-SKILL.md`.
- The user wants both layout and styling changed; the current look is not something to preserve.

## Evidence on Hand

- Real map data for 11 pool maps in `src/data/maps/*.json`, with minimap images in `public/maps/`.
- Real creep and item data (`src/data/creeps.json`, `src/data/itemPools.json`) and about 840 game icons in `public/icons/`.
- No real community content yet: no public routes, ratings, comments, user counts or testimonials. Future work must not invent any.

## Product Principles

1. **The plan before anything else.** Every screen should get a player to their route, or a decision about it, faster.
2. **Exact, not approximate.** XP, levels and drops are calculated from real game data; show the numbers players trust.
3. **Phone is a first-class planning device.** Route making must be as comfortable on a phone as on a desktop, not a squeezed desktop layout.
4. **One plan, all the parts.** Route, build, skills and AoW path belong together and should read as one plan.
5. **Learnable for newer players, deep for experienced ones.** Sensible defaults and clear reading first; detail is one step away, not hidden.
