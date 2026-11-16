import '@fontsource/nunito/600.css'
import '@fontsource/nunito/700.css'
import '@fontsource/nunito/800.css'
import '@fontsource/nunito/900.css'
import '@fontsource/cinzel/600.css'
import '@fontsource/cinzel/700.css'
import '@fontsource/cinzel/900.css'
import { createTheme, type MantineColorsTuple } from '@mantine/core'

/** Clan Site 2002, Warcraft edition: grid-paper desk, ink outlines (bronze at night), gold for what you can press. */
export const WORLD = {
  ground: '#F3EEDF',
  ink: '#1D2B1F',
  accent: '#E2B33C',
  sky: '#8EC9F2',
  body: '#FFFFFF',
  muted: '#4F5B4A',
  display: 'Cinzel, "Times New Roman", serif',
  sans: 'Nunito, system-ui, -apple-system, "Segoe UI", sans-serif',
} as const

// lime[5] is the brand lime; darker shades are for text on cream
const lime: MantineColorsTuple = ['#F7FCE6', '#EEF8CC', '#DDF19A', '#CEEB6E', '#C4E758', '#BFEA4B', '#A6D12F', '#7FA31C', '#5A7612', '#374A07']
const forest: MantineColorsTuple = ['#EEF1EC', '#D9DFD6', '#B6C0B1', '#919F8B', '#71806A', '#5A6953', '#4F5B4A', '#3A4636', '#2A3527', '#1D2B1F']
// Mantine's dark scheme draws from this ramp: forest-black instead of its default slate
const dark: MantineColorsTuple = ['#EDE7D6', '#C9C3B3', '#AAB4A5', '#87927F', '#4A564B', '#3A463C', '#243026', '#1C261F', '#121915', '#0B100D']
// gold[5] is Warcraft gold, the primary accent
const gold: MantineColorsTuple = ['#FDF6E3', '#F9EAC0', '#F3D88C', '#EDC965', '#E8BD4C', '#E2B33C', '#C99B2A', '#A27A1C', '#7A5B12', '#4F3A08']
const sky: MantineColorsTuple = ['#EAF6FE', '#D3ECFC', '#B4DEF8', '#9FD4F5', '#8EC9F2', '#6DB6E6', '#4A9AD0', '#2F7AAE', '#1F5A82', '#123A55']

export const theme = createTheme({
  primaryColor: 'gold',
  primaryShade: 5,
  autoContrast: true,
  luminanceThreshold: 0.45,
  black: WORLD.ink,
  white: WORLD.body,
  colors: { lime, gold, forest, sky, dark },
  defaultRadius: 0,
  fontFamily: WORLD.sans,
  fontFamilyMonospace: 'ui-monospace, monospace',
  headings: {
    fontFamily: WORLD.display,
    fontWeight: '700',
    sizes: {
      h1: { fontSize: '32px', lineHeight: '1.2' },
      h2: { fontSize: '24px', lineHeight: '1.25' },
      h3: { fontSize: '19px', lineHeight: '1.3' },
      h4: { fontSize: '16px', lineHeight: '1.35' },
      h5: { fontSize: '14px', lineHeight: '1.4' },
      h6: { fontSize: '13px', lineHeight: '1.4' },
    },
  },
  fontSizes: { xs: '13px', sm: '14px', md: '16px', lg: '18px', xl: '20px' },
  shadows: {
    xs: `2px 2px 0 ${WORLD.ink}`,
    sm: `3px 3px 0 ${WORLD.ink}`,
    md: `4px 4px 0 ${WORLD.ink}`,
    lg: `6px 6px 0 ${WORLD.ink}`,
    xl: `6px 6px 0 ${WORLD.ink}`,
  },
  components: {
    Tooltip: { defaultProps: { color: 'forest.9' } },
    Badge: { defaultProps: { radius: 0 } },
  },
})
