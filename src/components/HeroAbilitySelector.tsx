import React, { useState, useEffect } from 'react';
import {
  Card,
  Text,
  Group,
  ActionIcon,
  Image,
  Button,
  Popover,
  SimpleGrid,
} from '@mantine/core';
import heroAbilities from '../data/heroAbilities.json';
import type { HeroAbilitiesMap } from '../types';

interface AbilityOrderSelectorProps {
  hero: string;
  onChange?: (order: string[]) => void;
}

export default function AbilityOrderSelector({ hero, onChange }: AbilityOrderSelectorProps) {
  const abilities: { name: string; icon: string }[] =
    (heroAbilities as HeroAbilitiesMap)[hero] || [];

  // Track the chosen ability name for each of the 6 slots
  const [order, setOrder] = useState<string[]>(Array(6).fill(''));
  // Track which slot’s popover is open
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Reset order to blanks when hero changes
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
    <Card shadow="sm" padding="sm">

      <Group align="flex-end">
        {order.map((selected, idx) => {
          // find icon filename for selected or show blank
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

      <Group mt="md" position="right">
        <Button size="xs" variant="outline" onClick={() => console.log(order)}>
          Save Order
        </Button>
      </Group>
    </Card>
  );
}