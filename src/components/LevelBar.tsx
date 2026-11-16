import type { GameMap, Route } from '../types'
import { simulateRoute } from '../game/route'
import { Win } from './Win'
import classes from './LevelBar.module.css'

/** The hero's experience after the route, as Warcraft's purple XP bar with level marks. */
export function LevelBar({ map, route, compact }: { map: GameMap; route: Route; compact?: boolean }) {
  const { final } = simulateRoute(map, route.steps)
  const capped = final.level >= 5
  // only the current level's progress: empty at the start of a level, full at the next one
  const progress = capped ? 1 : final.progress
  const toNext = capped ? 'Level 5: creeps give no more XP' : `${Math.round(final.intoLevel)} / ${final.levelSpan} XP to level ${final.level + 1}`

  const bar = (
    <div className={classes.barWrap}>
      <div
        className={classes.track}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={capped ? 1 : final.levelSpan}
        aria-valuenow={capped ? 1 : Math.round(final.intoLevel)}
        aria-label={`XP toward level ${final.level + 1}`}
      >
        <div className={classes.fill} style={{ width: `${progress * 100}%` }} />
      </div>
    </div>
  )

  if (compact)
    return (
      <section className={classes.compactBox}>
        <span className={classes.level}>Lv {final.level}</span>
        {bar}
        <span className={classes.xpShort}>{capped ? 'Max' : `${Math.round(final.intoLevel)}/${final.levelSpan}`}</span>
      </section>
    )

  return (
    <Win title="Hero level" tone="white" right={<span>{Math.round(final.xp)} XP total</span>}>
      <div className={classes.wrap}>
        <span className={classes.level}>Lv {final.level}</span>
        {bar}
        <span className={classes.sub}>{toNext}</span>
      </div>
    </Win>
  )
}
