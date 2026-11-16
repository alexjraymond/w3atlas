import { useState, type ReactNode } from "react";
import { useMediaQuery } from "@mantine/hooks";
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
import { CREEP_HELPER } from "../game/heroes";
import type { Author } from "../cloud/types";
import { MapCanvas } from "./MapCanvas";
import { CreepRoute } from "./CreepRoute";
import { BuildOrder } from "./BuildOrder";
import { HeroMatchup } from "./HeroMatchup";
import { Win } from "./Win";
import { LevelBar } from "./LevelBar";
import { MapStage } from "./MapStage";
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
  const isPhone = useMediaQuery("(max-width: 48em)") ?? false;
  const map = MAP_BY_ID[route.mapId];
  if (!map) return null;
  const allOpen =
    route.steps.length > 0 && route.steps.every((s) => expanded.has(s.id));

  const companion = (
    <>
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
    </>
  );


  const titleBlock = (
    <Stack gap={6} style={{ flex: 1, minWidth: 0 }}>
      <Group gap={6} wrap="wrap">
        <Anchor
          href={href.map(map.id)}
          className={chips.chip}
          data-tone="sky"
          underline="never"
        >
          <IconArrowLeft size={14} stroke={2.5} />
          {map.name}
        </Anchor>
        {author && (
          <Group gap={6}>
            <Avatar
              src={author.avatarUrl}
              size={22}
              radius="xl"
              alt={author.username}
            >
              {author.username.slice(0, 1).toUpperCase()}
            </Avatar>
            <Text size="sm" fw={800}>
              {author.username}
            </Text>
          </Group>
        )}
        <Text size="xs" c="dimmed" fw={600}>
          Updated {ago(route.updatedAt)}
        </Text>
        {route.tags.map((t) => (
          <Badge key={t} variant="default" size="sm" tt="none">
            {t}
          </Badge>
        ))}
      </Group>
      <h1 className={chips.hudName} style={{ margin: 0 }}>
        {route.name || "Untitled route"}
      </h1>
      {route.notes && (
        <Text
          size="sm"
          fw={600}
          c="dimmed"
          lineClamp={2}
          maw="80ch"
          style={{ whiteSpace: "pre-wrap" }}
        >
          {route.notes}
        </Text>
      )}
    </Stack>
  );

  const mapCanvas = (
    <MapCanvas
      map={map}
      steps={route.steps}
      activeStepId={activeStep}
      onStepClick={(id) => setExpanded(new Set([...expanded, id]))}
      notes={route.mapNotes}
      readOnly
      helper={route.race ? CREEP_HELPER[route.race] : undefined}
    />
  );

  const routeWindow = (
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
                allOpen ? new Set() : new Set(route.steps.map((s) => s.id)),
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
  );

  if (isPhone)
    return (
      <Stack gap="md" px="xs">
        <Group
          justify="space-between"
          align="flex-start"
          wrap="nowrap"
          gap="sm"
        >
          {titleBlock}
          {actions}
        </Group>
        <HeroMatchup route={route} />
        <LevelBar map={map} route={route} compact />
        <Win title={`Map · ${map.name}`} tone="sky" bodyStyle={{ padding: 6 }}>
          {mapCanvas}
        </Win>
        {routeWindow}
        {companion}
        {children}
      </Stack>
    );

  return (
    <>
      <MapStage
        map={map}
        top={
          <div className={chips.hud}>
            {titleBlock}
            {actions}
          </div>
        }
        side={
          <>
            <HeroMatchup route={route} />
            <LevelBar map={map} route={route} />
            {routeWindow}
          </>
        }
      >
        {mapCanvas}
      </MapStage>
      <Stack gap="lg" mt="lg" px={{ base: "xs", sm: 0 }}>
        {companion}
        {children}
      </Stack>
    </>
  );
}
