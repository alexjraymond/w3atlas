import '@fontsource/nunito/600.css'
import '@fontsource/nunito/700.css'
import '@fontsource/nunito/800.css'
import '@fontsource/nunito/900.css'
import '@fontsource/press-start-2p/400.css'
import { createTheme, type MantineColorsTuple } from '@mantine/core'

/** Clan Site 2002: cream grid-paper desktop, forest-ink outlines, lime for what you can press. */
export const WORLD = {
  ground: '#F3EEDF',
  ink: '#1D2B1F',
  lime: '#BFEA4B',
  sky: '#8EC9F2',
  body: '#FFFFFF',
  muted: '#4F5B4A',
  pixel: '"Press Start 2P", ui-monospace, monospace',
  sans: 'Nunito, system-ui, -apple-system, "Segoe UI", sans-serif',
} as const

// lime[5] is the brand lime; darker shades are for text on cream
const lime: MantineColorsTuple = ['#F7FCE6', '#EEF8CC', '#DDF19A', '#CEEB6E', '#C4E758', '#BFEA4B', '#A6D12F', '#7FA31C', '#5A7612', '#374A07']
const forest: MantineColorsTuple = ['#EEF1EC', '#D9DFD6', '#B6C0B1', '#919F8B', '#71806A', '#5A6953', '#4F5B4A', '#3A4636', '#2A3527', '#1D2B1F']
const sky: MantineColorsTuple = ['#EAF6FE', '#D3ECFC', '#B4DEF8', '#9FD4F5', '#8EC9F2', '#6DB6E6', '#4A9AD0', '#2F7AAE', '#1F5A82', '#123A55']

export const theme = createTheme({
  primaryColor: 'lime',
  primaryShade: 5,
  autoContrast: true,
  luminanceThreshold: 0.45,
  black: WORLD.ink,
  white: WORLD.body,
  colors: { lime, forest, sky },
  defaultRadius: 0,
  fontFamily: WORLD.sans,
  fontFamilyMonospace: WORLD.pixel,
  headings: {
    fontFamily: WORLD.pixel,
    fontWeight: '400',
    sizes: {
      h1: { fontSize: '22px', lineHeight: '1.5' },
      h2: { fontSize: '17px', lineHeight: '1.6' },
      h3: { fontSize: '14px', lineHeight: '1.7' },
      h4: { fontSize: '12px', lineHeight: '1.8' },
      h5: { fontSize: '10px', lineHeight: '1.8' },
      h6: { fontSize: '9px', lineHeight: '1.8' },
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
