import { Card, Progress, Text } from '@mantine/core';

interface ExperienceBarProps {
  currentXP: number;
  currentLevel: number;
  xpForNextLevel: number;
  totalRawXP?: number;
}

export default function ExperienceBar({ currentXP, currentLevel, xpForNextLevel, totalRawXP }: ExperienceBarProps) {
  const progressPercentage = xpForNextLevel > 0 ? (currentXP / xpForNextLevel) * 100 : 0;
  
  const getXPGainPercentage = (level: number): number => {
    if (level >= 5) return 0;
    if (level === 4) return 55;
    if (level === 3) return 62;
    if (level === 2) return 70;
    return 80;
  };

  const xpGainPercentage = getXPGainPercentage(currentLevel);
  
  const decimalLevel = currentLevel + (currentXP / xpForNextLevel);
  
  const roundedCurrentXP = Math.round(currentXP * 100) / 100;
  const roundedXpForNextLevel = Math.round(xpForNextLevel * 100) / 100;

  return (
    <Card withBorder radius="md" padding="xl" bg="var(--mantine-color-body)">
      <Text fz="xs" tt="uppercase" fw={700} c="dimmed">
        Experience
      </Text>
      <Text fz="lg" fw={500}>
        Level {decimalLevel.toFixed(2)}
      </Text>
      <Text fz="sm" c="dimmed" mb="xs">
        {roundedCurrentXP} / {roundedXpForNextLevel} XP
      </Text>
      {xpGainPercentage > 0 ? (
        <Text fz="xs" c="blue" mb="md">
          Gaining {xpGainPercentage}% of creep XP
        </Text>
      ) : (
        <Text fz="xs" c="red" mb="md">
          No XP gained at this level
        </Text>
      )}
      <Progress value={progressPercentage} mt="md" size="lg" radius="xl" />
      {totalRawXP !== undefined && (
        <Text fz="xs" c="dimmed" mt="xs">
          Total raw XP from creeps: {totalRawXP}
        </Text>
      )}
    </Card>
  );
}