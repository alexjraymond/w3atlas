import type { CSSProperties, ReactNode } from 'react'
import { IconChevronDown } from '@tabler/icons-react'
import classes from './Win.module.css'

/** A HUD panel with a title row. Pass `open` + `onToggle` to make it foldable. */
export function Win({
  title,
  tone = 'accent',
  right,
  children,
  style,
  className,
  bodyStyle,
  as: Tag = 'section',
  open,
  onToggle,
}: {
  title: ReactNode
  tone?: 'accent' | 'sky' | 'white'
  right?: ReactNode
  children: ReactNode
  style?: CSSProperties
  className?: string
  bodyStyle?: CSSProperties
  as?: 'section' | 'div' | 'aside'
  open?: boolean
  onToggle?: () => void
}) {
  const foldable = !!onToggle
  const shown = !foldable || open !== false
  return (
    <Tag className={`${classes.win} ${className ?? ''}`} style={style}>
      <div className={classes.bar} data-tone={tone}>
        {foldable ? (
          <button type="button" className={classes.fold} onClick={onToggle} aria-expanded={shown}>
            <IconChevronDown size={18} stroke={2.5} className={classes.chev} data-open={shown || undefined} />
            <span className={classes.title}>{title}</span>
          </button>
        ) : (
          <span className={classes.title}>{title}</span>
        )}
        {right && <span className={classes.right}>{right}</span>}
      </div>
      {shown && (
        <div className={classes.content} style={bodyStyle}>
          {children}
        </div>
      )}
    </Tag>
  )
}
