import { Card, Text, Group, Image, Stack, Tooltip } from '@mantine/core';

interface Item {
  name: string;
  icon: string;
  type: string;
  level: number;
}

interface CampItems {
  campId: string;
  campOrder: number;
  items: Item[];
}

interface ItemsListProps {
  selectedCamps: CampItems[];
}

export default function ItemsList({ selectedCamps }: ItemsListProps) {
  const getItemIconPath = (itemName: string) => {
    const iconName = itemName.toLowerCase().replace(/[^a-z0-9]/g, '');
    return `/icons/${iconName}.png`;
  };

  const getItemDisplayName = (itemName: string) => {
    return itemName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getItemTypeColor = (type: string) => {
    switch (type) {
      case 'permanent':
        return 'blue';
      case 'Power Up':
        return 'green';
      case 'custom':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  return (
    <Card withBorder radius="md" padding="sm" bg="var(--mantine-color-body)" mt="md">
      <Text fz="xs" tt="uppercase" fw={700} c="dimmed" align="center">
        Items
      </Text>
      
      {selectedCamps.length === 0 ? (
        <Text fz="sm" c="dimmed" mt="xs">
          No camps selected
        </Text>
      ) : (
        <Stack gap="md" mt="md">
          {selectedCamps.map((camp) => (
            <div key={camp.campId}>
              <Group gap="xs" mb="xs">
                <Text fz="sm" fw={600} c="dimmed">
                  {camp.campOrder}.
                </Text>
                <Text fz="sm" fw={500}>
                  {camp.campId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Text>
              </Group>
              
              {camp.items.length === 0 ? (
                <Text fz="xs" c="dimmed" ml="lg">
                  No items
                </Text>
              ) : (
                <Stack gap="xs" ml="lg">
                  {Object.entries(
                    camp.items.reduce((acc, item) => {
                      if (!acc[item.type]) {
                        acc[item.type] = [];
                      }
                      acc[item.type].push(item);
                      return acc;
                    }, {} as Record<string, typeof camp.items>)
                  ).map(([type, items]) => (
                    <Group key={type} gap="xs">
                      {items.map((item, index) => (
                        <Tooltip
                          key={`${camp.campId}-${item.name}-${index}`}
                          label={`${getItemDisplayName(item.name)}`}
                          position="top"
                          withArrow
                        >
                          <div style={{ position: 'relative' }}>
                            <Image
                              src={getItemIconPath(item.name)}
                              width={24}
                              height={24}
                              alt={item.name}
                              style={{ cursor: 'pointer' }}
                              onError={(e) => {
                                e.currentTarget.src = '/icons/blankskill.png';
                              }}
                            />
                            <div
                              style={{
                                position: 'absolute',
                                top: -2,
                                right: -2,
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: `var(--mantine-color-${getItemTypeColor(item.type)}-6)`,
                                border: '1px solid white'
                              }}
                            />
                          </div>
                        </Tooltip>
                      ))}
                    </Group>
                  ))}
                </Stack>
              )}
            </div>
          ))}
        </Stack>
      )}
    </Card>
  );
}
