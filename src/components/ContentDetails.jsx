import { Text, Image, Title, Group, ThemeIcon, Anchor, Box, Badge, Stack } from '@mantine/core';
import { IconExternalLink } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';


/**
 * Sub-component to format and render academic or technical references.
 * It handles two layouts: a simple link layout (if only a label is provided) 
 * or a full academic citation layout (authors, journal, year, license).
 */
function ReferenceLink({ label, authors, year, title, journal, url, license, namespace }) {

    const { t } = useTranslation(namespace);

    // Simple layout: generally used for standard web links or basic documentation
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
    
    // Academic layout: formats standard paper citations
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
                        {t("readPublication")}
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

/**
 * A dynamic rendering engine that maps structured JSON data into actual Mantine UI components.
 * This pattern allows non-developers to edit the platform's knowledge base (like hydrogen courses)
 * purely via JSON files, without needing to touch the React source code.
 * * @param {Object} props
 * @param {Object} props.item - The structured JSON object containing a `content` array of layout blocks.
 * @param {Object} [props.componentList=null] - A dictionary mapping string names to actual React components, allowing the JSON to inject complex interactive schemas (like SVG electrolyzers).
 * @param {string} props.namespace - Determines the i18n namespace for the traduction.
 */
export default function ContentDetails({ item, namespace, componentList = null }) {

  const { t } = useTranslation(namespace);

  const translateProps = (obj, t) => {
    if (typeof obj === 'string') {
      // si la traduction existe => traduit
      const translated = t(obj);

      // i18next retourne la clé si elle n'existe pas
      return translated !== obj ? translated : obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => translateProps(item, t));
    }

    if (typeof obj === 'object' && obj !== null) {
      return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [
          key,
          translateProps(value, t),
        ])
      );
    }

    return obj;
  };

  return (
    <div>
      {item.content.map((block, index) => {
        
        // --- TEXT BLOCKS ---
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
              {t(block.value)}
            </Title>
          );
        }

        if (block.type === 'paragraph') {
          return (
            <Text 
              key={index} 
              mb="md" 
              mt="md" 
              lh={1.6}
              c={block.color}
              size={block.size}
              fw={block.weight}
              ta={block.align}
            >
              {t(block.value)}
            </Text>
          );
        }

        // --- MEDIA BLOCKS ---
        if (block.type === 'image') {
          return (
            <Stack 
              key={index} 
              w={block.size || "100%"} 
              maw="100%" 
              m="auto"  
              mb="lg" 
              mt="lg" 
              gap="xs"
            >
              <Image
                title={t(block.title)}
                src={block.src}
                alt={t(block.alt)}
                w="100%"
                radius="md"
              />
              {block.caption && (
                <Text ta="center" size="sm" c="dimmed" fs="italic" px="sm">
                  {t(block.caption)}
                </Text>
              )}
            </Stack>
          );
        }

        // --- EXTERNAL LINKS ---
        if (block.type === 'reference') {
           return <ReferenceLink key={index} {...block.props} namespace={namespace} />;
        }

        // --- DYNAMIC REACT COMPONENTS ---
        // Crucial feature: Allows injecting complex interactive widgets directly from the JSON.
        // It looks up the requested component name within the provided `componentList` registry.
        if (block.type === 'component' && componentList) {
          const ComponentToRender = componentList[block.componentName];
          if (block.type === 'component' && componentList) {
            const ComponentToRender = componentList[block.componentName];

            if (ComponentToRender) {
              const translatedProps = translateProps(block.props, t);

              return (
                <ComponentToRender
                  key={index}
                  {...translatedProps}
                >
                  {block.value ? t(block.value) : null}
                </ComponentToRender>
              );
            }
}
        }
        
        // Failsafe for unknown block types to prevent rendering crashes
        return null;
      })}
    </div>
  );
}