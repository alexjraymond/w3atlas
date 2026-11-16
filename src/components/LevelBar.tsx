import type { GameMap, Route } from '../types'
import { simulateRoute } from '../game/route'
import { HERO_XP_TO_REACH } from '../game/xp'
import { Win } from './Win'
import classes from './LevelBar.module.css'

/**
 * The hero's level as a 2002 install bar: every stop fills its own striped segment,
 * stops that level the hero up are gold, and level thresholds are dashed marks.
 */
export function LevelBar({ map, route }: { map: GameMap; route: Route }) {
  const { results, final } = simulateRoute(map, route.steps)
  const capped = final.level >= 5
  const max = HERO_XP_TO_REACH[Math.min(final.level + 1, 5)] || 1
  const thresholds = [2, 3, 4, 5].filter((l) => HERO_XP_TO_REACH[l] <= max)
  const pct = (xp: number) => `${Math.min(100, (xp / max) * 100)}%`

  return (
    <Win title="Level.exe" right={<span>{route.steps.length} stops</span>}>
      <div className={classes.wrap}>
        <span className={classes.level} aria-label={`Hero level ${final.level}`}>
          LV {final.level}
        </span>
        <div>
          <div
            className={classes.track}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={max}
            aria-valuenow={final.xp}
            aria-label="Hero XP after the route"
          >
            {results
              .filter((r) => r.xpGained > 0)
              .map((r) => (
                <div
                  key={r.step.id}
                  className={classes.seg}
                  data-up={r.levelUps.length > 0 || undefined}
                  style={{ width: pct(r.xpGained) }}
                  title={`Stop ${r.index + 1}: +${r.xpGained} XP`}
                >
                  {r.xpGained / max > 0.05 && (
                    <span>
                      <b>{r.index + 1}</b>
                    </span>
                  )}
                </div>
              ))}
            {thresholds.map((l) => (
              <i key={l} className={classes.tick} style={{ left: pct(HERO_XP_TO_REACH[l]) }} />
            ))}
          </div>
          <div className={classes.ticks} aria-hidden>
            {thresholds.map((l) => (
              <span key={l} style={{ left: pct(HERO_XP_TO_REACH[l]) }}>
                L{l}
              </span>
            ))}
          </div>
        </div>
        <span className={classes.xp}>
          {capped ? 'Level 5: creeps give no more XP' : `${Math.round(final.intoLevel)} / ${final.levelSpan} XP to level ${final.level + 1}`}
          <small>{Math.round(final.xp)} XP total</small>
        </span>
      </div>
    </Win>
  )
}
