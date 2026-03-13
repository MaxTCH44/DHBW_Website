import { useState } from 'react';
import { Group, Stack, Text, ThemeIcon, ScrollArea } from '@mantine/core';
import { IconArrowRight, IconQuestionMark } from '@tabler/icons-react';



export default function InteractiveFlow({ data, iconMap, selectedItem, onNodeClick }) {
  const [hoveredNode, setHoveredNode] = useState(null);

  if (!data) return null;

  let referenceLevel = null;
  let referenceId = null;

  if (hoveredNode) {
    referenceLevel = hoveredNode.level;
    referenceId = hoveredNode.id;
  } else if (selectedItem) {
    const stage = data.find(s => s.items.some(i => i.id === selectedItem.id));
    if (stage) {
      referenceLevel = stage.level;
      referenceId = selectedItem.id;
    }
  }

  function checkIsActive(itemLevel, itemId) {
    if (!referenceLevel) return false;
    if (itemLevel < referenceLevel) return true;
    if (itemLevel === referenceLevel && itemId === referenceId) return true;
    return false;
  }

  return (
    <ScrollArea type="auto" offsetScrollbars pb="md">
      <Group
        align="center"
        justify="flex-start"
        gap={{ base: 'md', sm: 'xl' }}
        wrap="nowrap"
        p={{ base: 'sm', sm: 'xl' }}
        w="max-content"
        mx="auto"
      >
        {data.map((stage, index) => {
          const isLastStage = index === data.length - 1;

          return (
            <Group key={stage.level} gap={{ base: 'md', sm: 'xl' }} wrap="nowrap">
              <Stack justify="center" gap="lg">
                {stage.items.map((item) => {
                  const isActive = checkIsActive(stage.level, item.id);
                  const isSelected = selectedItem && selectedItem.id === item.id;
                  const ActiveIcon = iconMap[item.iconName] || IconQuestionMark;

                  return (
                    <Stack
                      key={item.id}
                      align="center"
                      gap="xs"
                      onMouseEnter={() => setHoveredNode({ level: stage.level, id: item.id })}
                      onMouseLeave={() => setHoveredNode(null)}
                      onClick={() => {
                        if (onNodeClick) onNodeClick(item);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <ThemeIcon
                        size={80}
                        radius="100%"
                        variant={isActive ? 'filled' : 'light'}
                        color={isActive ? 'myColor' : 'gray'}
                        style={{
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          flexShrink: 0,
                          transform: isActive ? 'scale(1.1)' : 'scale(1)',
                          boxShadow: isSelected ? '0 0 0 4px var(--mantine-color-myColor-2)' : 'none'
                        }}
                      >
                        <ActiveIcon size={40} stroke={1.5} />
                      </ThemeIcon>
                      <Text
                        size="sm"
                        fw={isActive ? 700 : 500}
                        c={isActive ? 'myColor.9' : 'dimmed'}
                        ta="center"
                        style={{ transition: 'all 0.3s ease' }}
                      >
                        {item.label}
                      </Text>
                    </Stack>
                  );
                })}
              </Stack>
              {!isLastStage && (
                <Stack justify="center" h="100%">
                  <IconArrowRight
                    size={32}
                    color={referenceLevel > stage.level ? 'var(--mantine-primary-color-filled)' : 'var(--mantine-color-gray-4)'}
                    style={{ transition: 'all 0.3s ease', flexShrink: 0 }}
                  />
                </Stack>
              )}
            </Group>
          );
        })}
      </Group>
    </ScrollArea>
  );
}