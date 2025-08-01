import React, { useState, useEffect, useMemo } from 'react';
import { Center, Loader, Popover, Group, Text, Divider, Image, Box, Grid, SimpleGrid, Button } from '@mantine/core';
import { useMapData } from '../hooks/useMapData';
import { StickyNote } from './StickyNote';
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

interface StickyNoteData {
  id: string;
  x: number;
  y: number;
  text: string;
}

export interface MapWithMarkersProps {
  mapSlug: string;
  onUnitsSelected?: (totalXP: number) => void;
  onCampsSelected?: (selectedCamps: Array<{campId: string, campOrder: number, items: Array<{name: string, icon: string, type: string, level: number}>}>) => void;
  resetRef?: React.MutableRefObject<(() => void) | null>;
  stickyNotes?: StickyNoteData[];
  notePlacementMode?: boolean;
  onNoteAdd?: (x: number, y: number) => void;
  onNoteUpdate?: (id: string, text: string) => void;
  onNoteDelete?: (id: string) => void;
}

export function MapWithMarkers({ 
  mapSlug, 
  onUnitsSelected, 
  onCampsSelected, 
  resetRef,
  stickyNotes = [],
  notePlacementMode = false,
  onNoteAdd,
  onNoteUpdate,
  onNoteDelete
}: MapWithMarkersProps) {
  const data = useMapData(mapSlug);
  const slug = mapSlug.toLowerCase().replace(/\s+/g, '_');
  const imgUrl = `/maps/${slug}.png`;

  const [selectedUnits, setSelectedUnits] = useState<Record<string, Set<string>>>({});
  const [hoveredCamp, setHoveredCamp] = useState<string | null>(null);
  const [campOrder, setCampOrder] = useState<string[]>([]);
  const [selectedBuildings, setSelectedBuildings] = useState<Record<string, Set<string>>>({});
  const [militiaNumbers, setMilitiaNumbers] = useState<Record<string, number>>({});
  const [militiaPopupOpen, setMilitiaPopupOpen] = useState<string | null>(null);

  const handleReset = () => {
    setSelectedUnits({});
    setCampOrder([]);
    setSelectedBuildings({});
    setMilitiaNumbers({});
    setMilitiaPopupOpen(null);
    setHoveredCamp(null);
  };

  useEffect(() => {
    if (resetRef) {
      resetRef.current = handleReset;
    }
  }, [resetRef]);

  const levelToRawXP: Record<number, number> = useMemo(() => ({
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
  }), []);

  useEffect(() => {
    if (!data || !onUnitsSelected) return;

    let totalXP = 0;
    Object.entries(selectedUnits).forEach(([campId, unitIds]) => {
      const camp = data.camps.find(c => c.id === campId);
      if (camp) {
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
            const rawXP = levelToRawXP[unit.level] || 0;
            totalXP += rawXP;
          }
        });
      }
    });

    onUnitsSelected(totalXP);
  }, [selectedUnits, data, onUnitsSelected, levelToRawXP]);

  useEffect(() => {
    if (!data || !onCampsSelected) return;

    const selectedCampsData = campOrder.map((campId, index) => {
      const camp = data.camps.find(c => c.id === campId);
      if (!camp) return null;

      const items: Array<{name: string, icon: string, type: string, level: number}> = [];
      
      camp.units.forEach(unit => {
        if (unit.loot) {
          unit.loot.items.forEach(itemName => {
            items.push({
              name: itemName,
              icon: itemName.toLowerCase().replace(/[^a-z0-9]/g, ''),
              type: unit.loot!.type,
              level: unit.loot!.level
            });
          });
        }
      });

      return {
        campId,
        campOrder: index + 1,
        items
      };
    }).filter((camp): camp is {campId: string, campOrder: number, items: Array<{name: string, icon: string, type: string, level: number}>} => camp !== null);

    onCampsSelected(selectedCampsData);
  }, [campOrder, data, onCampsSelected]);

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
    const iconName = unitName.toLowerCase().replace(/[^a-z0-9]/g, '');
    return `/icons/${iconName}.png`;
  };

  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!notePlacementMode || !onNoteAdd) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    
    onNoteAdd(x, y);
  };

  return (
    <div 
      style={{
        ...containerStyle,
        cursor: notePlacementMode ? 'crosshair' : 'default',
      }}
      onClick={handleMapClick}
    >
      <img src={imgUrl} alt={mapSlug} style={imgStyle} onError={() => console.error('Failed to load map image')} />

      {camps.map(camp => {
        const leftPct = (camp.position.x / W) * 100;
        const topPct = (camp.position.y / H) * 100;
        
        const expandedUnits = camp.units.flatMap((unit, unitIdx) => 
          Array.from({ length: unit.count || 1 }, (_, instanceIdx) => ({
            ...unit,
            uniqueId: `${unitIdx}-${instanceIdx}`,
            instanceIndex: instanceIdx
          }))
        );

        const unitsWithLoot = camp.units.filter(u => u.loot);
        const customItems = unitsWithLoot.filter(u => u.loot?.type === 'custom').flatMap(u => u.loot?.items || []);
        const powerUpItems = unitsWithLoot.filter(u => u.loot?.type === 'Power Up').flatMap(u => u.loot?.items || []);

        const handleUnitToggle = (unitId: string) => {
          setSelectedUnits(prev => {
            const campSet = new Set(prev[camp.id] || []);
            const wasSelected = campSet.has(unitId);
            
            if (wasSelected) {
              campSet.delete(unitId);
            } else {
              campSet.add(unitId);
            }
            
            if (!wasSelected && campSet.size === 1) {
              setCampOrder(prevOrder => {
                if (!prevOrder.includes(camp.id)) {
                  return [...prevOrder, camp.id];
                }
                return prevOrder;
              });
            } else if (wasSelected && campSet.size === 0) {
              setCampOrder(prevOrder => prevOrder.filter(id => id !== camp.id));
            }
            
            return { ...prev, [camp.id]: campSet };
          });
        };

        const handleMouseEnter = () => {
          setHoveredCamp(camp.id);
        };

        const handleMouseLeave = () => {
          setHoveredCamp(null);
        };

        const handleDropdownMouseEnter = () => {
          setHoveredCamp(camp.id);
        };

        const handleDropdownMouseLeave = () => {
          setHoveredCamp(null);
        };

        const handleCampClick = (event: React.MouseEvent) => {
          if (notePlacementMode) {
            event.stopPropagation();
            return;
          }

          if (!campOrder.includes(camp.id)) {
            const newOrder = [...campOrder, camp.id];
            setCampOrder(newOrder);
            
            const allUnitIds = expandedUnits.map(unit => unit.uniqueId);
            setSelectedUnits(prev => ({
              ...prev,
              [camp.id]: new Set(allUnitIds)
            }));
          } else {
            const newOrder = campOrder.filter(id => id !== camp.id);
            setCampOrder(newOrder);
            
            setSelectedUnits(prev => {
              const newSelected = { ...prev };
              delete newSelected[camp.id];
              return newSelected;
            });
            
            setSelectedBuildings(prev => {
              const newBuildings = { ...prev };
              delete newBuildings[camp.id];
              return newBuildings;
            });
            
            setMilitiaNumbers(prev => {
              const newNumbers = { ...prev };
              delete newNumbers[camp.id];
              return newNumbers;
            });
          }
        };

        const handleBuildingToggle = (buildingType: string) => {
          if (buildingType === 'militia') {
            if (!selectedBuildings[camp.id]?.has('militia')) {
              setMilitiaPopupOpen(camp.id);
            } else {
              setSelectedBuildings(prev => {
                const campBuildings = new Set(prev[camp.id] || []);
                campBuildings.delete('militia');
                return { ...prev, [camp.id]: campBuildings };
              });
              setMilitiaNumbers(prev => {
                const newNumbers = { ...prev };
                delete newNumbers[camp.id];
                return newNumbers;
              });
              setHoveredCamp(null);
            }
          } else {
            setSelectedBuildings(prev => {
              const campBuildings = new Set(prev[camp.id] || []);
              if (campBuildings.has(buildingType)) {
                campBuildings.delete(buildingType);
              } else {
                campBuildings.add(buildingType);
              }
              return { ...prev, [camp.id]: campBuildings };
            });
            setHoveredCamp(null);
          }
        };

        const handleMilitiaNumberSelect = (number: number) => {
          setSelectedBuildings(prev => {
            const campBuildings = new Set(prev[camp.id] || []);
            campBuildings.add('militia');
            return { ...prev, [camp.id]: campBuildings };
          });
          
          setMilitiaNumbers(prev => ({
            ...prev,
            [camp.id]: number
          }));
          
          setMilitiaPopupOpen(null);
          setHoveredCamp(null);
        };

        const isOpen = hoveredCamp === camp.id;
        const campIndex = campOrder.indexOf(camp.id);
        const hasSelectedUnits = selectedUnits[camp.id] && selectedUnits[camp.id].size > 0;
        const isSelected = campIndex !== -1 || hasSelectedUnits;


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
                
                <Divider my="xs" color="#373A40" />
                
                <Text size="sm" fw={500} mb="xs" style={{ color: '#909296' }}>
                  Buildings
                </Text>
                
                <Group gap="xs" mb="xs">
                  <div
                    onClick={() => handleBuildingToggle('ancientofwar')}
                    style={{
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: '4px',
                      backgroundColor: selectedBuildings[camp.id]?.has('ancientofwar') ? '#373A40' : 'transparent',
                      border: selectedBuildings[camp.id]?.has('ancientofwar') ? '1px solid #FFD700' : '1px solid transparent',
                    }}
                  >
                    <Image
                      src="/icons/ancientofwar.png"
                      width={32}
                      height={32}
                      fit="contain"
                      alt="Ancient of War"
                    />
                  </div>
                  
                  <Popover
                    position="bottom"
                    withArrow
                    opened={militiaPopupOpen === camp.id}
                    onClose={() => setMilitiaPopupOpen(null)}
                  >
                    <Popover.Target>
                      <div
                        onClick={() => handleBuildingToggle('militia')}
                        style={{
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '4px',
                          backgroundColor: selectedBuildings[camp.id]?.has('militia') ? '#373A40' : 'transparent',
                          border: selectedBuildings[camp.id]?.has('militia') ? '1px solid #FFD700' : '1px solid transparent',
                          position: 'relative',
                        }}
                      >
                        <Image
                          src="/icons/militia.png"
                          width={32}
                          height={32}
                          fit="contain"
                          alt="Militia"
                        />
                        {militiaNumbers[camp.id] && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '-2px',
                              right: '-2px',
                              backgroundColor: '#FFD700',
                              color: '#000',
                              borderRadius: '50%',
                              width: '16px',
                              height: '16px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '10px',
                              fontWeight: 'bold',
                            }}
                          >
                            {militiaNumbers[camp.id]}
                          </div>
                        )}
                      </div>
                    </Popover.Target>
                    <Popover.Dropdown>
                      <Text size="sm" fw={500} mb="xs">Select Militia Number:</Text>
                      <SimpleGrid cols={4} spacing="xs">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((number) => (
                          <Button
                            key={number}
                            size="xs"
                            variant="light"
                            onClick={() => handleMilitiaNumberSelect(number)}
                          >
                            {number}
                          </Button>
                        ))}
                      </SimpleGrid>
                    </Popover.Dropdown>
                  </Popover>
                </Group>
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
      
      {/* Render building icons separately */}
      {camps.map(camp => {
        const leftPct = (camp.position.x / W) * 100;
        const topPct = (camp.position.y / H) * 100;
        const campBuildings = selectedBuildings[camp.id] || new Set();
        
        return Array.from(campBuildings).map((buildingType, index) => (
          <div
            key={`building-${camp.id}-${buildingType}`}
            style={{
              position: 'absolute',
              top: `${topPct + 0.5}%`,
              left: `${leftPct + 0.5 + (index * 2)}%`,
              transform: 'translate(0, 0)',
              width: '30px',
              height: '30px',
              zIndex: 10,
              pointerEvents: 'none',
            }}
          >
            <Image
              src={`/icons/${buildingType}.png`}
              width={30}
              height={30}
              fit="contain"
              alt={buildingType}
            />
            {buildingType === 'militia' && militiaNumbers[camp.id] && (
              <div
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  backgroundColor: '#FFD700',
                  color: '#000',
                  borderRadius: '50%',
                  width: '16px',
                  height: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: 'bold',
                }}
              >
                {militiaNumbers[camp.id]}
              </div>
            )}
          </div>
        ));
      })}
      
      {/* Render sticky notes */}
      {stickyNotes.map(note => (
        <div
          key={note.id}
          style={{
            position: 'absolute',
            top: `${note.y}%`,
            left: `${note.x}%`,
            transform: 'translate(-50%, -50%)',
            zIndex: 20,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <StickyNote
            id={note.id}
            text={note.text}
            onTextChange={onNoteUpdate || (() => {})}
            onDelete={onNoteDelete || (() => {})}
          />
        </div>
      ))}
    </div>
  );
}