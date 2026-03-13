import { Text, Image } from '@mantine/core';



export default function ContentDetails({ item }) {
  return (
    <div>
      {item.content.map((block, index) => {
        if (block.type === 'paragraph') {
          return (
            <Text key={index} mb="md" mt="md">
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

        return null;
      })}
    </div>
  );
}