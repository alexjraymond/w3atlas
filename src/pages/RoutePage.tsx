import { useRef, useState } from "react";
import { useMediaQuery } from "@mantine/hooks";
import { AowPathEditor } from "../components/AowPath";
import { Win } from "../components/Win";
import { LevelBar } from "../components/LevelBar";
import chips from "./RoutePage.module.css";
import {
  ActionIcon,
  Anchor,
  Badge,
  Button,
  CopyButton,
  Drawer,
  Group,
  Menu,
  SegmentedControl,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  TagsInput,
  Text,
  Textarea,
  Tooltip,
} from "@mantine/core";
import {
  IconArrowBackUp,
  IconArrowLeft,
  IconCopy,
  IconDots,
  IconDownload,
  IconExternalLink,
  IconLink,
  IconListNumbers,
  IconMapPin,
  IconNote,
  IconPlus,
  IconRestore,
  IconTrash,
  IconWorld,
} from "@tabler/icons-react";
import type { MapNote, Route } from "../types";
import { MAP_BY_ID } from "../data/maps";
import { href, navigate } from "../lib/router";
import {
  builds,
  createBuild,
  duplicateRoute,
  encodeShare,
  exportBundle,
  routes,
  useBuild,
  useBuilds,
  useRoute,
  useRoutes,
} from "../store";
import { newStep, newWaypoint, uid } from "../game/route";
import { CREEP_HELPER, RACE_LABEL } from "../game/heroes";
import { downloadFile, fileSafe } from "../lib/files";
import { MapCanvas } from "../components/MapCanvas";
import { HeroMatchup } from "../components/HeroMatchup";
import { CreepRoute } from "../components/CreepRoute";
import { BuildOrder } from "../components/BuildOrder";
import { RouteViewer } from "../components/RouteViewer";
import { cloud } from "../cloud";
import { useAccount } from "../cloud/sync";
import { NotFound } from "./NotFound";

export function RoutePage({ routeId }: { routeId: string }) {
  const route = useRoute(routeId);
  const account = useAccount();
  const build = useBuild(route?.buildId);
  const allBuilds = useBuilds();
  const allRoutes = useRoutes();
  const [mode, setMode] = useState<"edit" | "view">(() =>
    route && route.steps.length > 0 ? "view" : "edit",
  );
  const [placing, setPlacing] = useState<"note" | "waypoint" | "aow" | null>(
    null,
  );
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const isPhone = useMediaQuery("(max-width: 48em)") ?? false;
  const [sheet, setSheet] = useState(false);
  // undo history (this page visit only)
  const history = useRef<Route[]>([]);
  const lastPush = useRef({ key: "", t: 0 });
  const [, force] = useState(0);

  if (!route) return <NotFound what="route" />;
  const map = MAP_BY_ID[route.mapId];
  if (!map) return <NotFound what="map" />;

  const readOnly = mode === "view";

  /** Save a change. Rapid edits of the same kind (typing) collapse into one undo step. */
  const patch = (p: Partial<Route>) => {
    const key = Object.keys(p).sort().join(",");
    const now = Date.now();
    if (
      key !== lastPush.current.key ||
      now - lastPush.current.t > 1200 ||
      key === "steps"
    ) {
      history.current = [...history.current.slice(-49), route];
      force((n) => n + 1);
    }
    lastPush.current = { key, t: now };
    routes.save({ ...route, ...p });
  };
  const undo = () => {
    const prev = history.current.pop();
    if (prev) {
      routes.put(prev);
      lastPush.current = { key: "", t: 0 };
      force((n) => n + 1);
    }
  };

  const toggleCamp = (campId: string) => {
    const exists = route.steps.find((s) => s.campId === campId);
    if (exists) patch({ steps: route.steps.filter((s) => s.id !== exists.id) });
    else {
      const step = newStep(campId);
      patch({ steps: [...route.steps, step] });
      setExpanded(new Set([step.id])); // focus the new step
    }
  };
  const setNote = (note: MapNote) =>
    patch({
      mapNotes: route.mapNotes.map((n) => (n.id === note.id ? note : n)),
    });
  const onPlace = (x: number, y: number) => {
    if (placing === "waypoint") {
      const wp = newWaypoint(Math.round(x), Math.round(y));
      patch({ steps: [...route.steps, wp] });
      setExpanded(new Set([wp.id]));
    } else if (placing === "aow") {
      // keep placing: the path usually has several points
      patch({
        aowPath: [
          ...route.aowPath,
          { id: uid(), x: Math.round(x), y: Math.round(y), note: "" },
        ],
      });
      return;
    } else if (placing === "note") {
      patch({
        mapNotes: [
          ...route.mapNotes,
          {
            id: uid(),
            x: (x / map.width) * 100,
            y: (y / map.height) * 100,
            text: "",
          },
        ],
      });
    }
    setPlacing(null);
  };

  const owned = !!account.user && route.ownerId === account.user.id;
  // public routes get a short community link; otherwise the whole route is packed into the link
  const shareUrl = `${window.location.origin}${window.location.pathname}${route.isPublic && owned ? href.publicRoute(route.id) : href.share(encodeShare(route))}`;
  const publicHint = !cloud
    ? null
    : !account.user
      ? "Sign in to share routes in Community"
      : !owned
        ? "Add this route to your account first (home page)"
        : route.isPublic
          ? "Visible to everyone in Community"
          : "Only you can see this route";
  const usedBy = build
    ? allRoutes.filter((r) => r.buildId === build.id).length
    : 0;
  const allOpen =
    route.steps.length > 0 && route.steps.every((s) => expanded.has(s.id));

  // ---------- pieces ----------

  const actions = (
    <Group gap="xs" wrap="nowrap">
      {!readOnly && !isPhone && (
        <Button
          size="xs"
          variant="default"
          leftSection={<IconArrowBackUp size={14} />}
          disabled={!history.current.length}
          onClick={undo}
        >
          Undo
        </Button>
      )}
      {publicHint && (
        <Tooltip label={publicHint}>
          <div>
            <Switch
              size="sm"
              label="Public"
              checked={route.isPublic}
              disabled={!owned}
              onChange={(e) => patch({ isPublic: e.currentTarget.checked })}
            />
          </div>
        </Tooltip>
      )}
      {route.isPublic && owned && (
        <Tooltip label="Open the public page (ratings and comments)">
          <ActionIcon
            variant="default"
            size="md"
            component="a"
            href={href.publicRoute(route.id)}
            aria-label="Public page"
          >
            <IconWorld size={16} />
          </ActionIcon>
        </Tooltip>
      )}
      <SegmentedControl
        size="xs"
        value={mode}
        onChange={(v) => {
          setMode(v as "edit" | "view");
          setPlacing(null);
        }}
        data={[
          { value: "edit", label: "Edit" },
          { value: "view", label: "Preview" },
        ]}
      />
      <Menu position="bottom-end" shadow="md">
        <Menu.Target>
          <ActionIcon variant="default" size="md" aria-label="More actions">
            <IconDots size={16} />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <CopyButton value={shareUrl}>
            {({ copied, copy }) => (
              <Menu.Item
                leftSection={<IconLink size={14} />}
                onClick={copy}
                closeMenuOnClick={false}
              >
                {copied ? "Link copied!" : "Copy share link"}
              </Menu.Item>
            )}
          </CopyButton>
          <Menu.Item
            leftSection={<IconDownload size={14} />}
            onClick={() =>
              downloadFile(
                `${fileSafe(route.name)}.json`,
                exportBundle([route]),
              )
            }
          >
            Export file
          </Menu.Item>
          <Menu.Item
            leftSection={<IconCopy size={14} />}
            onClick={() => {
              const c = duplicateRoute(route.id);
              if (c) navigate(href.route(c.id));
            }}
          >
            Duplicate
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item
            color="red"
            leftSection={<IconTrash size={14} />}
            onClick={() => {
              if (confirm(`Delete "${route.name}"? This can't be undone.`)) {
                routes.remove(route.id);
                navigate(href.map(map.id));
              }
            }}
          >
            Delete route
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Group>
  );

  const hint =
    placing === "aow"
      ? "Tap the map to add Ancient of War path points, in walking order. Press Done when finished."
      : placing === "waypoint"
        ? "Tap the map where the waypoint goes: a shop, the tavern, a spot to wait."
        : placing === "note"
          ? "Tap anywhere on the map to drop the note."
          : "Tap a camp to add it as the next stop. Tap it again to remove it.";

  const mapCanvas = (
    <MapCanvas
      map={map}
      steps={route.steps}
      activeStepId={activeStep}
      onCampClick={toggleCamp}
      onStepClick={(id) => {
        setExpanded(new Set([...expanded, id]));
        if (isPhone) setSheet(true);
      }}
      notes={route.mapNotes}
      placing={placing}
      onPlace={onPlace}
      onChangeNote={setNote}
      onDeleteNote={(id) =>
        patch({ mapNotes: route.mapNotes.filter((n) => n.id !== id) })
      }
      readOnly={readOnly}
      helper={route.race ? CREEP_HELPER[route.race] : undefined}
      aowPath={route.aowPath}
      onAowPathChange={(aowPath) => patch({ aowPath })}
    />
  );

  const togglePlacing = (what: "note" | "waypoint" | "aow") =>
    setPlacing((p) => (p === what ? null : what));
  const showAow = route.race === "nightelf" || route.aowPath.length > 0;

  const aowEditor = showAow && (
    <AowPathEditor
      path={route.aowPath}
      onChange={(aowPath) => patch({ aowPath })}
      placing={placing === "aow"}
      onTogglePlacing={() => togglePlacing("aow")}
    />
  );

  const routeTools = (
    <Group
      gap={8}
      p={12}
      pb={10}
      wrap="wrap"
      style={{ borderBottom: "2px solid var(--w-edge)" }}
    >
      <Button
        size="xs"
        variant={placing === "waypoint" ? "filled" : "default"}
        leftSection={<IconMapPin size={14} />}
        onClick={() => togglePlacing("waypoint")}
      >
        {placing === "waypoint" ? "Cancel" : "Waypoint"}
      </Button>
      <Button
        size="xs"
        variant={placing === "note" ? "filled" : "default"}
        leftSection={<IconNote size={14} />}
        onClick={() => togglePlacing("note")}
      >
        {placing === "note" ? "Cancel" : "Note"}
      </Button>
      {route.steps.length > 0 && (
        <Button
          size="xs"
          variant="default"
          onClick={() =>
            setExpanded(
              allOpen ? new Set() : new Set(route.steps.map((s) => s.id)),
            )
          }
        >
          {allOpen ? "Collapse" : "Expand"}
        </Button>
      )}
      <Button
        size="xs"
        variant="default"
        leftSection={<IconRestore size={14} />}
        disabled={!route.steps.length && !route.mapNotes.length}
        onClick={() =>
          confirm("Clear all stops and map notes?") &&
          patch({ steps: [], mapNotes: [] })
        }
      >
        Clear
      </Button>
    </Group>
  );

  const stopList = (
    <CreepRoute
      map={map}
      route={route}
      onStepsChange={(steps) => patch({ steps })}
      activeStepId={activeStep}
      onActiveStep={setActiveStep}
      expanded={expanded}
      onExpandedChange={setExpanded}
      readOnly={readOnly}
    />
  );

  const routeWindow = (
    <Win
      title="Route"
      tone="accent"
      right={<span>{route.steps.length} stops</span>}
      style={{ alignSelf: "start" }}
    >
      {routeTools}
      {stopList}
      <Text
        size="xs"
        c="dimmed"
        px={12}
        py={10}
        style={{ borderTop: "2px solid var(--w-edge)" }}
      >
        XP is what the hero earns at its level at that moment. A boxed group
        dies in any order.
      </Text>
    </Win>
  );

  const setupWindow = <HeroMatchup route={route} onChange={patch} />;

  const detailsWindow = (
    <Win title="Description & tags" tone="white">
      <SimpleGrid
        cols={{ base: 1, md: 2 }}
        spacing="lg"
        p={{ base: "sm", sm: "md" }}
      >
        <Textarea
          label="Description"
          placeholder="What this route is for, timings, what to scout…"
          autosize
          minRows={2}
          maxRows={10}
          value={route.notes}
          onChange={(e) => patch({ notes: e.currentTarget.value })}
        />
        <TagsInput
          label="Tags"
          placeholder="fast level 3, tower rush… (Enter to add)"
          value={route.tags}
          onChange={(tags) => patch({ tags })}
        />
      </SimpleGrid>
    </Win>
  );

  const buildPicker = (
    <Group gap="xs" wrap="nowrap">
      <Select
        style={{ flex: 1 }}
        placeholder="No companion build"
        clearable
        searchable
        aria-label="Companion build"
        value={route.buildId}
        onChange={(buildId) => patch({ buildId })}
        data={allBuilds.map((b) => ({
          value: b.id,
          label: `${b.name}${b.race ? ` · ${RACE_LABEL[b.race]}` : ""}`,
        }))}
        nothingFoundMessage="No builds yet"
      />
      <Button
        variant="default"
        leftSection={<IconPlus size={14} />}
        onClick={() => {
          const b = createBuild({
            name: `${route.name} build`,
            race: route.race,
            vs: route.vs,
          });
          patch({ buildId: b.id });
        }}
      >
        New
      </Button>
    </Group>
  );

  const buildSection = (
    <Win
      title="Companion build"
      tone="white"
      right={
        build ? (
          <Anchor
            href={href.build(build.id)}
            size="sm"
            fw={800}
            c="var(--w-ink)"
          >
            <Group gap={4}>
              Open build <IconExternalLink size={14} />
            </Group>
          </Anchor>
        ) : undefined
      }
    >
      <Stack gap="sm" p="md">
        {buildPicker}
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
            {usedBy > 1 && (
              <Text size="sm" fw={800} c="orange.9">
                This build is shared by {usedBy} routes. Edits here change it
                everywhere.
              </Text>
            )}
            <BuildOrder
              steps={build.steps}
              onChange={(steps) => builds.update(build.id, { steps })}
            />
          </>
        ) : (
          <Text size="sm" c="dimmed">
            Pick an existing build above, or create one for this route.
          </Text>
        )}
      </Stack>
    </Win>
  );

  // ---------- view mode ----------
  if (readOnly)
    return (
      <RouteViewer
        route={route}
        build={build}
        actions={actions}
        buildHref={build ? href.build(build.id) : undefined}
      />
    );

  const header = (
    <Group justify="space-between" align="flex-end" wrap="wrap" gap="sm">
      <Stack gap={8} style={{ flex: 1, minWidth: isPhone ? 0 : 240 }}>
        <Group gap={6} wrap="nowrap" align="center">
          <Group
            gap={6}
            wrap="nowrap"
            className={chips.chipRow}
            style={{ flex: 1 }}
          >
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
            {route.hero && <span className={chips.chip}>{route.hero}</span>}
          </Group>
          {isPhone && <span style={{ flex: "none" }}>{actions}</span>}
        </Group>
        <Textarea
          variant="unstyled"
          autosize
          minRows={1}
          value={route.name}
          placeholder="Name this route"
          onChange={(e) =>
            patch({ name: e.currentTarget.value.replace(/\n/g, " ") })
          }
          classNames={{ input: chips.nameInput }}
          aria-label="Route name"
        />
      </Stack>
      {!isPhone && actions}
    </Group>
  );

  // ---------- edit mode, phone: the map owns the screen, stops open as one sheet ----------
  if (isPhone)
    return (
      <Stack gap="md" px="xs" pb={96}>
        {header}
        {setupWindow}
        <LevelBar map={map} route={route} compact />
        <Win title={`Map · ${map.name}`} tone="sky" bodyStyle={{ padding: 6 }}>
          {mapCanvas}
          <Text size="sm" fw={700} c="dimmed" mt={8}>
            {hint}
          </Text>
        </Win>
        {aowEditor}
        {buildSection}
        {detailsWindow}

        <nav className={chips.dock} aria-label="Route tools">
          <Button
            variant="filled"
            leftSection={<IconListNumbers size={16} />}
            onClick={() => setSheet(true)}
            style={{ flex: 1.4 }}
          >
            Stops {route.steps.length}
          </Button>
          <Button
            variant={placing === "waypoint" ? "filled" : "default"}
            onClick={() => togglePlacing("waypoint")}
            aria-label="Add a waypoint"
            px={10}
          >
            <IconMapPin size={18} />
          </Button>
          {showAow && (
            <Button
              variant={placing === "aow" ? "filled" : "default"}
              onClick={() => togglePlacing("aow")}
              aria-label="Draw the Ancient of War path"
              px={10}
            >
              AoW
            </Button>
          )}
          <Button
            variant={placing === "note" ? "filled" : "default"}
            onClick={() => togglePlacing("note")}
            aria-label="Add a note"
            px={10}
          >
            <IconNote size={18} />
          </Button>
          <Button
            variant="default"
            disabled={!history.current.length}
            onClick={undo}
            aria-label="Undo"
            px={10}
          >
            <IconArrowBackUp size={18} />
          </Button>
        </nav>

        <Drawer
          opened={sheet}
          onClose={() => setSheet(false)}
          position="bottom"
          size="92%"
          title={
            <span
              style={{
                fontFamily: "var(--w-display)",
                fontSize: 15,
                fontWeight: 700,
              }}
            >
              Route · {route.steps.length} stops
            </span>
          }
          styles={{
            body: { padding: 0 },
            header: {
              borderBottom: "2px solid var(--w-edge)",
              background: "var(--w-accent)",
            },
          }}
        >
          {routeTools}
          {stopList}
        </Drawer>
      </Stack>
    );

  // ---------- edit mode, desktop ----------
  return (
    <Stack gap="lg" px={{ base: "xs", sm: 0 }}>
      {header}
      {setupWindow}
      <div className={chips.split}>
        <Stack gap="md">
          <Win
            title={`Map · ${map.name}`}
            tone="sky"
            bodyStyle={{ padding: 12 }}
          >
            {mapCanvas}
            <Text size="sm" fw={700} c="dimmed" mt={8}>
              {hint}
            </Text>
          </Win>
          {aowEditor}
        </Stack>
        <Stack gap="md">
          <LevelBar map={map} route={route} />
          {routeWindow}
        </Stack>
      </div>
      {buildSection}
      {detailsWindow}
    </Stack>
  );
}
