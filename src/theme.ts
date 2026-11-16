import '@fontsource/hanken-grotesk/500.css'
import '@fontsource/hanken-grotesk/600.css'
import '@fontsource/hanken-grotesk/700.css'
import '@fontsource/hanken-grotesk/800.css'
import '@fontsource/chakra-petch/500.css'
import '@fontsource/chakra-petch/600.css'
import '@fontsource/chakra-petch/700.css'
import { createTheme, type MantineColorsTuple } from '@mantine/core'

/** Map HUD: the minimap is the screen, and the route, hero and XP float over it as panels. */
export const WORLD = {
  display: '"Chakra Petch", system-ui, sans-serif',
  sans: '"Hanken Grotesk", system-ui, -apple-system, "Segoe UI", sans-serif',
} as const

// gold[5] is route yellow (#FFD43B), the primary accent and the hero path colour
const gold: MantineColorsTuple = ['#FFF9DB', '#FFF3BF', '#FFEC99', '#FFE066', '#FFD84D', '#FFD43B', '#FCC419', '#FAB005', '#E8A100', '#C78A00']
// Mantine's dark scheme draws from this ramp: HUD near-black
const dark: MantineColorsTuple = ['#EEF1F4', '#C9D0D9', '#9AA4B2', '#6B7686', '#3A4452', '#2C3440', '#1B222C', '#10141A', '#0B0E12', '#07090C']

export const theme = createTheme({
  primaryColor: 'gold',
  primaryShade: 5,
  autoContrast: true,
  luminanceThreshold: 0.45,
  colors: { gold, dark },
  defaultRadius: 'md',
  fontFamily: WORLD.sans,
  headings: {
    fontFamily: WORLD.display,
    fontWeight: '700',
    sizes: {
      h1: { fontSize: '30px', lineHeight: '1.2' },
      h2: { fontSize: '23px', lineHeight: '1.25' },
      h3: { fontSize: '18px', lineHeight: '1.3' },
      h4: { fontSize: '16px', lineHeight: '1.35' },
      h5: { fontSize: '14px', lineHeight: '1.4' },
      h6: { fontSize: '13px', lineHeight: '1.4' },
    },
  },
  fontSizes: { xs: '12px', sm: '14px', md: '15px', lg: '17px', xl: '19px' },
  shadows: {
    xs: '0 1px 2px var(--w-shadow-c)',
    sm: '0 2px 8px var(--w-shadow-c)',
    md: '0 8px 24px var(--w-shadow-c)',
    lg: '0 12px 32px var(--w-shadow-c)',
    xl: '0 16px 40px var(--w-shadow-c)',
  },
  components: {
    Tooltip: { defaultProps: { color: 'dark' } },
  },
})
