import React, { useState, useEffect } from 'react';
import {
  Card,
  Group,
  ActionIcon,
  Image,
  Popover,
  SimpleGrid,
} from '@mantine/core';
import heroAbilities from '../data/heroAbilities.json';


interface AbilityOrderSelectorProps {
  hero: string;
  onChange?: (order: string[]) => void;
}

export default function AbilityOrderSelector({ hero, onChange }: AbilityOrderSelectorProps) {
  const abilitiesMap = heroAbilities as Record<string, { name: string; icon: string }[]>;
  const abilities = abilitiesMap[hero] || [];
  const [order, setOrder] = useState<string[]>(Array(6).fill(''));
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    setOrder(Array(6).fill(''));
    setOpenIndex(null);
  }, [hero]);

  const handleSelect = (idx: number, abilityName: string) => {
    const newOrder = [...order];
    newOrder[idx] = abilityName;
    setOrder(newOrder);
    onChange?.(newOrder);
    setOpenIndex(null);
  };

  return (
    <Card shadow="sm" padding="none">

      <Group style={{display: 'flex', flexWrap: 'nowrap', margin: 0}} mb="md">
        {order.map((selected, idx) => {
          const iconName = selected
            ? abilities.find((a) => a.name === selected)?.icon
            : 'blankskill.png';

          return (
            <Popover
              key={idx}
              width={200}
              position="bottom"
              withArrow
              opened={openIndex === idx}
              onClose={() => setOpenIndex(null)}
            >
              <Popover.Target>
                <ActionIcon
                  size="lg"
                  variant="light"
                  radius="md"
                  onClick={() => setOpenIndex(idx)}
                >
                  <Image
                    src={`/icons/${iconName}`}
                    width={40}
                    height={40}
                    alt={selected || 'blank'}
                  />
                </ActionIcon>
              </Popover.Target>

              <Popover.Dropdown>
                <SimpleGrid cols={4} spacing="xs">
                  {abilities.map((ability) => (
                    <ActionIcon
                      key={ability.name}
                      variant="subtle"
                      radius="md"
                      size="lg"
                      onClick={() => handleSelect(idx, ability.name)}
                    >
                      <Image
                        src={`/icons/${ability.icon}`}
                        width={32}
                        height={32}
                        alt={ability.name}
                      />
                    </ActionIcon>
                  ))}
                </SimpleGrid>
              </Popover.Dropdown>
            </Popover>
          );
        })}
      </Group>


    </Card>
  );
}