import React from "react";
import { AppShell, Group, Button } from "@mantine/core";
import { Navbar } from "../components/Navbar";
import Map from "../components/Map";


export function CreateRoutePage() {
  return (
    <AppShell>
 <Navbar />
 <Map />
     <Group>
      <Button variant="default">Race</Button>
      <Button variant="default">Hero</Button>
      <Button variant="default">AoW/Militia/Ghoul</Button>
    </Group>
    </AppShell>
  );
}