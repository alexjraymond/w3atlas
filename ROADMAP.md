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
- **Builds in Community**: public builds, browsing, ratings and comments (routes have these now;
  the database already has the builds table).

## Later

- **Host the app online** (Vercel / Netlify / GitHub Pages) so it opens on a phone or tournament PC.
- **"Two paths"**: a route that branches ("if they rush, go here instead").
- **Missing icons**: Stormreaver Apprentice and Stormreaver Hermit (Tidehunters) need `npm run build-icons`
  on a machine with the icon folder; anything else still grey, report it.
