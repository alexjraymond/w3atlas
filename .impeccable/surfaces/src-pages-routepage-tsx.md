---
version: 1
slug: "src-pages-routepage-tsx"
primary_target: "src/pages/RoutePage.tsx"
related_targets: ["src/components/RouteViewer.tsx","src/components/CreepRoute.tsx","src/components/MapCanvas.tsx"]
---

# Route page

Scope: the route page (`#/route/:id`), in edit and preview, plus the public route view that shares it. Visitor mode: Operate.

Audience and job: ladder players build a creep route by clicking camps, set kill order and helpers, read the simulated XP and drops, and pull the plan up fast before a game. Building new routes on a phone is a primary task.

Must stay recognisable: green, orange and red camp colours; classic WC3 icons; numbered stops on the map; the yellow hero path and the green AoW path as two distinct colours.

Feels wrong: hard to read fast, generic SaaS, awkward with thumbs.

## Direction contract

THESIS: The map is the screen. The route page opens on the minimap at full size, and the plan floats beside it as HUD panels; it refuses the category's stacked card page where the map is one box among many.

OWN-WORLD: Near-black HUD panels (rgba(10,13,18,.94), 1px #2C3440 edges, 8px radius, soft shadows) over a blurred, darkened copy of the map; route yellow #FFD43B for actions, stop numbers and the hero path; XP purple; Chakra Petch for interface text, Hanken Grotesk for reading. Light scheme swaps in white panels.

STORY: The player sees the whole route on the map at once, reads level, XP and every stop's drops in the right column, and edits by clicking camps.

FIRST VIEWPORT: Desktop: HUD bar across the top (map chip, route name, hint, actions); the map fitted to the free area with every camp visible; right column: Hero & matchup (foldable), Hero level bar, Route list (scrolls). Phone: stacked, compact level bar, map, bottom dock, stop sheet.

FORM: Map-first overlay, chosen by the user from four sketches (.impeccable/mocks/round2/c-overlay.html); seed: none (pinned).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
