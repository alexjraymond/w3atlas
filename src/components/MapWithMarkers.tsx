import React, { useState, useEffect } from 'react';
import { Center, Loader, Popover, Group, Text, Divider, Image, Box, Grid } from '@mantine/core';
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

interface MapWithMarkersProps {
  mapSlug: string;
  onUnitsSelected?: (totalXP: number) => void;
}

export function MapWithMarkers({ mapSlug, onUnitsSelected }: MapWithMarkersProps) {
  const data = useMapData(mapSlug);
  const slug = mapSlug.toLowerCase().replace(/\s+/g, '_');
  const imgUrl = `/maps/${slug}.png`;

  const [selectedUnits, setSelectedUnits] = useState<Record<string, Set<string>>>({});
  const [hoveredCamp, setHoveredCamp] = useState<string | null>(null);
  const [campOrder, setCampOrder] = useState<string[]>([]);

  // Raw XP values based on unit level
  const levelToRawXP: Record<number, number> = {
    1: 25,
    2: 40,
    3: 60,
    4: 85,
    5: 115,
    6: 150,
    7: 190,
    8: 235,
    9: 285,
    10: 340
  };

  // Calculate total XP from selected units and notify parent
  useEffect(() => {
    if (!data || !onUnitsSelected) return;

    let totalXP = 0;
    Object.entries(selectedUnits).forEach(([campId, unitIds]) => {
      const camp = data.camps.find(c => c.id === campId);
      if (camp) {
        // Expand units by their count for individual selection
        const expandedUnits = camp.units.flatMap((unit, unitIdx) => 
          Array.from({ length: unit.count || 1 }, (_, instanceIdx) => ({
            ...unit,
            uniqueId: `${unitIdx}-${instanceIdx}`,
            instanceIndex: instanceIdx
          }))
        );

        unitIds.forEach(unitId => {
          const unit = expandedUnits.find(u => u.uniqueId === unitId);
          if (unit) {
            // Get raw XP based on unit level
            const rawXP = levelToRawXP[unit.level] || 0;
            totalXP += rawXP;
          }
        });
      }
    });

    onUnitsSelected(totalXP);
  }, [selectedUnits, data, onUnitsSelected]);

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
    return 'circle';
  };

  const getCampTitle = (campId: string) => {
    const instances = camps.find(c => c.id === campId)?.units.flatMap(u => Array(u.count || 1).fill(u)) || [];
    const difficulty = campId.startsWith('green') ? 'Easy' : campId.startsWith('orange') ? 'Medium' : 'Hard';
    const strongestUnit = instances.reduce((max, unit) => unit.level > max.level ? unit : max, instances[0]);
    return `${difficulty} Creep Spot [${strongestUnit?.level || 1}]`;
  };

  const getUnitIconPath = (unitName: string) => {
    // Convert unit name to lowercase and remove spaces/special characters
    const iconName = unitName.toLowerCase().replace(/[^a-z0-9]/g, '');
    return `/icons/${iconName}.png`;
  };



  return (
    <div style={containerStyle}>
      <img src={imgUrl} alt={mapSlug} style={imgStyle} onError={() => console.error('Failed to load map image')} />

      {camps.map(camp => {
        const leftPct = (camp.position.x / W) * 100;
        const topPct = (camp.position.y / H) * 100;
        
        // Expand units by their count for individual selection
        const expandedUnits = camp.units.flatMap((unit, unitIdx) => 
          Array.from({ length: unit.count || 1 }, (_, instanceIdx) => ({
            ...unit,
            uniqueId: `${unitIdx}-${instanceIdx}`,
            instanceIndex: instanceIdx
          }))
        );

        // Get all items from units that have loot
        const unitsWithLoot = camp.units.filter(u => u.loot);
        const customItems = unitsWithLoot.filter(u => u.loot?.type === 'custom').flatMap(u => u.loot?.items || []);
        const powerUpItems = unitsWithLoot.filter(u => u.loot?.type === 'Power Up').flatMap(u => u.loot?.items || []);
        
        console.log(`[ITEMS] Camp ${camp.id} - Custom items:`, customItems);
        console.log(`[ITEMS] Camp ${camp.id} - Power up items:`, powerUpItems);

        const handleUnitToggle = (unitId: string) => {
          setSelectedUnits(prev => {
            const campSet = new Set(prev[camp.id] || []);
            const wasSelected = campSet.has(unitId);
            
            if (wasSelected) {
              campSet.delete(unitId);
            } else {
              campSet.add(unitId);
            }
            
            // Handle order updates
            if (!wasSelected && campSet.size === 1) {
              // First unit being added to this camp
              setCampOrder(prevOrder => {
                if (!prevOrder.includes(camp.id)) {
                  return [...prevOrder, camp.id];
                }
                return prevOrder;
              });
            } else if (wasSelected && campSet.size === 0) {
              // Last unit being removed from this camp
              setCampOrder(prevOrder => prevOrder.filter(id => id !== camp.id));
            }
            
            return { ...prev, [camp.id]: campSet };
          });
        };

        const handleMouseEnter = () => {
          console.log(`[HOVER] Mouse entered camp ${camp.id}`);
          setHoveredCamp(camp.id);
        };

        const handleMouseLeave = () => {
          console.log(`[HOVER] Mouse left camp ${camp.id}`);
          setHoveredCamp(null);
        };

        const handleDropdownMouseEnter = () => {
          console.log(`[HOVER] Mouse entered dropdown for camp ${camp.id}`);
          setHoveredCamp(camp.id);
        };

        const handleDropdownMouseLeave = () => {
          console.log(`[HOVER] Mouse left dropdown for camp ${camp.id}`);
          setHoveredCamp(null);
        };

        const handleCampClick = () => {
          // Add camp to order if not already selected
          if (!campOrder.includes(camp.id)) {
            const newOrder = [...campOrder, camp.id];
            setCampOrder(newOrder);
            
            // Select all units in this camp
            const allUnitIds = expandedUnits.map(unit => unit.uniqueId);
            setSelectedUnits(prev => ({
              ...prev,
              [camp.id]: new Set(allUnitIds)
            }));
          } else {
            // Remove camp from order and deselect all units
            const newOrder = campOrder.filter(id => id !== camp.id);
            setCampOrder(newOrder);
            
            setSelectedUnits(prev => {
              const newSelected = { ...prev };
              delete newSelected[camp.id];
              return newSelected;
            });
          }
        };

        const isOpen = hoveredCamp === camp.id;
        const campIndex = campOrder.indexOf(camp.id);
        const hasSelectedUnits = selectedUnits[camp.id] && selectedUnits[camp.id].size > 0;
        const isSelected = campIndex !== -1 || hasSelectedUnits;
        console.log(`[HOVER] Camp ${camp.id} isOpen: ${isOpen}, hoveredCamp: ${hoveredCamp}`);

        return (
          <Popover
            key={camp.id}
            position="top"
            withArrow
            shadow="xl"
            opened={isOpen}
          >
            <Popover.Target>
              <div
                className={getMarkerClass(camp.id)}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={handleCampClick}
                style={{
                  position: 'absolute',
                  top: `${topPct}%`,
                  left: `${leftPct}%`,
                  transform: 'translate(-50%, -50%)',
                  cursor: 'pointer',
                  border: isSelected ? '2px solid #FFD700' : 'none',
                  borderRadius: '50%',
                }}
              />
            </Popover.Target>

            <Popover.Dropdown 
              onMouseEnter={handleDropdownMouseEnter}
              onMouseLeave={handleDropdownMouseLeave}
              style={{ 
                width: 300, 
                backgroundColor: '#2C2E33',
                color: '#C1C2C5',
                border: '1px solid #373A40',
                padding: 0
              }}
            >
              <Box p="xs">
                <Text size="md" fw={600} mb="xs" style={{ color: '#C1C2C5' }}>
                  {getCampTitle(camp.id)}
                </Text>
                
                <Text size="sm" fw={500} mb="xs" style={{ color: '#909296' }}>
                  Creeps
                </Text>
                
                <Grid gutter="xs" mb="xs">
                  <Grid.Col span={8}>
                    <Text size="xs" fw={500} style={{ color: '#909296' }}>Unit</Text>
                  </Grid.Col>
                  <Grid.Col span={2}>
                    <Text size="xs" fw={500} style={{ color: '#909296' }}>Level</Text>
                  </Grid.Col>
                  <Grid.Col span={2}>
                    <Text size="xs" fw={500} style={{ color: '#909296' }}>XP</Text>
                  </Grid.Col>
                </Grid>

                {expandedUnits.map((unit) => {
                  const isSelected = selectedUnits[camp.id]?.has(unit.uniqueId) || false;
                  return (
                    <Grid 
                      key={unit.uniqueId} 
                      gutter="xs" 
                      mb={4} 
                      align="center"
                      onClick={() => handleUnitToggle(unit.uniqueId)}
                      style={{
                        cursor: 'pointer',
                        backgroundColor: isSelected ? '#373A40' : 'transparent',
                        borderRadius: '4px',
                        padding: '2px 4px',
                      }}
                    >
                      <Grid.Col span={8}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '2px',
                          flexDirection: 'row',
                          flexWrap: 'wrap',
                          maxWidth: '100%',
                          
                        }}>
                          <Image
                            src={getUnitIconPath(unit.name)}
                            width={20}
                            height={20}
                            fit="contain"
                            alt={unit.name}
                            style={{ flexShrink: 0, minWidth: '20px' }}
                            onError={(e) => {
                              const target = e.currentTarget as HTMLImageElement;
                              if (target.src !== '/icons/blankskill.png') {
                                target.src = '/icons/blankskill.png';
                              }
                            }}
                          />
                          <Text 
                            size="xs" 
                            style={{ 
                              color: '#C1C2C5', 
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              minWidth: 0,
                              flex: 1
                            }}
                          >
                            {unit.name}
                            {unit.loot && unit.instanceIndex === 0 && <span style={{ color: '#FA5252' }}> ●</span>}
                          </Text>
                        </div>
                      </Grid.Col>
                      <Grid.Col span={2}>
                        <Text size="xs" style={{ color: '#C1C2C5' }}>{unit.level}</Text>
                      </Grid.Col>
                      <Grid.Col span={2}>
                        <Text size="xs" style={{ color: '#C1C2C5' }}>{levelToRawXP[unit.level] || 0}</Text>
                      </Grid.Col>
                    </Grid>
                  );
                })}
                
                <Divider my="xs" color="#373A40" />
                
                <Text size="sm" fw={500} mb="xs" style={{ color: '#909296' }}>
                  Items
                </Text>
                
                {customItems.length > 0 && (
                  <Box mb="xs">
                    <Group gap="xs" mb="xs">
                      <Box
                        w={16}
                        h={16}
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
                    <Group gap="xs" pl="md" style={{ 
                      border: '1px solid red', 
                      minHeight: '24px',
                      flexWrap: 'wrap',
                      maxWidth: '100%'
                    }}>
                      {Array.from(new Set(customItems.slice(0, 6))).map((item, idx) => {
                        console.log(`[ITEMS] Rendering custom item ${idx}: ${item}`);
                        return (
                          <Image
                            key={idx}
                            src={`/icons/BTNPotionPurple.png`}
                            alt={item}
                            style={{ flexShrink: 0, maxWidth: 20, maxHeight: 20 }}
                          />
                        );
                      })}
                    </Group>
                  </Box>
                )}
                
                {powerUpItems.length > 0 && (
                  <Box>
                    <Group gap="xs" mb="xs">
                      <Box
                        w={16}
                        h={16}
                        style={{
                          backgroundColor: '#FA5252',
                          borderRadius: '50%',
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text size="xs" fw={600} style={{ color: 'white' }}>◆</Text>
                      </Box>
                      <Text size="xs" fw={500} style={{ color: '#FA5252' }}>Level 1, Power Up</Text>
                    </Group>
                    <Group gap="xs" pl="md" style={{ 
                      border: '1px solid blue', 
                      minHeight: '24px',
                      flexWrap: 'nowrap',
                      maxWidth: 400,
                      display: 'flex',
                      flexDirection: 'row',
                      
                    }}>
                      {Array.from(new Set(powerUpItems.slice(0, 6))).map((item, idx) => {
                        console.log(`[ITEMS] Rendering power up item ${idx}: ${item}`);
                        return (
                          <Image
                            key={idx}
                            src={`/icons/BTNPotionPurple.png`}
                            alt={item}
                            style={{ flexShrink: 0, maxWidth: 20, maxHeight: 20 }}
                          />
                        );
                      })}
                    </Group>
                  </Box>
                )}
              </Box>
            </Popover.Dropdown>
          </Popover>
        );
      })}
      
      {/* Render order numbers separately */}
      {camps.map(camp => {
        const leftPct = (camp.position.x / W) * 100;
        const topPct = (camp.position.y / H) * 100;
        const campIndex = campOrder.indexOf(camp.id);
        const hasSelectedUnits = selectedUnits[camp.id] && selectedUnits[camp.id].size > 0;
        const isSelected = campIndex !== -1 || hasSelectedUnits;
        
        if (isSelected) {
          return (
            <div
              key={`order-${camp.id}`}
              style={{
                position: 'absolute',
                top: `${topPct + 2}%`,
                left: `${leftPct}%`,
                transform: 'translate(-50%, 0)',
                backgroundColor: '#FFD700',
                color: '#000',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
                zIndex: 10,
                pointerEvents: 'none',
              }}
            >
              {campIndex + 1}
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}
export default MapWithMarkers;