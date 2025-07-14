import { Card, Progress, Text } from '@mantine/core';

export default function ProgressCard() {
  return (
    <Card withBorder radius="md" padding="xl" bg="var(--mantine-color-body)">
      <Text fz="xs" tt="uppercase" fw={700} c="dimmed">
        Hero Experience
      </Text>
      <Text fz="lg" fw={500}>
        50 / 100
      </Text>
      <Progress value={54.31} mt="md" size="lg" radius="xl" />
    </Card>
  );
}