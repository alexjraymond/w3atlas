import type { CSSProperties } from 'react'

const BASE = `${import.meta.env.BASE_URL}icons/`
const FALLBACK = `${BASE}blankskill.png`

interface Props {
  name: string // icon slug, e.g. "stormbolt"
  size?: number
  alt?: string
  style?: CSSProperties
  className?: string
  dim?: boolean
}

/** Square WC3 icon from /public/icons with a blank fallback for missing art. */
export function GameIcon({ name, size = 32, alt, style, className, dim }: Props) {
  return (
    <img
      src={name ? `${BASE}${encodeURIComponent(name)}.png` : FALLBACK}
      key={name}
      width={size}
      height={size}
      alt={alt ?? name}
      title={alt}
      loading="lazy"
      draggable={false}
      className={className}
      style={{
        borderRadius: 4,
        flexShrink: 0,
        objectFit: 'cover',
        filter: dim ? 'grayscale(1) opacity(0.45)' : undefined,
        ...style,
      }}
      onError={(e) => {
        const img = e.currentTarget
        if (!img.src.endsWith(FALLBACK)) {
          img.src = FALLBACK
          img.style.filter = 'grayscale(1) opacity(0.5)'
        }
      }}
    />
  )
}
