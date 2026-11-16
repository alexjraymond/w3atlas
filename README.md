# W3Atlas

Plan **build orders and creep routes** for Warcraft III ladder/tournament maps, save them, and pull them up before a game.

- **Interactive minimaps.** Hover a camp to see its creeps, levels, XP and item drops. Click camps in order to draw your route, and add waypoints for shop or tavern stops.
- **Live hero XP.** Each stop shows your running level and XP ("Lv 3 · 501 xp"), using the game's rules: 80/70/62/55% of creep XP, rounded down per kill, none from level 5. Level-ups show the skill you learn at that point.
- **Kill order.** Split a camp into ordered groups (a group is killed in any order). Each group shows its XP and any level-up. Then clear the rest, or skip it.
- **Per-stop details.** A one-click race helper toggle (Militia, Ancient of War or Ghoul) that also badges the camp on the map, a condition ("only if no harass"), and a note.
- **Skill order grid.** Pick which ability to max first and all 10 levels fill in (ultimate at 6), then fine-tune by clicking cells.
- **Build library.** Build orders are their own items, not tied to a map. Link one to any number of routes as the companion build. Type a build line by line (Enter for the next line), or paste one as text (`5 Altar`, `2:10 12 Hero`).
- **Hero and skill order.** The skill order is checked: ultimate at level 6, at most 3 ranks per basic ability.
- **Map notes.** Draggable sticky notes on the map.
- **Preview mode.** A clean read-only layout with Expand all, for reference during a game. Edit mode has Undo and drag-to-reorder.
- **Saving.** Routes save automatically in your browser. Use **Backup → Export everything** to save a file or move your routes and builds to another device. **Copy share link** sends one route (with its build) to a friend.

## Accounts and Community

Sign in with Discord, Twitch or Google to save routes and builds to your account, make routes **Public**, and browse, rate (1–5 stars) and comment on other players' routes under **Community**. This needs a Supabase project: see **[SETUP.md](SETUP.md)**. Without one, the app runs fully in the browser and the account features are hidden.

## Maps

The current 1v1 ladder pool: Autumn Leaves, Echo Isles, Hammerfall, Last Refuge, Northern Isles, Scrimmage, Shallow Grave, Springtime, Tidehunters, Turtle Rock and Twisted Meadows (Fading Autumn still to come). Concealed Hill is hidden: it's not in the current pool.

### Adding or updating a map from the map file (recommended)

1. Put the map's `.w3x` file in `map-files/`. This folder is ignored by git.
2. Run:

```bash
npm run import-map
```

This writes `src/data/maps/<slug>.json` with:
- each camp's exact position, read from the map
- which creeps are in each camp, with names and levels from the game data
- what each creep drops, e.g. "random level 2 permanent", with the items that drop can be

If a map already exists, its camp ids, names and `hidden` flag are kept when a camp is in about the same place, so saved routes keep working. New camps are named after what's next to them (Shop, Lab, Merc, Expo, Main…) or a compass direction.

#### Minimap images

Each map's JSON has a `minimap` field:
- `custom`: a hand-supplied image, e.g. from Liquipedia. Never overwritten.
- `render`: built from a high-res render (see below).
- `generated`: built from the map file's own 256px minimap.

The importer draws a minimap when a map has none, and `npm run import-map -- --minimaps` redraws every non-custom one. What it draws:
- **base:** a high-res render from `scripts/assets/renders/<slug>.jpg` when there is one, otherwise the map's own 256px minimap
- **buildings:** gold mines, taverns, goblin merchants, goblin laboratories, mercenary camps and marketplaces as in-game sprites from `scripts/assets/buildings/`. Other kinds fall back to Liquipedia's flat house icon.
- **start locations:** a ring in the player's colour around the main's gold mine

Render-based minimaps are saved as JPEG (`"image": "<slug>.jpg"` in the map JSON), since they're photo-like.

**High-res renders:** to use one, line it up with the map once (needs Python 3 with numpy and Pillow, after a normal import), then redraw:

```bash
python3 scripts/align-render.py path/to/render.jpg <slug> --full
```
```bash
npm run import-map -- --minimaps
```

`--full` means the image is exactly the playable area, which is usually the case for Liquipedia's previews. Leave it off to search for the map inside a larger image instead. Check that the gold mine sprites land on the mines in the render. If the map's `minimap` is `custom`, change it to `render` first. Angled shots can't be lined up.

To import a single file under a specific slug:

```bash
npm run import-map -- path/to/map.w3x --slug my_map
```

### Game data

Map files only store 4-letter unit ids, so creep names and levels (`src/data/creeps.json`) and the item lists for random drops (`src/data/itemPools.json`) come from the game's own data tables, via the `wc3data` package. After a game patch:

```bash
npm i -D wc3data@latest
```
```bash
npm run update-game-data
```

### Map pool

Maps not in the current ladder pool get `"hidden": true` in their JSON. They disappear from the map list, but saved routes on them still open.

### Adding a map by hand

1. Save the minimap as `public/maps/<slug>.png`.
2. Add `src/data/maps/<slug>.json` with the same slug:

```json
{
  "mapName": "My Map",
  "dimensions": { "width": 512, "height": 512 },
  "camps": [
    {
      "id": "orange-camp-shop-1",
      "position": { "x": 156, "y": 123 },
      "units": [
        { "name": "Sasquatch", "count": 1, "level": 3, "loot": { "level": 2, "type": "permanent", "items": ["gloves_of_haste"] } },
        { "name": "Forest Troll Trapper", "count": 2, "level": 2 }
      ]
    }
  ]
}
```

`position` is in image pixels, and `dimensions` is the image size. Creep levels come from `src/data/creeps.json` when the creep is listed there (levels are fixed per unit type on melee maps), otherwise from the JSON. `loot` can be one drop or a list of drops, and `items` can be left out to use the item pools. The camp id prefix (`green-`, `orange-`, `red-`) sets the marker color. The rest of the id becomes the display name, unless you set `"name"`. The loot `type` is one of `permanent`, `charged`, `power up`, `artifact`, `custom`.

The map appears in the app automatically.

## Built with

W3Atlas stands on open-source work. If it helps you, please support these projects (sponsor links where they take donations; a GitHub star helps too):

- [Mantine](https://github.com/mantinedev/mantine): UI components ([sponsor](https://opencollective.com/mantinedev))
- [Vite](https://github.com/vitejs/vite): dev server and build ([sponsor](https://github.com/sponsors/vitejs))
- [React](https://github.com/facebook/react): UI library
- [Supabase](https://github.com/supabase/supabase-js): accounts, sync, ratings and comments
- [Tabler Icons](https://github.com/tabler/tabler-icons): interface icons ([sponsor](https://github.com/sponsors/codecalm))
- [WC3MapTranslator](https://github.com/ChiefOfGxBxL/WC3MapTranslator): reads Warcraft III map data
- [mopaq](https://github.com/jeany55/mopaq): opens `.w3x` archives
- [wc3data](https://github.com/voces/wc3data): creep and item data
- [jpeg-js](https://github.com/eugeneware/jpeg-js) and [pngjs](https://github.com/pngjs/pngjs): minimap image processing

Run `npm fund` to see every dependency that accepts donations.

Warcraft III is a trademark of Blizzard Entertainment. W3Atlas is a fan project and isn't affiliated with Blizzard.

## Development

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # unit tests (XP math, parser, storage)
npm run build    # static site in dist/ (works on any static host)
```

The app uses hash routing (`#/map/autumn_leaves`), so the built `dist/` folder works on GitHub Pages, Netlify, or any file server without extra configuration.
