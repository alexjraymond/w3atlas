import { Fragment, useState } from "react";
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Collapse,
  Group,
  Progress,
  Stack,
  Text,
  Textarea,
  TextInput,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import {
  IconArrowDown,
  IconArrowUp,
  IconChevronDown,
  IconGripVertical,
  IconMapPinFilled,
  IconMinus,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import type { GameMap, Route, RouteStep } from "../types";
import classes from "./CreepRoute.module.css";
import {
  campInstances,
  DIFFICULTY_LABEL,
  iconSlug,
  itemName,
  LOOT_COLOR,
  LOOT_LABEL,
} from "../data/maps";
import { simulateRoute, type StepResult } from "../game/route";
import { CREEP_HELPER, HERO_BY_NAME } from "../game/heroes";
import { DifficultyDot } from "./CampDetails";
import { KillOrder, KillOrderStrip } from "./KillOrder";
import { GameIcon } from "./GameIcon";

export function XpSummary({ map, route }: { map: GameMap; route: Route }) {
  const { final } = simulateRoute(map, route.steps);
  const capped = final.level >= 5;
  return (
    <Card withBorder padding="sm">
      <Group justify="space-between" align="baseline">
        <Text size="xs" fw={700} c="dimmed" tt="uppercase">
          Hero level after route
        </Text>
        <Text size="xs" c="dimmed">
          {Math.round(final.xp)} xp
        </Text>
      </Group>
      <Group gap="xs" align="baseline" mt={2}>
        <Text fz={28} fw={800} lh={1}>
          {final.exact.toFixed(2)}
        </Text>
        <Text size="xs" c={capped ? "orange" : "dimmed"}>
          {capped
            ? "Level 5+: creeps no longer give XP"
            : `${Math.round(final.intoLevel)} / ${final.levelSpan} to level ${final.level + 1}`}
        </Text>
      </Group>
      <Progress
        value={final.progress * 100}
        mt={8}
        size="sm"
        color={capped ? "orange" : "yellow"}
      />
    </Card>
  );
}

function SkillsLearned({ route, levels }: { route: Route; levels: number[] }) {
  const hero = route.hero ? HERO_BY_NAME[route.hero] : null;
  if (!hero || !levels.length) return null;
  return (
    <Group gap={2}>
      {levels.map((lvl) => {
        const ability = hero.abilities.find(
          (a) => a.name === route.skills[lvl - 1],
        );
        return ability ? (
          <Tooltip key={lvl} label={`Level ${lvl}: learn ${ability.name}`}>
            <span style={{ display: "flex" }}>
              <GameIcon name={ability.icon} size={18} />
            </span>
          </Tooltip>
        ) : null;
      })}
    </Group>
  );
}

interface StepProps {
  route: Route;
  result: StepResult;
  count: number;
  open: boolean;
  active: boolean;
  readOnly?: boolean;
  dragOver: boolean;
  onOpen: (open: boolean) => void;
  onHover: () => void;
  onChange: (s: RouteStep) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
  onDragStart: () => void;
  onDragOver: () => void;
  onDrop: () => void;
  onDragEnd: () => void;
}

const AOW = "Ancient of War";
const DEFAULT_AOW_NOTE = "make 5 archers then move";

/** A thin green row after a stop where the Ancient of War is brought: what it does next. */
function AowLeg({
  step,
  readOnly,
  onChange,
}: {
  step: RouteStep;
  readOnly?: boolean;
  onChange: (s: RouteStep) => void;
}) {
  return (
    <div className={classes.aowLeg}>
      <GameIcon name="ancientofwar" size={20} alt="" />
      <span className={classes.aowLabel}>AoW</span>
      {readOnly ? (
        <span className={classes.aowText}>
          {step.aowNote || "moves to the next AoW camp"}
        </span>
      ) : (
        <input
          className={classes.aowInput}
          value={step.aowNote ?? ""}
          placeholder={DEFAULT_AOW_NOTE}
          aria-label="What the Ancient of War does after this stop"
          onChange={(e) =>
            onChange({ ...step, aowNote: e.currentTarget.value })
          }
        />
      )}
    </div>
  );
}

function HelperToggle({
  route,
  step,
  onChange,
}: {
  route: Route;
  step: RouteStep;
  onChange: (s: RouteStep) => void;
}) {
  const helper = route.race ? CREEP_HELPER[route.race] : undefined;
  if (!helper) return null;
  const count = step.helpers[helper.name] ?? 0;
  const on = count > 0;
  const setCount = (n: number) => {
    const helpers = { ...step.helpers };
    if (n <= 0) delete helpers[helper.name];
    else helpers[helper.name] = Math.min(n, helper.maxCount);
    // the Ancient of War gets a note for what it does after this camp
    const aowNote =
      helper.name === AOW && n > 0 && !step.aowNote
        ? DEFAULT_AOW_NOTE
        : step.aowNote;
    onChange({
      ...step,
      helpers,
      ...(aowNote !== undefined ? { aowNote } : {}),
    });
  };
  return (
    <Group gap={2} wrap="nowrap">
      <Button
        size="xs"
        variant={on ? "light" : "default"}
        color={on ? "yellow" : "gray"}
        leftSection={
          <GameIcon name={helper.icon} size={18} alt={helper.name} dim={!on} />
        }
        onClick={() => setCount(on ? 0 : helper.defaultCount)}
        aria-pressed={on}
      >
        {helper.name}
        {on ? " ✓" : "?"}
      </Button>
      {on && helper.counted && (
        <Group
          gap={0}
          wrap="nowrap"
          style={{ border: "1px solid var(--w-edge)", borderRadius: 6 }}
        >
          <ActionIcon
            size="md"
            variant="subtle"
            color="gray"
            onClick={() => setCount(count - 1)}
            aria-label={`One less ${helper.name}`}
          >
            <IconMinus size={14} />
          </ActionIcon>
          <Text
            size="sm"
            fw={700}
            w={24}
            ta="center"
            aria-label={`${count} ${helper.name}`}
          >
            {count}
          </Text>
          <ActionIcon
            size="md"
            variant="subtle"
            color="gray"
            disabled={count >= helper.maxCount}
            onClick={() => setCount(count + 1)}
            aria-label={`One more ${helper.name}`}
          >
            <IconPlus size={14} />
          </ActionIcon>
        </Group>
      )}
    </Group>
  );
}

function StepCard(p: StepProps) {
  const { route, result, readOnly } = p;
  const { step, index, camp } = result;
  const [showCondition, setShowCondition] = useState(!!step.condition);
  const isWaypoint = step.kind === "waypoint";
  if (!isWaypoint && !camp) return null;

  const skipped =
    camp && step.rest === "skip" && step.groups.length
      ? campInstances(camp).filter((c) => !step.groups.flat().includes(c.uid))
      : [];
  const helper = route.race ? CREEP_HELPER[route.race] : undefined;
  const withHelper = helper && step.helpers[helper.name];

  const numState = isWaypoint
    ? "waypoint"
    : result.levelUps.length
      ? "up"
      : result.killed < result.total
        ? "partial"
        : "cleared";
  const numTitle =
    numState === "waypoint"
      ? "Waypoint"
      : numState === "up"
        ? "Levels up here"
        : numState === "partial"
          ? `${result.killed} of ${result.total} creeps killed`
          : "Camp cleared";
  const title = isWaypoint ? step.label || "Waypoint" : camp!.title;
  const subtitle = isWaypoint
    ? "Waypoint"
    : `${DIFFICULTY_LABEL[camp!.difficulty]} · Lv ${camp!.level} · ${camp!.name}`;

  return (
    <div
      className={classes.stop}
      data-up={result.levelUps.length > 0 || undefined}
      data-active={p.active || undefined}
      data-open={p.open || undefined}
      data-over={p.dragOver || undefined}
      onMouseEnter={p.onHover}
      onDragOver={(e) => {
        e.preventDefault();
        p.onDragOver();
      }}
      onDrop={(e) => {
        e.preventDefault();
        p.onDrop();
      }}
    >
      <div className={classes.row}>
        {!readOnly && (
          <span
            draggable
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = "move";
              p.onDragStart();
            }}
            onDragEnd={p.onDragEnd}
            className={classes.grip}
            aria-label="Drag to reorder"
          >
            <IconGripVertical size={16} />
          </span>
        )}
        <span className={classes.num} data-state={numState} title={numTitle}>
          {index + 1}
        </span>
        <Stack gap={6} style={{ flex: 1, minWidth: 0 }}>
          <UnstyledButton
            onClick={() => p.onOpen(!p.open)}
            className={classes.head}
            aria-expanded={p.open}
          >
            <Group
              justify="space-between"
              wrap="nowrap"
              gap={8}
              align="flex-start"
            >
              <div style={{ minWidth: 0 }}>
                <Group gap={6} wrap="nowrap" align="center">
                  {isWaypoint ? (
                    <IconMapPinFilled size={14} color="#2f7aae" />
                  ) : (
                    <DifficultyDot camp={camp!} />
                  )}
                  <span className={classes.title}>{title}</span>
                </Group>
                <div className={classes.sub}>{subtitle}</div>
              </div>
              <Group gap={8} wrap="nowrap" align="flex-start">
                <span className={classes.xp}>
                  {result.xpGained > 0 ? `+${result.xpGained}` : "—"}
                  <small>
                    Lv {result.after.level} · {Math.round(result.after.xp)} xp
                  </small>
                </span>
                <IconChevronDown
                  size={16}
                  style={{
                    marginTop: 2,
                    transform: p.open ? "rotate(180deg)" : undefined,
                    transition: "transform 120ms",
                  }}
                />
              </Group>
            </Group>
          </UnstyledButton>
          {result.levelUps.length > 0 && (
            <span>
              <span className={classes.levelTag}>
                Level {result.levelUps.join(", ")}
              </span>
            </span>
          )}

          {/* possible item drops: badge + the items that drop can be */}
          {result.drops.length > 0 && (
            <Group gap={10} style={{ rowGap: 6 }}>
              {result.drops.map((d, i) => (
                <Group key={i} gap={4} wrap="wrap" style={{ rowGap: 4 }}>
                  <Badge
                    size="sm"
                    variant="filled"
                    color={`${LOOT_COLOR[d.type]}.3`}
                    fz={11}
                    style={{ color: "var(--w-on-accent)" }}
                  >
                    L{d.level} {LOOT_LABEL[d.type]}
                  </Badge>
                  <Group gap={2} wrap="wrap">
                    {d.items.map((item) => (
                      <Tooltip
                        key={item}
                        label={itemName(item)}
                        openDelay={100}
                      >
                        <span style={{ display: "flex" }}>
                          <GameIcon
                            name={iconSlug(item)}
                            size={18}
                            alt={itemName(item)}
                          />
                        </span>
                      </Tooltip>
                    ))}
                  </Group>
                </Group>
              ))}
            </Group>
          )}

          {/* summary line: helper, condition, skills learned */}
          {(withHelper || step.condition || result.levelUps.length > 0) && (
            <Group gap={6}>
              {withHelper && helper && (
                <Badge
                  size="xs"
                  variant="light"
                  color="yellow"
                  leftSection={<GameIcon name={helper.icon} size={12} />}
                >
                  {helper.counted ? `${step.helpers[helper.name]}× ` : ""}
                  {helper.name}
                </Badge>
              )}
              {step.condition && (
                <Badge size="xs" variant="light" color="grape" tt="none">
                  if {step.condition}
                </Badge>
              )}
              <SkillsLearned route={route} levels={result.levelUps} />
            </Group>
          )}

          {!p.open && camp && (
            <KillOrderStrip groups={result.groups} skipped={skipped} />
          )}
          {!p.open && step.note && (
            <Text size="xs" c="dimmed" lineClamp={2}>
              {step.note}
            </Text>
          )}

          <Collapse in={p.open}>
            <Stack gap="sm" pt={4} pb={4}>
              {isWaypoint && !readOnly && (
                <TextInput
                  size="xs"
                  label="What happens here"
                  placeholder="e.g. Shop: buy TP + 2 potions, Tavern: 2nd hero"
                  value={step.label ?? ""}
                  onChange={(e) =>
                    p.onChange({ ...step, label: e.currentTarget.value })
                  }
                />
              )}

              {camp && (
                <KillOrder
                  camp={camp}
                  step={step}
                  groups={result.groups}
                  readOnly={readOnly}
                  onChange={p.onChange}
                />
              )}

              {readOnly ? (
                <>
                  {step.condition && (
                    <Text size="sm">
                      <Text span c="grape.9" fw={600}>
                        Condition:
                      </Text>{" "}
                      {step.condition}
                    </Text>
                  )}
                  {step.note && (
                    <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                      {step.note}
                    </Text>
                  )}
                </>
              ) : (
                <>
                  <Group gap={8} wrap="wrap" align="center">
                    {camp && (
                      <HelperToggle
                        route={route}
                        step={step}
                        onChange={p.onChange}
                      />
                    )}
                    {showCondition || step.condition ? (
                      <TextInput
                        size="xs"
                        style={{ flex: 1 }}
                        placeholder="Condition, e.g. only if no early harass"
                        leftSection={
                          <Text size="xs" c="grape.9" fw={700}>
                            if
                          </Text>
                        }
                        value={step.condition}
                        autoFocus={showCondition && !step.condition}
                        onChange={(e) =>
                          p.onChange({
                            ...step,
                            condition: e.currentTarget.value,
                          })
                        }
                        onBlur={() =>
                          !step.condition && setShowCondition(false)
                        }
                      />
                    ) : (
                      <Button
                        size="xs"
                        variant="default"
                        leftSection={<IconPlus size={14} />}
                        onClick={() => setShowCondition(true)}
                      >
                        Condition
                      </Button>
                    )}
                  </Group>
                  <Textarea
                    size="xs"
                    autosize
                    minRows={2}
                    placeholder="What to do here and why (optional)"
                    value={step.note}
                    onChange={(e) =>
                      p.onChange({ ...step, note: e.currentTarget.value })
                    }
                  />
                  {/* narrow screens: reorder and remove live here so the row keeps its width */}
                  <Group gap={8} className={classes.toolsInline}>
                    <Button
                      size="xs"
                      variant="default"
                      leftSection={<IconArrowUp size={14} />}
                      disabled={index === 0}
                      onClick={() => p.onMove(-1)}
                    >
                      Up
                    </Button>
                    <Button
                      size="xs"
                      variant="default"
                      leftSection={<IconArrowDown size={14} />}
                      disabled={index === p.count - 1}
                      onClick={() => p.onMove(1)}
                    >
                      Down
                    </Button>
                    <span style={{ flex: 1 }} />
                    <Button
                      size="xs"
                      variant="default"
                      color="red"
                      leftSection={<IconTrash size={14} />}
                      onClick={p.onRemove}
                    >
                      Remove
                    </Button>
                  </Group>
                </>
              )}
            </Stack>
          </Collapse>
        </Stack>
        {!readOnly && (
          <div className={classes.tools}>
            <ActionIcon
              size="sm"
              variant="subtle"
              color="gray"
              disabled={index === 0}
              onClick={() => p.onMove(-1)}
              aria-label="Move up"
            >
              <IconArrowUp size={14} />
            </ActionIcon>
            <ActionIcon
              size="sm"
              variant="subtle"
              color="gray"
              disabled={index === p.count - 1}
              onClick={() => p.onMove(1)}
              aria-label="Move down"
            >
              <IconArrowDown size={14} />
            </ActionIcon>
            <ActionIcon
              size="sm"
              variant="subtle"
              color="red"
              onClick={p.onRemove}
              aria-label="Remove step"
            >
              <IconTrash size={14} />
            </ActionIcon>
          </div>
        )}
      </div>
    </div>
  );
}

interface Props {
  map: GameMap;
  route: Route;
  onStepsChange: (steps: RouteStep[]) => void;
  activeStepId: string | null;
  onActiveStep: (id: string | null) => void;
  expanded: Set<string>;
  onExpandedChange: (s: Set<string>) => void;
  readOnly?: boolean;
}

export function CreepRoute({
  map,
  route,
  onStepsChange,
  activeStepId,
  onActiveStep,
  expanded,
  onExpandedChange,
  readOnly,
}: Props) {
  const { results } = simulateRoute(map, route.steps);
  const steps = route.steps;
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  if (!steps.length) {
    return (
      <div className={classes.empty}>
        {readOnly
          ? "No creep route yet."
          : "Tap camps on the map, in order, to build your route. Use Waypoint for shop or tavern stops."}
      </div>
    );
  }

  const moveTo = (from: number, to: number) => {
    if (from === to || to < 0 || to >= steps.length) return;
    const next = [...steps];
    const [s] = next.splice(from, 1);
    next.splice(to, 0, s);
    onStepsChange(next);
  };

  return (
    <div className={classes.list} onMouseLeave={() => onActiveStep(null)}>
      {results.map((r, i) => (
        <Fragment key={r.step.id}>
          <StepCard
            route={route}
            result={r}
            count={steps.length}
            open={expanded.has(r.step.id)}
            active={activeStepId === r.step.id}
            readOnly={readOnly}
            dragOver={overId === r.step.id && dragId !== r.step.id}
            onOpen={(o) => {
              const next = new Set(expanded);
              if (o) next.add(r.step.id);
              else next.delete(r.step.id);
              onExpandedChange(next);
            }}
            onHover={() => onActiveStep(r.step.id)}
            onChange={(s) =>
              onStepsChange(steps.map((x) => (x.id === s.id ? s : x)))
            }
            onMove={(dir) => moveTo(i, i + dir)}
            onRemove={() =>
              onStepsChange(steps.filter((x) => x.id !== r.step.id))
            }
            onDragStart={() => setDragId(r.step.id)}
            onDragOver={() => setOverId(r.step.id)}
            onDrop={() => {
              if (dragId)
                moveTo(
                  steps.findIndex((s) => s.id === dragId),
                  i,
                );
              setDragId(null);
              setOverId(null);
            }}
            onDragEnd={() => {
              setDragId(null);
              setOverId(null);
            }}
          />
          {route.race === "nightelf" && r.step.helpers[AOW] ? (
            <AowLeg
              step={r.step}
              readOnly={readOnly}
              onChange={(st) =>
                onStepsChange(steps.map((x) => (x.id === st.id ? st : x)))
              }
            />
          ) : null}
        </Fragment>
      ))}
    </div>
  );
}
