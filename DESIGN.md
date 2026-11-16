---
name: W3Atlas
description: Creep route and build order planner for Warcraft III 1v1, laid out as a game HUD over the minimap.
colors:
  route-yellow: "#FFD43B"
  mana-blue: "#74C0FC"
  mana-blue-day: "#4DABF7"
  xp-purple: "#9B5CF6"
  xp-purple-day: "#7C3AED"
  xp-track: "#241A35"
  xp-track-day: "#E7DEFA"
  stage-black: "#05070A"
  ground: "#07090C"
  ground-day: "#E9ECF1"
  panel: "rgba(10, 13, 18, 0.94)"
  panel-day: "rgba(255, 255, 255, 0.95)"
  body: "#10141A"
  body-day: "#FFFFFF"
  ink: "#EEF1F4"
  ink-day: "#11151B"
  on-accent: "#11151B"
  muted: "#9AA4B2"
  muted-day: "#5B6573"
  faint: "#6B7686"
  faint-day: "#8A95A5"
  edge: "#2C3440"
  edge-day: "#CFD6DF"
  wash: "#1B222C"
  wash-day: "#F1F3F6"
  paper: "#0C1015"
  paper-day: "#F7F8FA"
  aow-text: "#6FDC8C"
  aow-text-day: "#2B8A3E"
  aow-wash: "#0F2016"
  aow-wash-day: "#EBFBEE"
  hero-path: "#FFD43B"
  aow-path: "#8CE99A"
  camp-easy: "#3DDC4A"
  camp-medium: "#FFAD33"
  camp-hard: "#FF4D4D"
typography:
  headline:
    fontFamily: "\"Chakra Petch\", system-ui, sans-serif"
    fontSize: "30px"
    fontWeight: 700
    lineHeight: 1.2
  route-name:
    fontFamily: "\"Chakra Petch\", system-ui, sans-serif"
    fontSize: "21px"
    fontWeight: 700
    lineHeight: 1.3
  level-number:
    fontFamily: "\"Chakra Petch\", system-ui, sans-serif"
    fontSize: "26px"
    fontWeight: 700
    lineHeight: 1
  panel-title:
    fontFamily: "\"Chakra Petch\", system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    letterSpacing: "0.02em"
  number:
    fontFamily: "\"Chakra Petch\", system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 700
    fontFeature: "tnum"
  button:
    fontFamily: "\"Chakra Petch\", system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    letterSpacing: "0.02em"
  field-label:
    fontFamily: "\"Chakra Petch\", system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    letterSpacing: "0.12em"
  title:
    fontFamily: "\"Hanken Grotesk\", system-ui, -apple-system, \"Segoe UI\", sans-serif"
    fontSize: "15px"
    fontWeight: 800
    lineHeight: 1.3
  body:
    fontFamily: "\"Hanken Grotesk\", system-ui, -apple-system, \"Segoe UI\", sans-serif"
    fontSize: "15px"
    fontWeight: 500
    fontFeature: "tnum"
  meta:
    fontFamily: "\"Hanken Grotesk\", system-ui, -apple-system, \"Segoe UI\", sans-serif"
    fontSize: "13px"
    fontWeight: 700
rounded:
  tag: "4px"
  chip: "5px"
  control: "6px"
  panel: "8px"
  sheet: "12px"
  round: "50%"
spacing:
  xs: "6px"
  sm: "10px"
  md: "12px"
  lg: "14px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.route-yellow}"
    textColor: "{colors.on-accent}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
  button-default:
    backgroundColor: "{colors.wash}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
  panel:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
  panel-title-row:
    typography: "{typography.panel-title}"
    padding: "6px 14px"
    height: "44px"
  hud-bar:
    backgroundColor: "{colors.panel}"
    rounded: "{rounded.panel}"
    padding: "10px 14px"
  chip:
    backgroundColor: "{colors.wash}"
    textColor: "{colors.ink}"
    rounded: "{rounded.chip}"
    padding: "4px 10px"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
  stop-number:
    backgroundColor: "{colors.route-yellow}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.round}"
    size: "28px"
  level-tag:
    backgroundColor: "{colors.xp-track}"
    textColor: "{colors.xp-purple}"
    rounded: "{rounded.tag}"
    padding: "1px 7px"
  xp-bar:
    backgroundColor: "{colors.xp-track}"
    rounded: "{rounded.chip}"
    height: "10px"
  aow-row:
    backgroundColor: "{colors.aow-wash}"
    textColor: "{colors.aow-text}"
    padding: "6px 14px 6px 52px"
  phone-dock:
    backgroundColor: "{colors.panel}"
    rounded: "{rounded.sheet}"
    padding: "8px"
---

# Design System: W3Atlas

## Overview

**Creative North Star: "The Map HUD"**

The minimap is the screen. On the route page it fills the first viewport, fitted so every camp stays visible and clickable, and sits on a blurred, darkened copy of itself. Everything else floats over it the way a game interface floats over the battlefield: a HUD bar across the top with the route name and actions, and a right column of panels for Hero and matchup, Hero level and the Route. Dark HUD panels are the default; a day scheme swaps them for white panels on a pale ground without changing the structure.

The system is quiet so the map can be loud. Panels are near-black plates with a 1px edge, an 8px corner and a soft shadow. Colour carries meaning, not decoration: route yellow marks what you press and where the hero goes, purple is experience, mana blue is waypoints and focus, green is the Ancient of War. Two type voices split the work: Chakra Petch, a squared technical face, for anything that reads as interface (titles, numbers, buttons, labels); Hanken Grotesk for anything a player reads. Density is high, numbers are tabular everywhere.

Other pages (home, maps, builds, community) inherit the tokens, panels and controls but not the stage; the stage belongs to the route page.

**Key Characteristics:**
- Map-first: the minimap owns the first screen; panels float beside it and never cover camps.
- Dark by default, light as an equal second scheme with the same structure.
- One accent (route yellow) shared by the hero path, stop numbers and primary actions.
- Soft depth: blurred shadows, translucent panels, 1px edges, gently rounded corners.
- Stop states by shape: filled, dashed, ringed.

## Colors

A near-black HUD with one warm accent and a small set of meaning colours; the game's own map colours stay untouched.

### Primary
- **Route Yellow** (route-yellow): the filled primary button, the active segment of the Edit/Preview control, switch tracks when on, stop numbers in the route list, the selection highlight, and the focus underline under the route name. The same yellow is the hero path on the map, so a stop number and its camp read as one thing.

### Secondary
- **XP Purple** (xp-purple; xp-purple-day in the day scheme): the hero level number, the XP bar fill, level-up tags and the ring around a level-up stop. Never used for actions.
- **Mana Blue** (mana-blue; mana-blue-day): waypoints (stop number and map pin), the focus outline, focused input borders, and the tab on reference panels.

### Tertiary
- **AoW Green** (aow-text on aow-wash): Ancient of War note rows between stops. Its path colour on the map is aow-path.

### Neutral
- **Stage Black** (stage-black): the route stage behind the blurred map copy.
- **Ground** (ground / ground-day): page background outside the stage.
- **Panel** (panel / panel-day): translucent plate for every floating panel, the HUD bar, the header and the phone dock.
- **Body** (body / body-day): opaque surface for menus, popovers, drawers and sheets.
- **Ink** (ink / ink-day): primary text.
- **Muted** (muted / muted-day): meta lines, XP subtotals, legends, field labels, panel counts.
- **Faint** (faint / faint-day): the tab on neutral panels, drag grips, disabled text, hover border on default buttons.
- **Edge** (edge / edge-day): every 1px border and divider, and the scrollbar thumb.
- **Wash** (wash / wash-day): default button fill, chips, active stop row, menu hover.
- **Paper** (paper / paper-day): input fill, an opened stop row, empty skill slots.
- **On-accent** (on-accent): text on yellow, blue and game colours. It stays dark in both schemes.

### Game colours (map only)
- **Hero Path** (hero-path), **AoW Path** (aow-path), **Camp Easy / Medium / Hard** (camp-easy, camp-medium, camp-hard): the dashed hero route and arrowheads, the dotted Ancient of War path, and camp circles, difficulty dots in stop rows and the map legend.

### Named Rules
**The One Yellow Rule.** Route yellow means "press this" or "the hero goes here". It is the only fill on a primary button and the only colour of a stop number. Don't spend it on decoration, headings or panel chrome beyond the small title tab.

**The Map Keeps Its Colours Rule.** Camp green, orange and red, hero yellow and AoW green come from the game and are not reinterpreted. Don't tint them toward the palette, and don't use the camp colours for site UI.

**The Dark Text On Yellow Rule.** Text on yellow, blue or a game colour uses on-accent, which is dark in both schemes. Never use ink there; ink turns light at night.

## Typography

**Display Font:** Chakra Petch 500 to 700 (with system-ui), self-hosted
**Body Font:** Hanken Grotesk 500 to 800 (with system-ui, -apple-system, Segoe UI), self-hosted

**Character:** Chakra Petch's squared, slightly technical letters read as game interface; Hanken Grotesk is a calm, sturdy grotesk that keeps camp names, notes and numbers easy to scan at heavy weights.

### Hierarchy
- **Headline** (Chakra Petch 700, 30px, 1.2): page headings on the non-stage pages. h2 23px, h3 18px.
- **Route name** (Chakra Petch 700, 21px, 1.3): the editable route name in the HUD bar; clamp(20px, 3vw, 26px) in the stacked phone layout.
- **Level number** (Chakra Petch 700, 26px, 1, XP purple): "Lv 3" beside the XP bar; 20px in the compact phone bar.
- **Panel title** (Chakra Petch 600, 15px, 0.02em): panel title rows.
- **Number** (Chakra Petch 700, 14 to 15px, tabular): stop XP gains, stop numbers (14px), level tags (12px).
- **Button** (Chakra Petch 600, 13px, 0.02em): buttons; segmented labels 12px; chips 12px.
- **Field label** (Chakra Petch 600, 11px, 0.12em, uppercase, muted): captions directly above a control or a picker (Matchup, Hero, Description, Tags).
- **Title** (Hanken Grotesk 800, 15px, 1.3): camp and stop names.
- **Body** (Hanken Grotesk 500, 15px): running text, notes, inputs (600).
- **Meta** (Hanken Grotesk 700, 13px, muted): camp difficulty and position, XP subtotals, legends, panel counts.

### Named Rules
**The Two Voices Rule.** Chakra Petch for interface and numbers, Hanken Grotesk for reading. Don't set a camp name or a note in Chakra Petch, and don't set a button in Hanken.

**The Tabular Rule.** Numbers are tabular everywhere (set on body). XP columns must line up.

## Layout

**Route stage (desktop).** Under the 56px header, a full-bleed stage fills the viewport height (min 640px) on stage-black, with the map image blurred (18px), desaturated and darkened (brightness 0.32) behind everything. Row one is the HUD bar, inset 12px. Row two is a grid of the map area and a right column (440px; 380px under 75em), 12px gap and 12px padding. The map area is a size container: the map keeps its aspect ratio and takes the largest size that fits, leaving 40px for the legend, so no camp is ever cropped. The right column scrolls; its panels keep their natural height instead of squashing. Companion build and Description and tags follow below the stage at page width.

**Phones (under 48em).** No stage. The page stacks: route name and chips, Hero and matchup, a compact level bar, the map at full width with its legend, then the other panels. Chips scroll sideways in one line with a fade at the end. Primary actions sit in a fixed bottom dock (8px from the edges and the safe area, 46px buttons, yellow "Stops" button first); stops open in a bottom sheet. Touch targets in stop rows are 44px; drag grips disappear and reordering moves into the opened stop.

**Rhythm.** Small steps: 6px between controls, 10px inside rows, 12px between floating panels, 14px panel padding, 24px between page-level blocks.

## Elevation & Depth

Soft, ambient depth. Panels float over the map on blurred shadows tinted from one colour token (rgba(0,0,0,.5) at night, rgba(15,20,30,.18) by day), with translucent fills so the map still glows faintly at the edges. There are no hard offset shadows.

### Shadow Vocabulary
- **Float** (`box-shadow: 0 8px 24px var(--w-shadow-c)`): every floating panel, the HUD bar, popovers, menus and the phone dock.
- **Rest** (`box-shadow: 0 2px 8px var(--w-shadow-c)`): Mantine cards and bordered papers on ordinary pages.
- **Hairline** (`box-shadow: 0 1px 2px var(--w-shadow-c)`): small lifted bits.
- **Ring** (`box-shadow: 0 0 0 2px <accent>`): selection on portraits and race circles; a 2px panel-coloured gap plus a 2px purple ring marks a level-up stop.

### Named Rules
**The Map Is The Bottom Layer Rule.** The map and its blurred copy are the lowest plane; everything interface floats above with the Float shadow. Nothing sits under the map.

## Shapes

Gently rounded, thin-edged. Panels and the HUD bar use an 8px corner; buttons, inputs and segmented controls 6px; chips 5px; tags, badges and tooltips 4px; the phone dock and sheets 12px. Every border is 1px in the edge colour. Round shapes are reserved for game things: stop numbers, camp circles, race portraits, the XP bar's ends. Hero and ability icons stay square-ish (5 to 6px), like the game's command card.

## Components

### Buttons
Compact HUD controls.
- **Shape:** 6px corner, 1px edge.
- **Primary:** route yellow fill and border, on-accent text, Chakra Petch 600 13px.
- **Default / light / outline:** wash fill, ink text; hover darkens the border to faint.
- **Press:** a 1px downward nudge (80ms). Disabled drops to a transparent fill with faint text.
- **Segmented control:** wash track with a 2px inset; the active segment is a yellow pill (4px corner) with on-accent text.

### Chips
- **Style:** wash fill, 5px corner, 4px 10px, Chakra Petch 600 12px, no border.
- **Tone:** sky or yellow text for links (back to map, matchup).

### Panels (Win)
The building block. A translucent panel plate with a 1px edge, 8px corner and the Float shadow. The title row (min 44px) starts with a small vertical tab, 4 by 16px with a 2px corner: yellow for the panels you act in, blue for reference panels, faint for neutral ones. Counts sit at the right in muted Hanken 700 13px. A foldable panel puts a chevron before the title that rotates 90 degrees when closed (160ms). The body is separated by a 1px rule.

### HUD Bar
The route page's top row: panel plate, 10px 14px, holding the back chip, the editable route name (Chakra Petch 21px, a 2px yellow underline on focus), the hint line, and Undo, Edit/Preview and the overflow menu on the right.

### Inputs / Fields
- **Style:** paper fill, 1px edge, 6px corner, Hanken 600.
- **Focus:** border turns mana blue; the global focus ring is a 3px mana-blue outline offset 2px.
- **Label:** field-label style above the control.

### Hero Level Bar
"Lv N" in purple Chakra Petch beside a 10px rounded track (xp-track) filled in XP purple, showing progress inside the current level only, with "167 / 400 XP to level 4" in muted meta under it. The fill eases over 400ms. The compact phone version adds the short XP figure on the right.

### Stop Row
A 28px round stop number, then the camp name (title), the meta line, item and drop tags, and the XP gain at the right. Number states: **filled yellow** = camp cleared; **dashed yellow outline** = creeps skipped; **blue** = waypoint; a **purple ring** = the hero levels up here. The active row is washed, an opened row uses paper, and a drop target shows a 2px yellow inset line on top.

### Ancient of War Row
Between stops, a green-washed row indented to the text column with a small Chakra Petch label in AoW text colour and the note in Hanken 700 14px; in edit mode the note is a small input whose focus ring is AoW green.

### Hero & Matchup
Race circles (42px; 28px on phones) dimmed and greyed until picked, then full colour with a 2px yellow ring. Heroes and abilities use the same dim-until-picked rule. Skill slots are dashed until filled; a filled ability carries a small yellow count badge.

### Map Markers
Camp circles in the game colours with a white rim; the active camp grows and gets a yellow outer ring. Waypoints are blue pins. The hero path is a dashed yellow line with a dark under-stroke and arrowheads; the AoW path is dotted green with small square points.

### Navigation
A translucent header (panel fill, 1px bottom edge) with the logo and text links in Chakra Petch 600; the theme toggle is a default action icon.

## Do's and Don'ts

### Do:
- **Do** give the map the first screen on the route page and keep every camp visible; size the map to its container, never crop it.
- **Do** float interface on panel plates: panel fill, 1px edge, 8px corner, the Float shadow.
- **Do** mark a panel with its small colour tab (yellow to act, blue for reference) rather than a filled title bar.
- **Do** keep route yellow for primary actions, stop numbers and the hero path.
- **Do** use on-accent (dark) for text on yellow, blue and game colours in both schemes.
- **Do** show stop states by shape: filled, dashed, ringed.
- **Do** keep both schemes structurally identical; only the token values change.

### Don't:
- **Don't** use hard offset shadows or zero-blur shadows; depth here is soft.
- **Don't** add a second accent or use XP purple and mana blue for actions.
- **Don't** repaint the map: camp colours and path colours stay the game's.
- **Don't** set reading text in Chakra Petch or buttons in Hanken Grotesk.
- **Don't** put uppercase tracked labels above headings as section kickers; the uppercase field label is only for a caption directly above a control.
- **Don't** cover the map with panels on desktop; panels live in the right column.
