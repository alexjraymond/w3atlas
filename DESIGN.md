---
name: W3Atlas
description: Creep route and build order planner for Warcraft III 1v1, dressed as a 2002 clan fan site.
colors:
  ground: "#F3EEDF"
  ink: "#1D2B1F"
  lime: "#BFEA4B"
  sky: "#8EC9F2"
  window-white: "#FFFFFF"
  muted: "#4F5B4A"
  lime-wash: "#EEF8CC"
  lime-tint: "#F7FCE6"
  disabled-stroke: "#9AA395"
  disabled-text: "#6D7568"
  hero-path: "#FFD43B"
  aow-path: "#8CE99A"
  camp-easy: "#3DDC4A"
  camp-medium: "#FFAD33"
  camp-hard: "#FF4D4D"
typography:
  display:
    fontFamily: "\"Press Start 2P\", ui-monospace, monospace"
    fontSize: "clamp(16px, 3.2vw, 24px)"
    fontWeight: 400
    lineHeight: 1.5
  headline:
    fontFamily: "\"Press Start 2P\", ui-monospace, monospace"
    fontSize: "22px"
    fontWeight: 400
    lineHeight: 1.5
  level-number:
    fontFamily: "\"Press Start 2P\", ui-monospace, monospace"
    fontSize: "20px"
    fontWeight: 400
    lineHeight: 1
  label:
    fontFamily: "\"Press Start 2P\", ui-monospace, monospace"
    fontSize: "9px"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0.02em"
  title:
    fontFamily: "Nunito, system-ui, -apple-system, \"Segoe UI\", sans-serif"
    fontSize: "16px"
    fontWeight: 900
    lineHeight: 1.3
  body:
    fontFamily: "Nunito, system-ui, -apple-system, \"Segoe UI\", sans-serif"
    fontSize: "16px"
    fontWeight: 600
  meta:
    fontFamily: "Nunito, system-ui, -apple-system, \"Segoe UI\", sans-serif"
    fontSize: "13px"
    fontWeight: 700
  chip:
    fontFamily: "Nunito, system-ui, -apple-system, \"Segoe UI\", sans-serif"
    fontSize: "12px"
    fontWeight: 900
    letterSpacing: "0.06em"
rounded:
  none: "0px"
  marker: "50%"
spacing:
  grid: "32px"
  row-y: "10px"
  window-pad: "12px"
  bar-x: "10px"
  section: "16px"
  split: "24px"
components:
  window-bar:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "4px 10px"
    height: "32px"
  window-bar-reference:
    backgroundColor: "{colors.sky}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "4px 10px"
    height: "32px"
  window-bar-plain:
    backgroundColor: "{colors.window-white}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "4px 10px"
    height: "32px"
  window-body:
    backgroundColor: "{colors.window-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "{spacing.window-pad}"
  button-primary:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
  button-default:
    backgroundColor: "{colors.window-white}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
  button-light:
    backgroundColor: "{colors.lime-wash}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
  button-disabled:
    backgroundColor: "transparent"
    textColor: "{colors.disabled-text}"
    rounded: "{rounded.none}"
  chip:
    backgroundColor: "{colors.window-white}"
    textColor: "{colors.ink}"
    typography: "{typography.chip}"
    rounded: "{rounded.none}"
    padding: "3px 9px"
  chip-reference:
    backgroundColor: "{colors.sky}"
    textColor: "{colors.ink}"
    typography: "{typography.chip}"
    rounded: "{rounded.none}"
    padding: "3px 9px"
  chip-primary:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.ink}"
    typography: "{typography.chip}"
    rounded: "{rounded.none}"
    padding: "3px 9px"
  input:
    backgroundColor: "{colors.window-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
  stop-number:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.window-white}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    size: "34px"
  stop-number-levelup:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    size: "34px"
  stop-number-waypoint:
    backgroundColor: "{colors.sky}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    size: "34px"
  stop-number-partial:
    backgroundColor: "{colors.window-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    size: "34px"
  level-track:
    backgroundColor: "{colors.window-white}"
    rounded: "{rounded.none}"
    height: "24px"
  camp-marker:
    backgroundColor: "{colors.camp-medium}"
    textColor: "{colors.ink}"
    rounded: "{rounded.marker}"
    width: "clamp(16px, 5.2%, 30px)"
---

# Design System: W3Atlas

## Overview

**Creative North Star: "Clan Site 2002"**

W3Atlas looks like a Warcraft III fan site from 2002 left open on a desk: a cream grid-paper desktop, and each part of the plan sitting on it as its own titled window. Windows have forest-ink outlines, sharp corners and a hard offset shadow with no blur. They pop open with a short spring, and buttons press down into their shadows. The level a route reaches loads like a striped install bar. The look is bright, flat and tactile on purpose. It rejects the dark gamer dashboard with gold accents that most Warcraft tools ship.

Two type voices do separate jobs. Press Start 2P is the machine voice: window titles, buttons, labels, the level number and the route name. Nunito, at heavy weights, carries everything a player actually reads: camp names, XP, drops and notes. Numbers are tabular everywhere. Density is high but stays readable. Rank comes from weight, case and window structure more than from many sizes.

The minimap is game territory, not site chrome. On the map, the Warcraft III vocabulary stays: green, orange and red camp circles, classic WC3 button icons, numbered stops, the yellow hero path and the green Ancient of War path. The site world frames the map. It never repaints it.

This system was carbonized from the route page (edit and preview, desktop and phone). The home, map, builds and community pages pick up the theme and the restyled Mantine controls, but their layouts have not been redesigned in this world yet.

**Key Characteristics:**
- Cream grid-paper ground (32px cells) under white windows with 2px ink outlines and hard 4px offset shadows.
- Lime marks what you can press or what is primary. Sky marks reference windows.
- Square corners everywhere except game markers on the map.
- Pixel type for titles, controls and labels. Heavy Nunito for anything read.
- Stop state is shown by structure: filled, dashed, double rule.
- Short spring when a window opens. Buttons press 3px down into their shadow.

## Colors

A sunlit two-accent palette on cream: forest ink for every line and letter, lime for action, sky for reference, plus the game's own map colours, kept exactly as players know them.

### Primary
- **Install Lime** (lime): title bars of working windows, filled buttons, the selected segment, the checked switch, text selection, the scrollbar thumb, the level-up stop number and the striped fill of the install bar. It means "pressable or primary". It is never used as a background for long reading.
- **Lime Wash** (lime-wash): light buttons, hovered menu items and the "on" state of toggle-style choices.
- **Lime Tint** (lime-tint): the background of the stop that is currently active on the map.

### Secondary
- **Clan Sky** (sky): title bars of reference windows (Map, Hero and matchup), the back-to-map chip, the waypoint stop number, the waypoint pin, and the focus ring. Sky never marks a primary action.

### Tertiary (game-map language, must keep)
- **Hero Path Yellow** (hero-path): the dashed hero route on the minimap and its arrowheads, the selected camp's ring, and the install-bar segments of stops that level the hero up. Gold always means the hero.
- **AoW Green** (aow-path): the dotted Ancient of War path and its point outlines.
- **Camp Easy / Medium / Hard** (camp-easy, camp-medium, camp-hard): camp circles on the map, difficulty dots in stop rows, and the map legend. These are the game's colours, not the site's accents.
- Drop-class badges use Mantine's own blue (permanent), grape (charged), green (power up), orange (artifact) and yellow (custom) light variants, each with an ink outline.

### Neutral
- **Grid Paper Cream** (ground): page background, phone sheet background, scrollbar track. The 32px grid is drawn in ink at 7% opacity.
- **Forest Ink** (ink): all text, every 2px outline, every hard shadow, the default stop number fill. Its Mantine ramp (`forest`) provides the in-between greys.
- **Window White** (window-white): window bodies, inputs, default buttons, chips, the header strip.
- **Moss Muted** (muted): secondary text such as camp meta, XP subtotals, legends and hints.
- **Disabled Stroke / Disabled Text** (disabled-stroke, disabled-text): the dashed outline and label of a disabled button. Disabled text is also the placeholder colour.

### Named Rules
**The Lime Means Press Rule.** Lime goes on things you can press, on primary windows and on progress. If an element can't be pressed and isn't the main working surface, it isn't lime.

**The Map Keeps Its Colours Rule.** Camp green, orange and red, hero yellow and AoW green come from the game and are not reinterpreted. Don't tint them toward the palette, and don't use them for site UI except where they stand for the same game concept, such as gold for level-ups.

## Typography

**Display Font:** Press Start 2P (with ui-monospace, monospace)
**Body Font:** Nunito 600 to 900 (with system-ui, -apple-system, Segoe UI, sans-serif)

Both fonts are self-hosted through @fontsource. Nunito's lightest loaded weight is 600, so body text renders at 600 even where 400 is requested.

**Character:** A chunky bitmap face for the machine voice of the desktop (window chrome, buttons, labels) next to a round, heavy humanist sans for the plan itself. The contrast does the ranking, so few sizes are needed.

### Hierarchy
- **Display** (Press Start 2P 400, clamp(16px, 3.2vw, 24px), line-height 1.5): the route name, edited in place. One per page.
- **Headline** (Press Start 2P 400, 22px / 17px / 14px for h1 to h3): Mantine headings on pages that use them.
- **Level number** (Press Start 2P 400, 20px; 15px under 640px; 13px in the compact phone bar): "LV n" in the install bar.
- **Label** (Press Start 2P 400, 9px, line-height 1.6, uppercase in title bars and field labels): window titles, button labels, field labels, segmented-control options. Smaller pixel sizes (7–8px) are only used inside the level bar ticks, segment numbers and level tags.
- **Title** (Nunito 900, 16px, line-height 1.3; 15px on narrow screens): stop and camp names.
- **Body** (Nunito 600–700, 16px): everything read, including notes, hints and inputs (inputs at 700).
- **Meta** (Nunito 700, 13px, muted): camp difficulty, level and position lines, XP subtotals, legends.
- **Chip** (Nunito 900, 12px, 0.06em, uppercase): context chips above the route name. Badges use Nunito 900 with 0.04em tracking.

### Named Rules
**The Two Voices Rule.** Press Start 2P is for chrome: titles, controls, labels, the level number and the route name. It is never used for a sentence or a paragraph, or for a value someone has to read precisely. Nunito is never used in a title bar.

**The Tabular Rule.** Every number uses tabular figures (set on body), so XP columns line up.

## Layout

The page is a desktop of windows on a 32px grid-paper ground. Windows stack with Mantine `lg` gaps (20px) on desktop and `md` gaps (16px) inside columns.

- **Route page, desktop:** a header strip; the chip row and the route name; a full-width Level window; then a split of the Map window (about 1.45fr) beside the Route window (minmax(360px, 1fr)), 24px apart. Under 62em the split collapses to one column. Setup and companion-build windows follow full width.
- **Route page, phone (≤48em):** the map fills the width under a compact one-row level bar (no title bar, same outline and shadow). Stops open in a single bottom sheet that takes 92% of the height, with a lime title strip. Primary actions sit in a fixed bottom dock 8px from the edges (plus the safe-area inset), with 46px tall buttons and the Stops button weighted wider. The chip row scrolls sideways and fades out at the right edge.
- **Rhythm:** title bars are padded 4px 10px with a minimum height of 32px; window bodies 12px (6px around the phone map); stop rows 10px 12px; the level bar 12px 16px.
- **Touch:** on coarse pointers the drag grip is hidden and reordering moves to Up/Down buttons inside the open stop, which are 44px tall.

## Elevation & Depth

Depth is drawn, not lit. Every raised surface casts a hard, unblurred ink shadow offset down and to the right, as on a 2002 desktop. Pressing removes the shadow and moves the element into its place, so elevation shows directly whether something can be pressed.

### Shadow Vocabulary
- **Window** (`box-shadow: 4px 4px 0 #1D2B1F`): windows, cards, bordered papers, dropdowns, menus, popovers, the phone dock and the compact level bar.
- **Control** (`box-shadow: 3px 3px 0 #1D2B1F`): buttons.
- **Small** (`box-shadow: 2px 2px 0 #1D2B1F`): inputs, default action icons, the install-bar track.
- **Lifted** (`box-shadow: 6px 6px 0 #1D2B1F`): hover state of linked cards (`hover-lift`), which move up by -2px -2px.
- **Input focus** (`box-shadow: 2px 2px 0 #8EC9F2`): the input's shadow turns sky on focus.
- **Map halo** (soft dark halo, e.g. `rgba(0,0,0,0.7)` under path lines): only on the minimap, so markers and paths stay readable over terrain.

### Named Rules
**The Press Into The Shadow Rule.** A pressable outlined control casts a hard shadow at rest and, when active, moves by exactly its shadow offset (3px for buttons, 2px for action icons) while the shadow drops to none. Disabled controls lose the shadow and switch to a dashed outline.

**The No Blur Rule.** Site chrome never uses blurred or coloured ambient shadows. The only soft shadows are the map halos, which are there for legibility over terrain.

## Shapes

All site chrome is square: Mantine's default radius is 0, including switch thumbs and badges. Lines are a uniform 2px solid ink. Title-bar window dots and segment number boxes use 1.5px. Structure carries meaning:
- **Solid fill:** done. A cleared stop's number is filled ink.
- **Dashed:** partial or unavailable. Skipped or partly cleared stops, disabled buttons, level thresholds in the install bar.
- **Double rule (6px double):** a level-up. It opens a stop row that levels the hero up.

Round shapes appear only on the map: camp circles, the helper ring and legend dots. They are game markers, not site shapes.

## Components

### Window (signature)
The building block of the world: a white body with a 2px ink outline and the window shadow, topped by a title bar.
- **Title bar:** label type, uppercase, at least 32px tall, with faint white scanlines (every 4px, 12% white) and three square ink-outlined "window dots" on the right. An optional right slot holds Nunito 13px status text such as "4 stops".
- **Tones:** lime for working windows (Route, Level), sky for reference windows (Map, Hero and matchup), white for secondary windows (Companion build, Skill order).
- **Motion:** opens with a 220ms spring (scale 0.97 to 1, fading in, `cubic-bezier(0.34, 1.56, 0.64, 1)`).
- Titles may read as old file names ("Level.exe") where that fits the world.

### Level Bar (signature)
The hero's level as an install bar.
- **Layout:** "LV n" in pixel type, then the track, then XP text in Nunito 900 ("167 / 400 XP to level 4" with a muted total below).
- **Track:** 24px tall, white, 2px outline, small shadow. Each stop that gives XP fills its own segment with 45° stripes (lime and ink). Segments of stops that level the hero up are striped hero-path yellow and ink. Segments wider than 5% show their stop number in a small white box.
- **Thresholds:** dashed ink lines across the track, labelled L2 to L5 below in 7px pixel type.
- **Motion:** segment widths ease over 400ms (`cubic-bezier(0.22, 1, 0.36, 1)`). The stripes march only while hovered.
- **Compact (phone):** one framed row with no title bar, a 13px level number, an 18px track and short XP text ("167/400", "Max").

### Buttons
- **Shape:** square (0px), 2px ink outline, control shadow, pixel label at 9px with 0.02em tracking.
- **Primary (filled):** lime. **Default / outline:** white. **Light:** lime wash.
- **Hover / Active:** hover brightens by 4%. Active moves 3px down and right and drops the shadow (80ms linear).
- **Disabled:** transparent, dashed disabled-stroke outline, disabled-text label, no shadow.
- **Subtle:** no frame, Nunito 800 in ink. **Action icon (default):** white, outline, small shadow, presses 2px.

### Chips
- **Style:** inline Nunito 900 12px uppercase, padded 3px 9px, 2px outline, no shadow. White by default.
- **Tones:** sky for navigation back to a reference (map), lime for the matchup, white for plain facts (hero).

### Badges
2px ink outline, square, Nunito 900 with 0.04em tracking. Drop-class badges keep Mantine's colour per class. Level tags ("Level 2") are lime with 8px pixel type.

### Cards / Containers
- **Corner Style:** square (0px).
- **Background:** window white.
- **Shadow Strategy:** window shadow (see Elevation). Linked cards lift on hover.
- **Border:** 2px solid ink.
- **Internal Padding:** 12px.

### Inputs / Fields
- **Style:** white, 2px ink outline, small shadow, Nunito 700. Placeholder in disabled text at 600.
- **Focus:** outline stays ink and the shadow turns sky. Global `:focus-visible` is a 3px sky outline with a 2px offset.
- **Labels:** pixel 9px uppercase with 8px below (Mantine input labels and the shared `Label`).
- **Segmented control:** white frame, lime selected indicator with outline, pixel 9px options. **Switch:** square outlined track that turns lime when on, square thumb.

### Stop Row
One row per route stop, separated by 2px ink rules.
- **Number box:** 34px square, pixel 11px. Filled ink means cleared, lime means levels up, dashed white means partial or skipped, sky means waypoint.
- **Content:** difficulty dot and camp name in title type, meta line under it, XP right-aligned in Nunito 900 with a muted subtotal, then drop badges with WC3 icons and the kill-order group (dashed box).
- **States:** the active stop is tinted lime tint. An open stop is off-white. A drop target shows a 3px lime inset line at the top. A level-up row opens with the double rule.

### Map Markers
- **Camp:** a circle in the camp colour at 72% (100% when selected), with a white 2px ring and an ink hairline. The stop number sits inside in pixel type. Hover scales it 1.18×. Selected adds a hero-yellow ring and a hard ink shadow. Active scales it 1.3× with an ink and lime halo.
- **Helper in camp:** when a race helper joins a camp, the ring takes the camp colour (3px) around an ink disc filled by the helper's WC3 icon at 90%. A small white square with a pixel count sits at the top right.
- **Waypoint:** a sky pin with an ink stroke and the stop number.
- **Paths:** hero path dashed 6/4 in hero yellow over a dark halo, with arrowheads. AoW path dotted 2/5 in AoW green.
- **Legend:** muted Nunito 13px under the map, with dots for camps and bars for paths.

### Navigation
A white header strip with a 2px ink bottom rule. The W3Atlas wordmark is set in pixel type, links in Nunito 800 with dropdown menus in window style. On a phone, route actions live in the fixed bottom dock instead of the header.

## Do's and Don'ts

### Do:
- **Do** put every distinct part of the plan in its own titled window: a white body, a 2px ink outline and a 4px hard ink shadow.
- **Do** use lime title bars for working windows, sky for reference windows and white for secondary ones.
- **Do** make pressable controls press down by their shadow offset and lose the shadow on active.
- **Do** show state by structure: filled for cleared, dashed for partial or disabled, a 6px double rule for a level-up.
- **Do** keep Press Start 2P to titles, controls, labels, the level number and the route name, and set everything read in Nunito 600–900.
- **Do** keep the game-map language on the minimap: camp green/orange/red, classic WC3 icons, numbered stops, hero path #FFD43B and AoW path #8CE99A.
- **Do** keep phone primary actions in a bottom dock within thumb reach, with touch targets of at least 44px.

### Don't:
- **Don't** build the dark gamer dashboard with gold accents. The ground stays cream grid paper.
- **Don't** round site chrome. Radius is 0 everywhere except game markers on the map.
- **Don't** use blurred or ambient shadows in site chrome. The only soft shadow is the halo on the map.
- **Don't** use lime on things that can't be pressed and aren't primary.
- **Don't** set sentences, paragraphs or values someone must read precisely in Press Start 2P.
- **Don't** recolour camp, hero-path or AoW-path colours to match the palette.
