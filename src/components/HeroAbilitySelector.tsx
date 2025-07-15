import React, { useState } from 'react';
import { Group, NativeSelect, Button, Image, Card, Text } from '@mantine/core';
import heroAbilities from '../data/heroAbilities.json';
import type { HeroAbilitiesMap } from '../types';

interface AbilityOrderSelectorProps {
  hero: string;
  onChange?: (order: string[]) => void;
}

export default function AbilityOrderSelector({ hero, onChange }: AbilityOrderSelectorProps) {
  // Retrieve the list of ability names for the selected hero
  const abilities: { name: string; icon: string }[] = (heroAbilities as HeroAbilitiesMap)[hero] || [];
  const abilityNames = abilities.map((a) => a.name);

  // State: array of 6 selected ability names
  const [order, setOrder] = useState<string[]>(
    Array(6).fill(abilities[0]?.name || '')
  );

  const handleSelectChange = (index: number, value: string) => {
    const newOrder = [...order];
    newOrder[index] = value;
    setOrder(newOrder);
    onChange?.(newOrder);
  };

  return (
    <Card shadow="sm" padding="sm">
      <Text  size="sm" mb="xs">
        Ability Order
      </Text>
      <Group align="flex-end">
        {order.map((selected, idx) => (
          <NativeSelect
            key={idx}
            label={`L${idx + 1}`}
            data={abilityNames}
            value={selected}
            onChange={(e) => handleSelectChange(idx, e.currentTarget.value)}
          />
        ))}
      </Group>
      <Group  mt="md">
        <Button size="xs" variant="outline" onClick={() => console.log(order)}>
          Save Order
        </Button>
      </Group>
    </Card>
  );
}