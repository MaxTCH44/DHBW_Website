import { Text, Image, Title } from '@mantine/core';



export default function ContentDetails({ item, componentList = null}) {
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

        if (block.type === 'component' && componentList) {
          const ComponentToRender = componentList[block.componentName];

          if (ComponentToRender) {
            return (
                <ComponentToRender key={index} {...block.props}>{block.value}</ComponentToRender>
            );
          }
          
          console.warn(`Component ${block.componentName} not found in registry`);
          return null;
        }

        return null;
      })}
    </div>
  );
}