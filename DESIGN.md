---
name: W3Atlas
description: Creep route and build order planner for Warcraft III 1v1, dressed as a 2002 clan fan site in Warcraft colours.
colors:
  ground: "#F3EEDF"
  ink: "#1D2B1F"
  gold: "#E2B33C"
  sky: "#8EC9F2"
  xp: "#8B3FD9"
  xp-track: "#ECE4F7"
  edge: "#1D2B1F"
  window-white: "#FFFFFF"
  muted: "#4F5B4A"
  gold-wash: "#F6E6B4"
  gold-tint: "#FBF4DF"
  paper: "#FBFAF5"
  faint: "#7C8577"
  disabled-stroke: "#9AA395"
  disabled-text: "#6D7568"
  hero-path: "#FFD43B"
  aow-path: "#8CE99A"
  camp-easy: "#3DDC4A"
  camp-medium: "#FFAD33"
  camp-hard: "#FF4D4D"
typography:
  display:
    fontFamily: "Cinzel, \"Times New Roman\", serif"
    fontSize: "clamp(22px, 4vw, 36px)"
    fontWeight: 900
    lineHeight: 1.2
  headline:
    fontFamily: "Cinzel, \"Times New Roman\", serif"
    fontSize: "32px"
    fontWeight: 700
    lineHeight: 1.2
  level-number:
    fontFamily: "Cinzel, \"Times New Roman\", serif"
    fontSize: "26px"
    fontWeight: 900
    lineHeight: 1
  window-title:
    fontFamily: "Cinzel, \"Times New Roman\", serif"
    fontSize: "14px"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0.04em"
  label:
    fontFamily: "Cinzel, \"Times New Roman\", serif"
    fontSize: "13px"
    fontWeight: 700
    lineHeight: 1.4
  button:
    fontFamily: "Cinzel, \"Times New Roman\", serif"
    fontSize: "12px"
    fontWeight: 700
    letterSpacing: "0.03em"
  stop-number:
    fontFamily: "Cinzel, \"Times New Roman\", serif"
    fontSize: "16px"
    fontWeight: 900
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
  marker:
    fontFamily: "Nunito, system-ui, -apple-system, \"Segoe UI\", sans-serif"
    fontSize: "clamp(9px, 2vw, 13px)"
    fontWeight: 900
rounded:
  none: "0px"
  circle: "50%"
spacing:
  grid: "32px"
  row-y: "10px"
  window-pad: "12px"
  bar-x: "10px"
  column-gap: "16px"
  page-gap: "20px"
  split: "24px"
components:
  window-bar:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.ink}"
    typography: "{typography.window-title}"
    rounded: "{rounded.none}"
    padding: "4px 10px"
    height: "32px"
  window-bar-reference:
    backgroundColor: "{colors.sky}"
    textColor: "{colors.ink}"
    typography: "{typography.window-title}"
    rounded: "{rounded.none}"
    padding: "4px 10px"
    height: "32px"
  window-bar-plain:
    backgroundColor: "{colors.window-white}"
    textColor: "{colors.ink}"
    typography: "{typography.window-title}"
    rounded: "{rounded.none}"
    padding: "4px 10px"
    height: "32px"
  window-body:
    backgroundColor: "{colors.window-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "{spacing.window-pad}"
  button-primary:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.none}"
  button-default:
    backgroundColor: "{colors.window-white}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.none}"
  button-light:
    backgroundColor: "{colors.gold-wash}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
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
  input:
    backgroundColor: "{colors.window-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
  stop-number:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.window-white}"
    typography: "{typography.stop-number}"
    rounded: "{rounded.none}"
    size: "34px"
  stop-number-levelup:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.ink}"
    typography: "{typography.stop-number}"
    rounded: "{rounded.none}"
    size: "34px"
  stop-number-waypoint:
    backgroundColor: "{colors.sky}"
    textColor: "{colors.ink}"
    typography: "{typography.stop-number}"
    rounded: "{rounded.none}"
    size: "34px"
  stop-number-partial:
    backgroundColor: "{colors.window-white}"
    textColor: "{colors.ink}"
    typography: "{typography.stop-number}"
    rounded: "{rounded.none}"
    size: "34px"
  xp-track:
    backgroundColor: "{colors.xp-track}"
    rounded: "{rounded.none}"
    height: "18px"
  xp-fill:
    backgroundColor: "{colors.xp}"
    rounded: "{rounded.none}"
    height: "18px"
  race-circle:
    backgroundColor: "{colors.window-white}"
    rounded: "{rounded.circle}"
    size: "42px"
  skill-slot:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.faint}"
    rounded: "{rounded.none}"
    size: "34px"
  camp-marker:
    backgroundColor: "{colors.camp-medium}"
    textColor: "{colors.ink}"
    typography: "{typography.marker}"
    rounded: "{rounded.circle}"
    width: "clamp(16px, 5.2%, 30px)"
---

# Design System: W3Atlas

## Overview

**Creative North Star: "Clan Site 2002"**

W3Atlas looks like a Warcraft III fan site from 2002 left open on a desk: a cream grid-paper desktop, and each part of the plan sitting on it as its own titled window. Windows have hard outlines, sharp corners and a hard offset shadow with no blur. They pop open with a short spring, and buttons press down into their shadows. The palette borrows from the game itself: Warcraft gold for title bars and what you can press, mana-sky blue for reference windows, the purple of the hero's experience bar, and bronze trim on the outlines at night. By day the look stays bright, flat and tactile.

Two type voices do separate jobs. Cinzel, a carved Roman capital face that reads like the game's own lettering, is the chrome voice: window titles, buttons, field labels, the route name, the level number and stop numbers. Nunito, at heavy weights, carries everything a player actually reads: camp names, XP, drops, notes and the numbers on the map. Numbers are tabular everywhere. Density is high but stays readable. Rank comes from weight, face and window structure more than from many sizes.

The minimap is game territory, not site chrome. On the map, the Warcraft III vocabulary stays: green, orange and red camp circles, classic WC3 button icons, numbered stops, the yellow hero path and the green Ancient of War path. The site world frames the map. It never repaints it.

This system was carbonized from the route page (edit and preview, desktop and phone, day and night). The home, map, builds and community pages pick up the theme and the restyled Mantine controls, but their layouts have not been redesigned in this world yet.

**Key Characteristics:**
- Cream grid-paper ground (32px cells) under white windows with 2px outlines and hard 4px offset shadows.
- Warcraft gold marks what you can press, the main working window and level-ups. Sky marks reference windows. Purple is hero experience and nothing else.
- Square corners everywhere except round race portraits and game markers on the map.
- Cinzel for titles, controls, labels and big numbers. Heavy Nunito for anything read.
- Stop state is shown by structure: filled, dashed, double rule.
- Short spring when a window opens. Buttons press 3px down into their shadow. Long windows fold from a chevron in their title bar.

## Colors

A sunlit Warcraft palette on cream: forest ink for every letter, gold for action, sky for reference, purple for experience, plus the game's own map colours, kept exactly as players know them.

### Primary
- **Warcraft Gold** (gold): title bars of working windows (Route), filled buttons, the selected segment, the checked switch, the selection ring on picked races and heroes, text selection, the scrollbar thumb, the level-up stop number and level tags, the phone stop sheet's title strip, the drop-target line and the route-name focus underline. It means "pressable, primary, or a level gained". It is never a background for long reading. Mantine's `gold` ramp is the primary colour (shade 5).
- **Gold Wash** (gold-wash): light buttons, hovered menu items and hovered or selected combobox options.
- **Gold Tint** (gold-tint): the background of the stop that is currently active on the map.

### Secondary
- **Mana Sky** (sky): title bars of reference windows (Map, Hero and matchup), the back-to-map chip, the waypoint stop number and pin, and the focus ring. Sky never marks a primary action.

### Tertiary
- **Hero XP Purple** (xp): the fill of the hero level bar and the "Lv n" number beside it. It stands for experience and is used nowhere else.
- **XP Track** (xp-track): the empty part of the level bar.

### Game-map language (must keep)
- **Hero Path Yellow** (hero-path): the dashed hero route on the minimap and its arrowheads, and the selected camp's ring.
- **AoW Green** (aow-path): the dotted Ancient of War path and its point outlines.
- **Camp Easy / Medium / Hard** (camp-easy, camp-medium, camp-hard): camp circles on the map, difficulty dots in stop rows, and the map legend. These are the game's colours, not the site's accents.
- Drop-class badges use Mantine's own blue (permanent), grape (charged), green (power up), orange (artifact) and yellow (custom) light variants, each with an outline.

### Neutral
- **Grid Paper Cream** (ground): page background, phone sheet background, scrollbar track. The 32px grid is drawn in ink at 7% opacity.
- **Forest Ink** (ink): all text, every hard shadow, the default stop number fill. Its Mantine ramp (`forest`) provides the in-between greys.
- **Edge** (edge): every 2px outline: windows, title-bar rules, buttons, inputs, chips, badges, race circles, hero and ability icons, filled skill slots. Ink by day.
- **Window White** (window-white): window bodies, inputs, default buttons, chips, the header strip, empty race circles.
- **Paper** (paper): an opened stop, empty skill slots.
- **Moss Muted** (muted): secondary text such as camp meta, XP subtotals, legends, hints and the "vs." between race groups.
- **Faint** (faint): drag grips, empty skill-slot numbers, disabled action icons.
- **Disabled Stroke / Disabled Text** (disabled-stroke, disabled-text): the dashed outline and label of a disabled button and the dashed outline of an empty skill slot. Disabled text is also the placeholder colour.

### Night
A day/night switch in the header (sun/moon) flips Mantine's colour scheme. The choice is remembered in the browser, and day is the default. Night is the same clan site after dark, framed like the game's own UI. Every colour is a `--w-*` variable in `src/index.css`, and night only redefines those variables under `:root[data-mantine-color-scheme='dark']`; Mantine's `dark` ramp is forest-black to match. Never hard-code a hex in a component: add or reuse a variable.
- **Night ground** #121915 (grid in gold at 5%), **night window** #1C261F, **night ink** #EDE7D6 (text), **night muted** #AAB4A5, **night paper** #19221B, **night faint** #87927F.
- **Bronze trim**: `--w-edge` turns bronze #A8833F at night, so every outline reads as Warcraft UI trim instead of a cream line.
- **Night gold wash / tint** #3A301A and #262414. **Night XP** #9D5CF0 on track #221A30.
- **Shadows** use `--w-shadow-c`: ink by day, near-black #050806 at night.
- **On-accent** `--w-on-accent` (#1D2B1F) stays dark in both modes. Use it for any text on gold, sky, pastel badges or game colours (title bars, chips, filled buttons, level tags, camp numbers). Never use `--w-ink` there, because ink turns cream at night.
- Gold, sky, the camp colours and both path colours don't change at night.

### Named Rules
**The Gold Means Press Rule.** Gold goes on things you can press, on the main working window, on selection and on level-ups. If an element can't be pressed, isn't selected, isn't primary and isn't a level gained, it isn't gold.

**The Purple Is Experience Rule.** XP purple belongs to the hero level bar and its level number. It is not a second accent.

**The Map Keeps Its Colours Rule.** Camp green, orange and red, hero yellow and AoW green come from the game and are not reinterpreted. Don't tint them toward the palette, and don't use them for site UI.

## Typography

**Display Font:** Cinzel 600 to 900 (with Times New Roman, serif)
**Body Font:** Nunito 600 to 900 (with system-ui, -apple-system, Segoe UI, sans-serif)

Both fonts are self-hosted through @fontsource. Nunito's lightest loaded weight is 600, so body text renders at 600 even where 400 is requested.

**Character:** Carved Roman capitals for the chrome, like the lettering on the game's own menus, next to a round, heavy humanist sans for the plan itself. Cinzel has no true lowercase, so it sets in capitals and small capitals without any `text-transform`. The contrast does the ranking, so few sizes are needed.

### Hierarchy
- **Display** (Cinzel 900, clamp(22px, 4vw, 36px), line-height 1.2): the route name, edited in place. One per page.
- **Headline** (Cinzel 700, 32 / 24 / 19 / 16 / 14 / 13px for h1 to h6): Mantine headings on pages that use them.
- **Level number** (Cinzel 900, 26px, in XP purple; 18px in the compact phone bar): "Lv n" beside the level bar.
- **Window title** (Cinzel 700, 14px, 0.04em, line-height 1.3): title bars. The phone stop sheet's title is 15px.
- **Label** (Cinzel 700, 13px, line-height 1.4): field labels and the block captions inside a window (Matchup, Hero, Skill order). The "vs." between race groups is Cinzel 900 15px in muted.
- **Button** (Cinzel 700, 12px, 0.03em): outlined buttons and segmented-control options. Level tags use Cinzel 700 11px.
- **Stop number** (Cinzel 900, 16px): the number box of each stop row.
- **Title** (Nunito 900, 16px, line-height 1.3; 15px on narrow screens): stop and camp names, the picked hero's name.
- **Body** (Nunito 600 to 700, 16px): everything read, including notes, hints and inputs (inputs at 700).
- **Meta** (Nunito 700 to 800, 12 to 14px, muted): camp difficulty, level and position lines, XP subtotals, legends, the XP line under the level bar (14px 800).
- **Chip** (Nunito 900, 12px, 0.06em, uppercase): context chips above the route name. Badges use Nunito 900 with 0.04em tracking.
- **Marker** (Nunito 900, clamp(9px, 2vw, 13px)): stop numbers inside camp circles and waypoint pins on the map. Small count badges are Nunito 900 10px.

### Named Rules
**The Two Voices Rule.** Cinzel is for chrome: titles, controls, labels, the route name, the level number and stop numbers. It is never used for a sentence, a paragraph, or a value someone has to read precisely, such as XP counts. Status text in a title bar's right slot and the folded summary are Nunito.

**The Tabular Rule.** Every number uses tabular figures (set on body), so XP columns line up.

## Layout

The page is a desktop of windows on a 32px grid-paper ground. Windows stack with Mantine `lg` gaps (20px) on the page and `md` gaps (16px) inside columns.

- **Route page, desktop (edit and preview):** a header strip; the chip row and the route name with the actions on the right; a full-width Hero and matchup window; then a split of the Map window with the Ancient of War window under it (about 1.45fr) beside the Hero level window with the Route window under it (minmax(360px, 1fr)), 24px apart; then Companion build (with its picker inside) and Description and tags, full width. Under 62em the split collapses to one column. The read-only viewer uses the same order.
- **Hero and matchup:** three blocks in a row (matchup, hero, skill order: auto auto 1fr, gaps 16px 28px, padding 14px 16px). Under 62em they stack.
- **Route page, phone (≤48em):** header, Hero and matchup, a compact one-row level bar (no title bar, same outline and shadow), the map filling the width, then the remaining windows. Stops open in a single bottom sheet that takes 92% of the height, with a gold title strip. Primary actions sit in a fixed bottom dock 8px from the edges (plus the safe-area inset), with 46px tall buttons and the Stops button weighted wider. The chip row scrolls sideways and fades out at the right edge.
- **Rhythm:** title bars are padded 4px 10px with a minimum height of 32px; window bodies 12px (6px around the phone map); stop rows 10px 12px; the level bar 12px 14px 10px.
- **Touch:** on coarse pointers the drag grip is hidden and reordering moves to Up/Down buttons inside the open stop, which are 44px tall.

## Elevation & Depth

Depth is drawn, not lit. Every raised surface casts a hard, unblurred shadow offset down and to the right, as on a 2002 desktop. Pressing removes the shadow and moves the element into its place, so elevation shows directly whether something can be pressed. Shadows are ink by day and near-black at night (`--w-shadow-c`).

### Shadow Vocabulary
- **Window** (`box-shadow: 4px 4px 0 var(--w-shadow-c)`): windows, cards, bordered papers, dropdowns, menus, popovers, the phone dock and the compact level bar.
- **Control** (`box-shadow: 3px 3px 0 var(--w-shadow-c)`): buttons.
- **Small** (`box-shadow: 2px 2px 0 var(--w-shadow-c)`): inputs and default action icons.
- **Selected portrait** (`box-shadow: 0 0 0 3px var(--w-accent), 2px 2px 0 3px var(--w-shadow-c)`): the picked race circle and the picked hero icon: a gold ring with the hard shadow behind it.
- **Lifted** (`box-shadow: 6px 6px 0`): hover state of linked cards (`hover-lift`), which move up by -2px -2px.
- **Input focus** (`box-shadow: 2px 2px 0 #8EC9F2`): the input's shadow turns sky on focus.
- **Map halo** (soft dark halo, e.g. `rgba(0,0,0,0.7)` under path lines): only on the minimap, so markers and paths stay readable over terrain.

### Named Rules
**The Press Into The Shadow Rule.** A pressable outlined control casts a hard shadow at rest and, when active, moves by exactly its shadow offset (3px for buttons, 2px for action icons) while the shadow drops to none. Portrait and ability buttons nudge 1px. Disabled controls lose the shadow and switch to a dashed outline.

**The No Blur Rule.** Site chrome never uses blurred or coloured ambient shadows. The only soft shadows are the map halos, which are there for legibility over terrain.

## Shapes

Site chrome is square: Mantine's default radius is 0, including switch thumbs and badges. Lines are a uniform 2px solid edge colour. Title-bar window dots, the ability rank badge and segment boxes use 1.5px. Structure carries meaning:
- **Solid fill:** done. A cleared stop's number is filled ink; a filled skill slot has a solid outline.
- **Dashed:** partial, empty or unavailable. Skipped or partly cleared stops, disabled buttons, empty skill slots, kill-order groups.
- **Double rule (6px double):** a level-up. It opens a stop row that levels the hero up.

Round shapes are reserved for two things: race portraits in the matchup picker, and game markers on the map (camp circles, the helper ring, legend dots). Hero and ability icons stay square, as in the game's command card.

## Components

### Window (signature)
The building block of the world: a white body with a 2px outline and the window shadow, topped by a title bar.
- **Title bar:** window-title type, at least 32px tall, with faint white scanlines (every 4px, 12% white) and three square outlined "window dots" on the right in the bar's text colour. An optional right slot holds Nunito 13px status text such as "4 stops" or "667 XP total".
- **Tones:** gold for the working window (Route), sky for reference windows (Map, Hero and matchup), white for secondary windows (Hero level, Ancient of War path, Companion build, Description and tags).
- **Fold:** a foldable window puts an 18px chevron before its title; the whole title is the toggle button (`aria-expanded`). Closed, the chevron turns -90° (160ms, `cubic-bezier(0.22, 1, 0.36, 1)`) and the body is removed. A folded window may show a one-line Nunito 800 13px summary after its title. Fold state that matters across visits is remembered in the browser.
- **Motion:** opens with a 220ms spring (scale 0.97 to 1, fading in, `cubic-bezier(0.34, 1.56, 0.64, 1)`).

### Hero Level Bar (signature)
The hero's experience after the route, as Warcraft's purple XP bar.
- **Layout:** in a white "Hero level" window: "Lv n" in purple Cinzel, then the track, then the XP line under it in Nunito 800 muted ("167 / 400 XP to level 4"; at level 5, "Level 5: creeps give no more XP"). The title bar's right slot shows total XP.
- **Track:** 18px tall, xp-track background, 2px outline, no shadow, filled from the left with one plain XP-purple bar. No stripes and no segments.
- **Current level only:** the fill shows progress from the current level to the next (empty at the start of a level, full at the next one). No marks for earlier levels.
- **Motion:** the fill width eases over 400ms (`cubic-bezier(0.22, 1, 0.36, 1)`).
- **Compact (phone):** one framed row with the window shadow and no title bar: an 18px level number, a 14px track and short XP text ("167/400", "Max").

### Hero and Matchup (signature)
A foldable sky window holding the matchup, hero and skill order.
- **Matchup:** your race on the left, the opponent on the right, as two groups of round race portraits (42px; 30px on phones) with "vs." between them. Unpicked portraits are greyed (35% opacity, 80% grayscale) inside a 2px edge circle; hover lifts them to 80%; the picked one is full colour with the selected-portrait gold ring. Tapping the picked opponent again means "any".
- **Hero:** square 40px hero icons in 2px edge frames, greyed until picked; the picked one gets the gold ring. A Tavern switch swaps in neutral heroes.
- **Skill order:** square ability buttons (36px) with a small white rank badge at the bottom right, then Auto and Clear as compact default buttons. Below, a strip of ten 34px level slots: empty slots are dashed on paper with a faint level number; filled slots show the ability icon with a solid edge outline and a small white level number at the top left; an invalid pick turns the outline red. Clicking a filled slot clears it.

### Buttons
- **Shape:** square (0px), 2px outline, control shadow, Cinzel 700 at 12px with 0.03em tracking.
- **Primary (filled):** gold with on-accent text. **Default / outline:** white. **Light:** gold wash.
- **Hover / Active:** hover brightens by 4%. Active moves 3px down and right and drops the shadow (80ms linear).
- **Disabled:** transparent, dashed disabled-stroke outline, disabled-text label, no shadow.
- **Subtle:** no frame, Nunito 800 in ink. **Action icon (default):** white, outline, small shadow, presses 2px.

### Chips
- **Style:** inline Nunito 900 12px uppercase, padded 3px 9px, 2px outline, no shadow. White by default.
- **Tones:** sky for navigation back to a reference (map), white for plain facts (matchup, hero).

### Badges
2px outline, square, Nunito 900 with 0.04em tracking. Drop-class badges keep Mantine's colour per class. Level tags ("Level 2") are gold with Cinzel 700 11px.

### Cards / Containers
- **Corner Style:** square (0px).
- **Background:** window white.
- **Shadow Strategy:** window shadow (see Elevation). Linked cards lift on hover.
- **Border:** 2px solid edge.
- **Internal Padding:** 12px.

### Inputs / Fields
- **Style:** white, 2px outline, small shadow, Nunito 700. Placeholder in disabled text at 600.
- **Focus:** outline keeps the edge colour and the shadow turns sky. Global `:focus-visible` is a 3px sky outline with a 2px offset. The route name has no frame; on focus it gets a 3px gold underline.
- **Labels:** Cinzel 700 13px with 6px below.
- **Segmented control:** white frame, gold selected indicator with outline, Cinzel 12px options. **Switch:** square outlined track that turns gold when on, square thumb.

### Stop Row
One row per route stop, separated by 2px rules.
- **Number box:** 34px square, Cinzel 900 16px. Filled ink means cleared, gold means levels up, dashed white means partial or skipped, sky means waypoint.
- **Content:** difficulty dot and camp name in title type, meta line under it, XP right-aligned in Nunito 900 with a muted subtotal, then drop badges with WC3 icons and the kill-order group (dashed box).
- **States:** the active stop is tinted gold tint. An open stop is paper. A drop target shows a 3px gold inset line at the top. A level-up row opens with the double rule.

### Map Markers
- **Camp:** a circle in the camp colour at 72% (100% when selected), with a white 2px ring and a hairline. The stop number sits inside in marker type. Hover scales it 1.18×. Selected adds a hero-yellow ring and a hard shadow. Active scales it 1.3× with a dark and gold halo.
- **Helper in camp:** when a race helper joins a camp, the ring takes the camp colour (3px) around a dark disc filled by the helper's WC3 icon at 90%. A small white square with a count sits at the top right.
- **Waypoint:** a sky pin with a stroke and the stop number.
- **Paths:** hero path dashed 6/4 in hero yellow over a dark halo, with arrowheads. AoW path dotted 2/5 in AoW green, with numbered green squares at its points.
- **Legend:** muted Nunito 13px under the map, with dots for camps and bars for paths.

### Navigation
A white header strip with a 2px bottom rule (bronze at night). The W3ATLAS wordmark is Cinzel 900 20px with 0.04em tracking, links in Nunito 800 with dropdown menus in window style, and a square sun/moon toggle at the right. On a phone, route actions live in the fixed bottom dock instead of the header.

## Do's and Don'ts

### Do:
- **Do** put every distinct part of the plan in its own titled window: a white body, a 2px outline and a 4px hard shadow.
- **Do** use gold title bars for the working window, sky for reference windows and white for secondary ones.
- **Do** give long windows a fold chevron in the title bar instead of a separate collapse control.
- **Do** make pressable controls press down by their shadow offset and lose the shadow on active.
- **Do** show state by structure: filled for cleared, dashed for partial, empty or disabled, a 6px double rule for a level-up.
- **Do** keep Cinzel to titles, controls, labels, the route name, the level number and stop numbers, and set everything read in Nunito 600 to 900.
- **Do** draw every outline with `--w-edge` (ink by day, bronze at night) and every text-on-colour with `--w-on-accent`.
- **Do** keep hero experience as one plain purple bar showing only the current level's progress.
- **Do** keep the game-map language on the minimap: camp green/orange/red, classic WC3 icons, numbered stops, hero path #FFD43B and AoW path #8CE99A.
- **Do** keep phone primary actions in a bottom dock within thumb reach, with touch targets of at least 44px.

### Don't:
- **Don't** make night the default or replace the cream grid-paper day ground. Night is an option the player picks.
- **Don't** round site chrome. Radius is 0 everywhere except race portraits and game markers on the map.
- **Don't** use blurred or ambient shadows in site chrome. The only soft shadow is the halo on the map.
- **Don't** use gold on things that can't be pressed, aren't selected, aren't primary and aren't a level gained.
- **Don't** use XP purple for anything but hero experience.
- **Don't** stripe, segment or animate the XP bar.
- **Don't** set sentences, paragraphs or values someone must read precisely in Cinzel.
- **Don't** recolour camp, hero-path or AoW-path colours to match the palette.
