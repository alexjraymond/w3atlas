# W3Atlas

Plan **build orders and creep routes** for Warcraft III ladder/tournament maps, save them, and pull them up before a game.

- **Interactive minimaps.** Hover a camp to see its creeps, levels, XP and item drops. Click camps in order to draw your creep route.
- **Live hero XP.** Shows the hero level after every camp, using the real per-level creep XP rates (80/70/62/55%, none from level 5). Level-ups show the skill you learn at that point.
- **Partial camps and helpers.** Skip individual creeps, and note what you creep with (militia, ghouls, Ancient of War…).
- **Build orders.** Type a build line by line (press Enter for the next line), or paste one as text (`5 Altar`, `2:10 12 Hero`).
- **Hero and skill order.** The skill order is checked: ultimate at level 6, at most 3 ranks per basic ability.
- **Map notes.** Draggable sticky notes on the map.
- **View mode.** A clean read-only layout for reference during a game.
- **Saving.** Routes save automatically in your browser. Use **Backup → Export** to save a file or move routes to another device. **Copy share link** sends one route to a friend.

## Maps

Autumn Leaves, Concealed Hill, Echo Isles v2, Last Refuge, Shallow Grave.

### Adding a map

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

`position` is in image pixels, and `dimensions` is the image size. The camp id prefix (`green-`, `orange-`, `red-`) sets the marker color. The rest of the id becomes the display name, unless you set `"name"`. The loot `type` is one of `permanent`, `charged`, `power up`, `artifact`, `custom`.

The map appears in the app automatically.

## Development

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # unit tests (XP math, parser, storage)
npm run build    # static site in dist/ (works on any static host)
```

The app uses hash routing (`#/map/autumn_leaves`), so the built `dist/` folder works on GitHub Pages, Netlify, or any file server without extra configuration.
