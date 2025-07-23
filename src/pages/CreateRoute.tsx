import{ useState, useRef } from 'react';
import {
  AppShell,
  Container,
  Card,
  Text,
  TextInput,
  Stack,
  Button,
  Checkbox,
  AspectRatio,
  Image,
  SimpleGrid,
} from '@mantine/core';
import { Navbar } from '../components/Navbar';
import { MapWithMarkers } from '../components/MapWithMarkers';
import HeroAbilitySelector from '../components/HeroAbilitySelector';
import ExperienceBar from '../components/ExperienceBar';

const xpPerLevel = {
  1: 200,
  2: 500,
  3: 900,
  4: 1400,
  5: 2000
}

const xpGainPercentagePerLevel = {
  1: 0.8,
  2: 0.7,
  3: 0.62,
  4: 0.55,
  5: 0.0
}

const heroOptions: Record<string, string[]> = {
  Human: ['Archmage', 'Mountain King', 'Blood Mage', 'Paladin'],
  NightElf: ['Demon Hunter', 'Keeper of the Grove', 'Warden', 'Priestess of the Moon'],
  Orc: ['Blademaster', 'Far Seer', 'Tauren Chieftain', 'Shadow Hunter'],
  Undead: ['Death Knight', 'Lich', 'Dreadlord', 'Crypt Lord'],
};

const raceLabels: Record<string, string> = {
  Human: 'Human',
  NightElf: 'Night Elf',
  Orc: 'Orc',
  Undead: 'Undead',
};

const tavernHeroes: string[] = [
  'Naga Sea Witch',
  'Dark Ranger',
  'Pandaren Brewmaster',
  'Firelord',
  'Pit Lord',
  'Beastmaster',
  'Tinker',
  'Alchemist',
];

export function CreateRoutePage() {
  const [routeName, setRouteName] = useState('New Route');
  const [playerRace, setPlayerRace] = useState<string | null>(null);
  const [hero, setHero] = useState<string | null>(null);
  const [useTavern, setUseTavern] = useState(false);
  const [totalXP, setTotalXP] = useState(0);
  const mapResetRef = useRef<(() => void) | null>(null);

  const races = Object.keys(heroOptions);
  const currentHeroes = useTavern || !playerRace ? tavernHeroes : heroOptions[playerRace!];

  const calculateLevelAndXP = (totalRawXP: number) => {
    let remainingRawXP = totalRawXP;
    let totalEffectiveXP = 0;
    
    for (let level = 1; level <= 5; level++) {
      const xpGainPercentage = xpGainPercentagePerLevel[level as keyof typeof xpGainPercentagePerLevel];
      
      if (xpGainPercentage === 0) {
        break;
      }
      
      const xpNeededForThisLevel = xpPerLevel[level as keyof typeof xpPerLevel];
      const xpNeededForPreviousLevel = level > 1 ? xpPerLevel[(level - 1) as keyof typeof xpPerLevel] : 0;
      const additionalXPNeeded = xpNeededForThisLevel - xpNeededForPreviousLevel;
      
      const rawXPNeededForLevel = additionalXPNeeded / xpGainPercentage;
      
      if (remainingRawXP >= rawXPNeededForLevel) {
        remainingRawXP -= rawXPNeededForLevel;
        totalEffectiveXP += additionalXPNeeded;
      } else {
        const effectiveXPGained = remainingRawXP * xpGainPercentage;
        totalEffectiveXP += effectiveXPGained;
        remainingRawXP = 0;
        break;
      }
    }
    
    let currentLevel = 1;
    for (let level = 1; level <= 5; level++) {
      if (totalEffectiveXP >= xpPerLevel[level as keyof typeof xpPerLevel]) {
        currentLevel = level + 1;
      } else {
        break;
      }
    }
    
    currentLevel = Math.min(currentLevel, 5);
    
    const xpForPreviousLevel = currentLevel > 1 ? xpPerLevel[(currentLevel - 1) as keyof typeof xpPerLevel] : 0;
    const currentXP = totalEffectiveXP - xpForPreviousLevel;
    
    const xpForCurrentLevel = xpPerLevel[currentLevel as keyof typeof xpPerLevel] || 0;
    const xpNeededForNextLevel = xpForCurrentLevel - xpForPreviousLevel;
    
    return {
      currentLevel,
      currentXP,
      xpForNextLevel: xpNeededForNextLevel
    };
  };

  const { currentLevel, currentXP, xpForNextLevel } = calculateLevelAndXP(totalXP);

  const handleUnitsSelected = (xp: number) => {
    setTotalXP(xp);
  };

  return (
    <AppShell padding="md" header={{ height: 60, offset: true }}>
      <AppShell.Header>
        <Navbar />
      </AppShell.Header>
      <AppShell.Main>
        <Container fluid px="md" style={{ display: 'flex', gap: 24 }}>
          <div style={{ width: 320 }}>
            <Card shadow="sm" padding="sm">
              <Stack >
                <div>
                  <Text size="sm" fw={500} mb={4}>
                    Route Name
                  </Text>
                  <TextInput
                    value={routeName}
                    onChange={(e) => setRouteName(e.currentTarget.value)}
                  />
                </div>
                <div>
                  <Text size="sm" fw={500} mb={8}>
                    Select Race
                  </Text>
                  <SimpleGrid cols={2} spacing="sm">
                    {races.map((race) => (
                      <Button
                        key={race}
                        size="xl"
                        fullWidth
                        variant={playerRace === race ? 'filled' : 'outline'}
                        onClick={() => {
                          setPlayerRace(race);
                          setHero(null);
                          setUseTavern(false);
                        }}
                        leftSection={
                          <Image
                            src={`/icons/${race.toLowerCase()}.png`}
                            width={12}
                            height={56}
                            alt={race}
                            style={{marginRight: -10}}
                          />
                        }
                        style={{ minHeight: 80, padding: 0, }}
                        
                      >
                       <Text>{raceLabels[race]}</Text> 
                      </Button>
                    ))}
                  </SimpleGrid>
                </div>
                {playerRace && (
                  <div>
                    <Text size="sm" fw={500} mb={8}>
                      Select Hero
                    </Text>
                    <Checkbox
                      checked={useTavern}
                      onChange={(e) => {
                        setUseTavern(e.currentTarget.checked);
                        setHero(null);
                      }}
                      label="Use Tavern Heroes"
                      mb={12}
                    />
                    <SimpleGrid cols={2} spacing="sm">
                      {currentHeroes.map((h) => (
                        <Card
                          key={h}
                          shadow="xs"
                          radius="md"
                          withBorder
                          onClick={() => setHero(h)}
                          style={{
                            backgroundColor:
                              hero === h ? 'var(--mantine-color-yellow-4)' : undefined,
                            padding: 8,
                            cursor: 'pointer',
                            textAlign: 'center',
                          }}
                        >
                          <Image
                            src={`/icons/${h.toLowerCase().replace(/ /g, '')}.png`}
                            width={64}
                            height={64}
                            fit="contain"
                            alt={h}
                          />
                          <Text size="xs" mt={6} lineClamp={2}>
                            {h}
                          </Text>
                        </Card>
                      ))}
                    </SimpleGrid>
                  </div>
                )}
                {hero && (
                  <div>
                    <Text size="sm" fw={500} mb={8}>
                      Ability Order
                    </Text>
                    <HeroAbilitySelector
                      hero={hero!}
                      onChange={(order) => console.log('Order:', order)}
                      
                    />
                  </div>
                )}



                <Button fullWidth variant="outline" mt={12}>
                  Save Route
                </Button>
                <Button fullWidth variant="outline" mt={12}
                onClick={() => {
                  setTotalXP(0);
                  if (mapResetRef.current) {
                    mapResetRef.current();
                  }
                }}
                >
                  Reset Route
                </Button>
              </Stack>
            </Card>
          </div>


          <div style={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
            <AspectRatio ratio={416 / 512} style={{ width: 500 }}>
              <MapWithMarkers mapSlug="Concealed Hill" onUnitsSelected={handleUnitsSelected} resetRef={mapResetRef} />
            </AspectRatio>
            
                  <div>
                    <ExperienceBar
                      currentXP={currentXP}
                      currentLevel={currentLevel}
                      xpForNextLevel={xpForNextLevel}
                      totalRawXP={totalXP}
                    />
                  </div>
                
          </div>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
