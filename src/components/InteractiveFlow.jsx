import { useState } from 'react';
import { Flex, Stack, Text, ThemeIcon, Box } from '@mantine/core';
import { IconArrowRight, IconQuestionMark } from '@tabler/icons-react';
import { useMediaQuery } from '@mantine/hooks';



function buildTree(flatData) {
  const tree = [];
  const lookup = {};
  flatData.forEach(item => lookup[item.id] = { ...item, children: [] });
  flatData.forEach(item => {
    if (item.parentId && lookup[item.parentId]) {
      lookup[item.parentId].children.push(lookup[item.id]);
    } else {
      tree.push(lookup[item.id]);
    }
  });
  return tree;
}

const getArrowTransform = (total, index, isMobile) => {
  if (total <= 1) return isMobile ? 'translateY(-12px) rotate(90deg)' : 'translateX(-8px) rotate(0deg)';

  let rot = 0, x = 0, y = 0;

  if (total === 2) {
      if (index === 0) { rot = isMobile ? 110 : -30; x = isMobile ? 15 : -10; y = isMobile ? -10 : 15; }
      if (index === 1) { rot = isMobile ? 70 : 30;  x = isMobile ? -15 : -10; y = isMobile ? -10 : -35; }
  } else if (total === 3) {
      if (index === 0) { rot = isMobile ? 120 : -40; x = isMobile ? 35 : -15; y = isMobile ? -15 : 45; }
      if (index === 1) { rot = isMobile ? 90 : 0;    x = isMobile ? 0 : -8;   y = isMobile ? -5 : 0; }
      if (index === 2) { rot = isMobile ? 60 : 40;   x = isMobile ? -35 : -15; y = isMobile ? -15 : -55; }
  } else if (total >= 4) {
      if (index === 0) { rot = isMobile ? 130 : -45; x = isMobile ? 55 : -20; y = isMobile ? -30 : 65; }
      if (index === 1) { rot = isMobile ? 110 : -20; x = isMobile ? 15 : -10; y = isMobile ? -10 : 20; }
      if (index === 2) { rot = isMobile ? 70 : 25;   x = isMobile ? -15 : -10; y = isMobile ? -10 : -35; }
      if (index === 3) { rot = isMobile ? 50 : 45;   x = isMobile ? -55 : -20; y = isMobile ? -30 : -75; }
  }

  return `translate(${x}px, ${y}px) rotate(${rot}deg)`;
};

export default function InteractiveFlow({ data, iconMap, selectedItem, onNodeClick }) {
  const [hoveredId, setHoveredId] = useState(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (!data || data.length === 0) return null;
  const treeData = buildTree(data);

  const getActivePath = (targetId) => {
    const path = new Set();
    let currentId = targetId;
    while (currentId) {
      path.add(currentId);
      const node = data.find(d => d.id === currentId);
      currentId = node ? node.parentId : null;
    }
    return path;
  };

  const activePath = getActivePath(hoveredId || (selectedItem ? selectedItem.id : null));

  const renderNode = (node) => {
    const isActive = activePath.has(node.id);
    const isSelected = selectedItem?.id === node.id;
    const ActiveIcon = iconMap[node.iconName] || IconQuestionMark;
    const totalChildren = node.children.length;

    return (
      <Flex
        key={node.id}
        direction={{ base: 'column', md: 'row' }}
        align="center"
        justify="center"
        gap="xl"
      >
        <Stack
          align="center"
          gap="xs"
          onMouseEnter={() => setHoveredId(node.id)}
          onMouseLeave={() => setHoveredId(null)}
          onClick={() => { if (onNodeClick) onNodeClick(node); }}
          style={{ cursor: 'pointer', zIndex: 2 }}
        >
          <ThemeIcon
            size={isMobile ? 60 : 80}
            radius="100%"
            variant={isActive ? 'filled' : 'light'}
            color={isActive ? 'myColor' : 'gray'}
            style={{
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: isActive ? 'scale(1.1)' : 'scale(1)',
              boxShadow: isSelected ? '0 0 0 4px var(--mantine-color-myColor-2)' : 'none'
            }}
          >
            <ActiveIcon size={isMobile ? 30 : 40} stroke={1.5} />
          </ThemeIcon>
          <Text
            size="sm"
            fw={isActive ? 700 : 500}
            c={isActive ? 'myColor.9' : 'dimmed'}
            ta="center"
            style={{ transition: 'all 0.3s ease' }}
          >
            {node.label}
          </Text>
        </Stack>

        {totalChildren > 0 && (
          <Flex
            direction={{ base: 'row', md: 'column' }}
            align="flex-start"
            justify="center"
            gap="lg"
          >
            {node.children.map((child, index) => {
              const isChildActive = activePath.has(child.id);
              const arrowColor = isChildActive ? 'var(--mantine-primary-color-filled)' : 'var(--mantine-color-gray-4)';

              const transformDesktop = getArrowTransform(totalChildren, index, false);
              const transformMobile = getArrowTransform(totalChildren, index, true);

              return (
                <Flex
                  key={child.id}
                  direction={{ base: 'column', md: 'row' }}
                  align="center"
                  gap={{base: "xs", sm: "md"}}
                >
                  <Box visibleFrom="md">
                    <IconArrowRight 
                      size={isMobile ? 24 : 32} 
                      color={arrowColor} 
                      style={{ 
                        transform: transformDesktop, 
                        transition: 'all 0.3s ease' 
                      }} 
                    />
                  </Box>
                  
                  <Box hiddenFrom="md">
                    <IconArrowRight 
                      size={isMobile ? 24 : 32} 
                      color={arrowColor} 
                      style={{ 
                        transform: transformMobile, 
                        transition: 'all 0.3s ease' 
                      }} 
                    />
                  </Box>

                  {renderNode(child)}
                </Flex>
              );
            })}
          </Flex>
        )}
      </Flex>
    );
  };

  return (
    <Box p="xl" style={{ overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
      {treeData.map(rootNode => renderNode(rootNode))}
    </Box>
  );
}