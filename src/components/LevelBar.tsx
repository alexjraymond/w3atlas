import type { GameMap, Route } from '../types'
import { simulateRoute } from '../game/route'
import { HERO_XP_TO_REACH } from '../game/xp'
import { Win } from './Win'
import classes from './LevelBar.module.css'

/** The hero's experience after the route, as Warcraft's purple XP bar with level marks. */
export function LevelBar({ map, route, compact }: { map: GameMap; route: Route; compact?: boolean }) {
  const { final } = simulateRoute(map, route.steps)
  const capped = final.level >= 5
  const max = HERO_XP_TO_REACH[Math.min(final.level + 1, 5)] || 1
  const thresholds = [2, 3, 4, 5].filter((l) => HERO_XP_TO_REACH[l] <= max)
  const pct = (xp: number) => `${Math.min(100, (xp / max) * 100)}%`
  const toNext = capped ? 'Level 5: creeps give no more XP' : `${Math.round(final.intoLevel)} / ${final.levelSpan} XP to level ${final.level + 1}`

  const bar = (
    <div className={classes.barWrap}>
      <div className={classes.track} role="progressbar" aria-valuemin={0} aria-valuemax={max} aria-valuenow={final.xp} aria-label="Hero XP after the route">
        <div className={classes.fill} style={{ width: pct(final.xp) }} />
        {thresholds.map((l) => (
          <i key={l} className={classes.tick} style={{ left: pct(HERO_XP_TO_REACH[l]) }} />
        ))}
      </div>
      <div className={classes.ticks} aria-hidden>
        {thresholds.map((l) => (
          <span key={l} style={{ left: pct(HERO_XP_TO_REACH[l]) }}>
            Lv {l}
          </span>
        ))}
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
