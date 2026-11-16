import { useState, type ReactNode } from "react";
import {
  Anchor,
  Avatar,
  Badge,
  Button,
  Group,
  Stack,
  Text,
} from "@mantine/core";
import { IconArrowLeft, IconExternalLink } from "@tabler/icons-react";
import type { Build, Route } from "../types";
import { MAP_BY_ID } from "../data/maps";
import { href } from "../lib/router";
import { CREEP_HELPER, HERO_BY_NAME, RACE_LABEL } from "../game/heroes";
import type { Author } from "../cloud/types";
import { MapCanvas } from "./MapCanvas";
import { CreepRoute } from "./CreepRoute";
import { BuildOrder } from "./BuildOrder";
import { GameIcon } from "./GameIcon";
import { HeroMatchup } from "./HeroMatchup";
import { Win } from "./Win";
import { LevelBar } from "./LevelBar";
import chips from "../pages/RoutePage.module.css";

const ago = (t: number) =>
  new Date(t).toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

interface Props {
  route: Route;
  build: Build | null | undefined;
  /** buttons shown top-right (edit toggle, menu, rating summary...) */
  actions?: ReactNode;
  /** who made it (public routes) */
  author?: Author;
  /** link for the companion build, if it can be opened here */
  buildHref?: string;
  /** extra content under the route (ratings, comments) */
  children?: ReactNode;
}

/** Read-only presentation of a route: header, level bar, map and stops, skill order, companion build. */
export function RouteViewer({
  route,
  build,
  actions,
  author,
  buildHref,
  children,
}: Props) {
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const map = MAP_BY_ID[route.mapId];
  if (!map) return null;
  const hero = route.hero ? HERO_BY_NAME[route.hero] : null;
  const allOpen =
    route.steps.length > 0 && route.steps.every((s) => expanded.has(s.id));

  return (
    <Stack gap="lg" px={{ base: "xs", sm: 0 }}>
      <Group justify="space-between" align="flex-end" wrap="wrap" gap="md">
        <Stack gap={10} style={{ flex: 1, minWidth: 260 }}>
          <Group gap={6}>
            <Anchor
              href={href.map(map.id)}
              className={chips.chip}
              data-tone="sky"
              underline="never"
            >
              <IconArrowLeft size={14} stroke={2.5} />
              {map.name}
            </Anchor>
            {route.race && (
              <span className={chips.chip} data-tone="accent">
                {RACE_LABEL[route.race]} vs{" "}
                {route.vs === "any" ? "any" : RACE_LABEL[route.vs]}
              </span>
            )}
            {hero && (
              <span className={chips.chip}>
                <GameIcon name={hero.icon} size={16} />
                {hero.name}
              </span>
            )}
          </Group>
          <h1 className={chips.nameInput} style={{ margin: 0 }}>
            {route.name || "Untitled route"}
          </h1>
          {route.notes && (
            <Text fw={700} maw="70ch" style={{ whiteSpace: "pre-wrap" }}>
              {route.notes}
            </Text>
          )}
          <Group gap={8}>
            {author && (
              <Group gap={6}>
                <Avatar
                  src={author.avatarUrl}
                  size={22}
                  radius={0}
                  alt={author.username}
                  style={{ border: "2px solid var(--w-edge)" }}
                >
                  {author.username.slice(0, 1).toUpperCase()}
                </Avatar>
                <Text size="sm" fw={900}>
                  {author.username}
                </Text>
              </Group>
            )}
            <Text size="sm" c="dimmed" fw={700}>
              Updated {ago(route.updatedAt)}
            </Text>
            {route.tags.map((t) => (
              <Badge key={t} variant="default" size="sm" tt="none">
                {t}
              </Badge>
            ))}
          </Group>
        </Stack>
        {actions}
      </Group>

      <HeroMatchup route={route} />

      <div className={chips.split}>
        <Stack gap="md">
          <Win
            title={`Map · ${map.name}`}
            tone="sky"
            bodyStyle={{ padding: 12 }}
          >
            <MapCanvas
              map={map}
              steps={route.steps}
              activeStepId={activeStep}
              onStepClick={(id) => setExpanded(new Set([...expanded, id]))}
              notes={route.mapNotes}
              readOnly
              helper={route.race ? CREEP_HELPER[route.race] : undefined}
            />
          </Win>
        </Stack>
        <Stack gap="md" style={{ alignSelf: "start" }}>
          <LevelBar map={map} route={route} />
          <Win
            title="Route"
            right={<span>{route.steps.length} stops</span>}
            style={{ alignSelf: "start" }}
          >
            {route.steps.length > 0 && (
              <Group
                justify="space-between"
                px={12}
                py={8}
                style={{ borderBottom: "2px solid var(--w-edge)" }}
              >
                <Text size="xs" c="dimmed" fw={700}>
                  Tap a stop for kill order and notes.
                </Text>
                <Button
                  size="compact-sm"
                  variant="subtle"
                  onClick={() =>
                    setExpanded(
                      allOpen
                        ? new Set()
                        : new Set(route.steps.map((s) => s.id)),
                    )
                  }
                >
                  {allOpen ? "Collapse all" : "Expand all"}
                </Button>
              </Group>
            )}
            <CreepRoute
              map={map}
              route={route}
              onStepsChange={() => {}}
              activeStepId={activeStep}
              onActiveStep={setActiveStep}
              expanded={expanded}
              onExpandedChange={setExpanded}
              readOnly
            />
          </Win>
        </Stack>
      </div>

      <Win
        title="Companion build"
        tone="white"
        right={
          build && buildHref ? (
            <Anchor href={buildHref} size="sm" fw={800} c="var(--w-ink)">
              <Group gap={4}>
                Open build <IconExternalLink size={14} />
              </Group>
            </Anchor>
          ) : undefined
        }
      >
        <Stack gap="sm" p="md">
          {build ? (
            <>
              <Group justify="space-between" align="flex-start">
                <div>
                  <Text fw={900}>{build.name}</Text>
                  {build.notes && (
                    <Text size="sm" c="dimmed" lineClamp={2}>
                      {build.notes}
                    </Text>
                  )}
                </div>
                <Badge variant="default" size="sm">
                  {build.steps.length} steps
                </Badge>
              </Group>
              <BuildOrder steps={build.steps} onChange={() => {}} readOnly />
            </>
          ) : (
            <Text size="sm" c="dimmed">
              No build order linked.
            </Text>
          )}
        </Stack>
      </Win>

      {children}
    </Stack>
  );
}
