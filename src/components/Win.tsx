import type { CSSProperties, ReactNode } from 'react'
import classes from './Win.module.css'

/** A titled window: the building block of the Clan Site look. */
export function Win({
  title,
  tone = 'lime',
  right,
  children,
  style,
  className,
  bodyStyle,
  as: Tag = 'section',
}: {
  title: ReactNode
  tone?: 'lime' | 'sky' | 'white'
  right?: ReactNode
  children: ReactNode
  style?: CSSProperties
  className?: string
  bodyStyle?: CSSProperties
  as?: 'section' | 'div' | 'aside'
}) {
  return (
    <Tag className={`${classes.win} ${className ?? ''}`} style={style}>
      <div className={classes.bar} data-tone={tone}>
        <span className={classes.title}>{title}</span>
        {right && <span className={classes.right}>{right}</span>}
        <span className={classes.dots} aria-hidden>
          <i />
          <i />
          <i />
        </span>
      </div>
      <div className={classes.content} style={bodyStyle}>
        {children}
      </div>
    </Tag>
  )
}
