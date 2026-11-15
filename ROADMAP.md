# Roadmap

Ideas and open items, roughly in priority order.

## Next up

- **AoW placement references (Night Elf).** Many camps need a very specific Ancient of War
  placement, or the creeps will kill the building. Show a picture of where to put it.
  - Likely shape: per camp, one or more reference images (in-game screenshots), shown in the camp's
    hover card and in a route stop when the Ancient of War toggle is on.
  - Stored with the map data (e.g. `public/aow/<map>/<camp-id>.jpg` plus a note), not per route,
    since the right spot is the same for everyone. A route could still add its own picture.
  - Possibly also a small marker on the map showing the exact spot, using the camp's
    coordinates as the reference point.
- **Fading Autumn.** Import the `.w3x` and add a high-res render.
- **Twisted Meadows render.** It's the only pool map still on a Liquipedia image.

## Later

- **Host the app online** (GitHub Pages / Vercel) so it opens on a phone or tournament PC.
- **Sync routes across devices** (accounts, e.g. Supabase). Today routes live in each browser;
  Backup → Export/Import moves them.
- **"Two paths"**: a route that branches ("if they rush, go here instead").
- **Missing icons**: some creep and item icons still show the grey placeholder.
