import { Text, Image, Title, Group, ThemeIcon, Anchor, Box, Badge } from '@mantine/core';
import { IconExternalLink } from '@tabler/icons-react';



function ReferenceLink({ label, authors, year, title, journal, url, license }) {
  if (label && !authors) {
        return (
            <Group gap="sm" mb="sm" wrap="nowrap" align="flex-start">
                <ThemeIcon color="gray" size={24} variant="transparent" mt={2}>
                    <IconExternalLink size={16} />
                </ThemeIcon>
                <Anchor href={url} target="_blank" rel="noopener noreferrer" c="blue.7" fw={500} style={{ lineHeight: 1.4 }}>
                    {label}
                </Anchor>
            </Group>
        );
    }
    return (
        <Group gap="sm" mb="md" wrap="nowrap" align="flex-start">
            <ThemeIcon color="gray" size={24} variant="transparent" mt={2}>
                <IconExternalLink size={16} />
            </ThemeIcon>
            <Box style={{ lineHeight: 1.4 }}>
                <Text size="sm" c="dark.8">
                    {authors && <Text component="span" fw={600}>{authors} {year && `(${year}). `}</Text>}
                    {title && <Text component="span" fs="italic">"{title}". </Text>}
                    {journal && <Text component="span">{journal}. </Text>}
                </Text>
                
                <Group gap="xs" mt={4}>
                    <Anchor href={url} target="_blank" rel="noopener noreferrer" c="blue.7" size="sm" fw={500}>
                        Read publication
                    </Anchor>
                    {license && (
                        <Badge variant="light" color="gray" size="xs">
                            {license}
                        </Badge>
                    )}
                </Group>
            </Box>
        </Group>
    );
};

export default function ContentDetails({ item, componentList = null }) {
  return (
    <div>
      {item.content.map((block, index) => {
        
        if (block.type === 'subtitle') {
          return (
            <Title 
              key={index} 
              order={block.size || 2}
              id={block.id}
              mt="xl" 
              mb="sm" 
              c="dark.8"
            >
              {block.value}
            </Title>
          );
        }

        if (block.type === 'paragraph') {
          return (
            <Text key={index} mb="md" mt="md" lh={1.6}>
              {block.value}
            </Text>
          );
        }

        if (block.type === 'image') {
          return (
            <Image
              key={index}
              src={block.src}
              alt={block.alt}
              w={block.size}
              maw="100%"
              m="auto"
              radius="md"
              mb="lg"
              mt="lg"
            />
          );
        }

        if (block.type === 'reference') {
           return <ReferenceLink key={index} {...block.props} />;
        }

        if (block.type === 'component' && componentList) {
          const ComponentToRender = componentList[block.componentName];

          if (ComponentToRender) {
            return (
                <ComponentToRender key={index} {...block.props}>{block.value}</ComponentToRender>
            )
          }
        }
        
        return null;
      })}
    </div>
  );
}