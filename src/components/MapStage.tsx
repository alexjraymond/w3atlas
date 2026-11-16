import type { ReactNode } from 'react'
import type { GameMap } from '../types'
import classes from './MapStage.module.css'

/**
 * Map-first layout: the minimap owns the screen (on a darkened, blurred copy of itself),
 * a HUD bar runs across the top and the plan floats in a column on the right.
 */
export function MapStage({ map, top, side, children }: { map: GameMap; top: ReactNode; side: ReactNode; children: ReactNode }) {
  return (
    <section className={classes.stage} aria-label={`${map.name} route`}>
      <div className={classes.backdrop} style={{ backgroundImage: `url(${map.image})` }} aria-hidden />
      <div className={classes.top}>{top}</div>
      <div className={classes.body}>
        <div className={classes.mapArea}>
          <div className={classes.mapBox} style={{ ['--ar' as string]: `${map.width / map.height}` }}>
            {children}
          </div>
        </div>
        <div className={classes.side}>{side}</div>
      </div>
    </section>
  )
}
