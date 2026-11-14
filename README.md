# W3Atlas

Plan **build orders and creep routes** for Warcraft III ladder/tournament maps, save them, and pull them up before a game.

- **Interactive minimaps.** Hover a camp to see its creeps, levels, XP and item drops. Click camps in order to draw your route, and add waypoints for shop or tavern stops.
- **Live hero XP.** Each stop shows your running level and XP ("Lv 3 · 501 xp"), using the game's rules: 80/70/62/55% of creep XP, rounded down per kill, none from level 5. Level-ups show the skill you learn at that point.
- **Kill order.** Split a camp into ordered groups (a group is killed in any order). Each group shows its XP and any level-up. Then clear the rest, or skip it.
- **Per-stop details.** Bring units (5× Footman, a second hero…), a condition ("only if no harass"), and a note.
- **Build library.** Build orders are their own items, not tied to a map. Link one to any number of routes as the companion build. Type a build line by line (Enter for the next line), or paste one as text (`5 Altar`, `2:10 12 Hero`).
- **Hero and skill order.** The skill order is checked: ultimate at level 6, at most 3 ranks per basic ability.
- **Map notes.** Draggable sticky notes on the map.
- **Preview mode.** A clean read-only layout with Expand all, for reference during a game. Edit mode has Undo and drag-to-reorder.
- **Saving.** Routes save automatically in your browser. Use **Backup → Export everything** to save a file or move your routes and builds to another device. **Copy share link** sends one route (with its build) to a friend.

## Maps

Autumn Leaves, Concealed Hill, Echo Isles v2, Last Refuge, Shallow Grave.

### Adding or updating a map from the map file (recommended)

1. Put the map's `.w3x` file in `map-files/`. This folder is ignored by git.
2. Run:

```bash
npm run import-map
```

This reads every map in `map-files/` and writes `src/data/maps/<slug>.json` with:
- each camp's exact position, read from the map
- which creeps are in each camp
- what each creep drops, e.g. "random level 2 permanent"

If a map already exists, its camp ids and names are kept when a camp is in about the same place, so saved routes keep working. Then:

- Put the minimap image at `public/maps/<slug>.png`, covering the playable area (the importer tells you if it's missing).
- Creep names and levels come from `src/data/creeps.json`, because map files only store a 4-letter unit id. The importer warns about unknown ids. Levels marked `"verified": true` have been confirmed from in-game XP numbers.
- `src/data/itemPools.json` lists which items a random drop of each class and level can give.

To import a single file under a specific slug:

```bash
npm run import-map -- path/to/map.w3x --slug my_map
```

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

## Development

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # unit tests (XP math, parser, storage)
npm run build    # static site in dist/ (works on any static host)
```

The app uses hash routing (`#/map/autumn_leaves`), so the built `dist/` folder works on GitHub Pages, Netlify, or any file server without extra configuration.
