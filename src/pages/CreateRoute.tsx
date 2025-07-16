import { AppShell, AspectRatio, Button, Card, Center, Checkbox, Group, NativeSelect, Text, Image } from "@mantine/core";
import { Navbar } from "../components/Navbar";
import { MapWithMarkers } from "../components/MapWithMarkers";
import { useDisclosure } from "@mantine/hooks";
import ExperienceBar from "../components/ExperienceBar";
import { useState } from "react";
import HeroAbilitySelector from "../components/HeroAbilitySelector";

const heroOptions: Record<string, string[]> = {
  Human: ["Archmage", "Mountain King", "Blood Mage", "Paladin"],
  NightElf: ["Demon Hunter", "Keeper of the Grove", "Warden", "Priestess of the Moon"],
  Orc: ["Blademaster", "Far Seer", "Tauren Chieftain", "Shadow Hunter"],
  Undead: ["Death Knight", "Lich", "Dreadlord", "Crypt Lord"]
};  

const tavernHeroes: string[] = [
  "Naga Sea Witch", "Dark Ranger", "Pandaren Brewmaster", "Firelord", "Pit Lord",  "Beastmaster", "Tinker", "Alchemist"
];


export function CreateRoutePage() {
    const [opened, { toggle }] = useDisclosure();
    const [playerRace, setPlayerRace] = useState("Human");
    const [hero, setHero] = useState(heroOptions[playerRace][0]);
    const [tavernHero, setTavernHero] = useState(false);

    const handleRaceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const race = event.currentTarget.value;
        setPlayerRace(race);
        if (!tavernHero) {
        setHero(heroOptions[race][0]
        )}};

    const handleHeroChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setHero(event.currentTarget.value);
    };

    const handleTavernToggle = (checked: boolean) => {
        setTavernHero(checked);
        setHero(checked ? tavernHeroes[0] : heroOptions[playerRace][0]

        )};

    const heroIcon = heroOptions[playerRace].includes(hero) ? `../../icons/${hero.toLowerCase().replace(/ /g, "")}.png` : "../../icons/default.png";

    const tavernIcon = tavernHero ? `../../icons/${hero.toLowerCase().replace(/ /g, "")}.png` : "../../icons/default.png";

  return (
    <AppShell
    padding={"md"}
    header={{height: 60, offset: true}}
    >
        <AppShell.Header>
 <Navbar />
 </AppShell.Header>
 <AppShell.Main style={{ minHeight: "100vh" }}>
 <Center mx={"auto"}
 style={{ width: "100%",minHeight: "calc(100vh - 60px)" }}>
    <AspectRatio ratio={416/512} mx={"auto"} w={"416px"} >
      <MapWithMarkers mapSlug="Concealed Hill" />
</AspectRatio>
        <Card>
            <Card.Section
style={{ display: "flex", justifyContent: "", alignItems: "center", height: 100, margin: "8px 0" }} 
            >
<Image src={tavernHero ? tavernIcon : heroIcon} alt="Hero Icon" style={{ width: "64px"}} />


          <ExperienceBar />

            </Card.Section>


<HeroAbilitySelector hero={hero} onChange={(order) => console.log("Selected order:", order)} />

        </Card>
        <Group mt="md"
        align="flex-end"
        >
            <NativeSelect 
              value={playerRace}
              onChange={handleRaceChange}
              data={Object.keys(heroOptions)}
              label="Race" />

        <Checkbox
              onChange={(event) => handleTavernToggle(event.currentTarget.checked)}
              label="Use Tavern Heroes?"
            />

            {tavernHero ? (
                <NativeSelect
                  value={hero}
                  onChange={handleHeroChange}
                  data={tavernHeroes}
                  label="Tavern Hero"
                  />
            )
            : (
                <NativeSelect
                  value={hero}
                  onChange={handleHeroChange}
                  data={heroOptions[playerRace]}
                  label="Hero"
                />
            )}
              <Button variant="outline">AoW/Militia/Ghoul</Button>
        </Group>



        </Center>
        </AppShell.Main>
</AppShell>
  );
}
