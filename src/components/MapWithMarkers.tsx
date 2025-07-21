import React, { useState } from 'react';
import { Center, Loader, Popover, Group, Text, Divider, Image, Stack, Box, Grid } from '@mantine/core';
import { useMapData } from '../hooks/useMapData';
import './Map.css';

interface Unit {
  name: string;
  count?: number;
  level: number;
  xp: number;
  loot?: { level: number; type: string; items: string[] };
}
interface Camp {
  id: string;
  position: { x: number; y: number };
  units: Unit[];
}

export function MapWithMarkers({ mapSlug }: { mapSlug: string }) {
  const data = useMapData(mapSlug);
  const slug = mapSlug.toLowerCase().replace(/\s+/g, '_');
  const imgUrl = `/maps/${slug}.png`;

  const [selectedUnits, setSelectedUnits] = useState<Record<string, Set<number>>>({});

  if (!data) {
    return (
      <Center style={{ width: '100%', paddingTop: 16 }}>
        <Loader />
      </Center>
    );
  }

  const {
    dimensions: { width: W, height: H },
    camps,
  }: { dimensions: { width: number; height: number }; camps: Camp[] } = data;

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    paddingTop: `${(H / W) * 100}%`,
    overflow: 'hidden',
  };
  const imgStyle: React.CSSProperties = {
    position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain',
  };

  const getMarkerClass = (campId: string) => {
    if (campId.startsWith('green')) return 'circle';
    if (campId.startsWith('orange')) return 'circle_orange';
    if (campId.startsWith('red')) return 'circle_red';
    return 'circle'; // default to green
  };

  const getCampTitle = (campId: string) => {
    const instances = camps.find(c => c.id === campId)?.units.flatMap(u => Array(u.count || 1).fill(u)) || [];
    const difficulty = campId.startsWith('green') ? 'Easy' : campId.startsWith('orange') ? 'Medium' : 'Hard';
    const strongestUnit = instances.reduce((max, unit) => unit.level > max.level ? unit : max, instances[0]);
    return `${difficulty} Creep Spot [${strongestUnit?.level || 1}]`;
  };

  const handleMarkerClick = (camp: Camp) => {
    const instances = camp.units.flatMap(u => Array(u.count || 1).fill(u));
    setSelectedUnits(prev => ({ ...prev, [camp.id]: new Set(instances.map((_, i) => i)) }));
  };

  return (
    <div style={containerStyle}>
      <img src={imgUrl} alt={mapSlug} style={imgStyle} onError={() => console.error('Failed to load map image')} />

      {camps.map(camp => {
        const leftPct = (camp.position.x / W) * 100;
        const topPct = (camp.position.y / H) * 100;
        const instances = camp.units.flatMap(u => Array(u.count || 1).fill(u));
        const selectedSet = selectedUnits[camp.id] || new Set<number>();
        
        // Group selected items by type
        const selectedItems = Array.from(selectedSet)
          .map(i => instances[i].loot?.items || [])
          .flat();
        
        const customItems = selectedItems.filter((_, i, arr) => 
          instances[Array.from(selectedSet)[Math.floor(i / (arr.length / Array.from(selectedSet).length)) || 0]]?.loot?.type === 'custom'
        );
        const powerUpItems = selectedItems.filter((_, i, arr) => 
          instances[Array.from(selectedSet)[Math.floor(i / (arr.length / Array.from(selectedSet).length)) || 0]]?.loot?.type === 'Power Up'
        );

        return (
          <Popover
            key={camp.id}
            position="top"
            withArrow
            shadow="xl"
          >
            <Popover.Target>
              <div
                onClick={() => handleMarkerClick(camp)}
                className={getMarkerClass(camp.id)}
                style={{
                  position: 'absolute',
                  top: `${topPct}%`,
                  left: `${leftPct}%`,
                  transform: 'translate(-50%, -50%)',
                  cursor: 'pointer',
                }}
              />
            </Popover.Target>

            <Popover.Dropdown 
              style={{ 
                width: 500, 
                backgroundColor: '#2C2E33',
                color: '#C1C2C5',
                border: '1px solid #373A40',
                padding: 0
              }}
            >
              <Box p="sm">
                {/* Header */}
                <Text size="lg" fw={600} mb="sm" style={{ color: '#C1C2C5' }}>
                  {getCampTitle(camp.id)}
                </Text>
                
                {/* Creeps Section */}
                <Text size="sm" fw={500} mb="xs" style={{ color: '#909296' }}>
                  Creeps
                </Text>
                
                <Grid gutter="xs" mb="sm">
                  <Grid.Col span={6}>
                    <Text size="xs" fw={500} style={{ color: '#909296' }}>Unit</Text>
                  </Grid.Col>
                  <Grid.Col span={2}>
                    <Text size="xs" fw={500} style={{ color: '#909296' }}>Count</Text>
                  </Grid.Col>
                  <Grid.Col span={2}>
                    <Text size="xs" fw={500} style={{ color: '#909296' }}>Level</Text>
                  </Grid.Col>
                  <Grid.Col span={2}>
                    <Text size="xs" fw={500} style={{ color: '#909296' }}>XP</Text>
                  </Grid.Col>
                </Grid>

                {camp.units.map((unit, unitIdx) => (
                  <Grid key={unitIdx} gutter="xs" mb="xs" align="center">
                    <Grid.Col span={6}>
                      <Group gap="xs">
                        <Image
                          src="/icons/blankskill.png"
                          width={20}
                          height={20}
                          fit="contain"
                          alt={unit.name}
                        />
                        <Text size="xs" style={{ color: '#C1C2C5' }}>
                          {unit.name}
                          {unit.loot && <span style={{ color: '#FA5252' }}> ●</span>}
                        </Text>
                      </Group>
                    </Grid.Col>
                    <Grid.Col span={2}>
                      <Text size="xs" style={{ color: '#C1C2C5' }}>{unit.count || 1}</Text>
                    </Grid.Col>
                    <Grid.Col span={2}>
                      <Text size="xs" style={{ color: '#C1C2C5' }}>{unit.level}</Text>
                    </Grid.Col>
                    <Grid.Col span={2}>
                      <Text size="xs" style={{ color: '#C1C2C5' }}>{unit.xp}</Text>
                    </Grid.Col>
                  </Grid>
                ))}
                
                <Divider my="sm" color="#373A40" />
                
                {/* Items Section */}
                <Text size="sm" fw={500} mb="xs" style={{ color: '#909296' }}>
                  Items
                </Text>
                
                {customItems.length > 0 && (
                  <Stack gap="xs" mb="sm">
                    <Group gap="xs">
                      <Box
                        w={20}
                        h={20}
                        style={{
                          backgroundColor: '#5C7CFA',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text size="xs" fw={600} style={{ color: 'white' }}>◆</Text>
                      </Box>
                      <Text size="xs" fw={500} style={{ color: '#5C7CFA' }}>Custom drop</Text>
                    </Group>
                    <Group gap="xs" pl="md">
                      {Array.from(new Set(customItems.slice(0, 3))).map((item, idx) => (
                        <Image
                          key={idx}
                          src={`/icons/BTNPotionPurple.png`}
                          width={24}
                          height={24}
                          fit="contain"
                          alt={item}
                        />
                      ))}
                    </Group>
                  </Stack>
                )}
                
                {powerUpItems.length > 0 && (
                  <Stack gap="xs">
                    <Group gap="xs">
                      <Box
                        w={20}
                        h={20}
                        style={{
                          backgroundColor: '#FA5252',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text size="xs" fw={600} style={{ color: 'white' }}>◆</Text>
                      </Box>
                      <Text size="xs" fw={500} style={{ color: '#FA5252' }}>Level 1, Power Up</Text>
                    </Group>
                    <Group gap="xs" pl="md">
                      {Array.from(new Set(powerUpItems.slice(0, 4))).map((item, idx) => (
                        <Image
                          key={idx}
                          src={`/icons/BTNPotionPurple.png`}
                          width={24}
                          height={24}
                          fit="contain"
                          alt={item}
                        />
                      ))}
                    </Group>
                  </Stack>
                )}
              </Box>
            </Popover.Dropdown>
          </Popover>
        );
      })}
    </div>
  );
}
export default MapWithMarkers;