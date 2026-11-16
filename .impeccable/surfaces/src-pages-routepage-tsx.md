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

Replaced again (user choice from a four-sketch round): Map-first overlay. The map owns the first screen on a darkened copy of itself; a HUD bar runs across the top; Hero & matchup, the purple XP bar and the route float in a right column. Dark HUD panels by default, light panels in day mode; Chakra Petch for headings and numbers, Hanken Grotesk for reading; route yellow for actions and stop numbers. DESIGN.md is the current record.

Updated after the user's Warcraft round: the accent is Warcraft gold, not lime; the display face is Cinzel, not Press Start 2P; the level bar is a plain purple XP bar beside the route; Hero & matchup sits on top and folds. DESIGN.md is the current record of the system.

THESIS: The plan as a 2002 Warcraft fan-site desktop: each part of the plan is its own titled window on grid paper, and the hero's level loads as a striped install bar. It refuses the dark gamer dashboard with gold accents that every Warcraft tool ships.

OWN-WORLD: Cream grid-paper ground (#F3EEDF), forest-ink 2px borders and hard 4px offset shadows with no blur, white window bodies, lime (#BFEA4B) title bars and only on pressable or primary things, sky (#8EC9F2) title bars for reference windows. Sharp corners. Press Start 2P only in title bars, buttons, labels and the level number; Nunito for everything read. Few sizes, rank by weight and case, tabular numbers. Stop states by structure: filled cleared, dashed skipped, double rule level-up.

STORY: The player sees the route, the level it reaches and every stop's XP and drops at once, edits by clicking camps, and trusts the numbers.

FIRST VIEWPORT: Desktop: nav strip; route title with map, matchup and hero chips; full-width LEVEL window with the install bar and XP; Map window (left, about 60%) and Route window (right) side by side, the Route window holding the tools and the stop list. Phone: map fills the width under a compact level bar; stops open as one full-height sheet; primary actions sit in a bottom bar within thumb reach.

FORM: Clan Site 2002 (fan-site windows on grid paper), position 3 on the ordered list; seed:cb550da2d2092f2b. Signature interaction: the level bar fills in steps as stops are added, with the level-up stops marked on it. Motion: windows spawn with a short spring, buttons press down into their shadow.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
