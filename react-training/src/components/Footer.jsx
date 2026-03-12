import { Anchor, Container, Group, Title, Box, Flex } from '@mantine/core';



const links = [
  { link: '#', label: 'About Us' },
  { link: '#', label: 'Contact' },
];

export default function Footer() {
  const items = links.map((link) => (
    <Anchor
      c="dimmed"
      key={link.label}
      href={link.link}
      onClick={(event) => event.preventDefault()}
      size="sm"
    >
      {link.label}
    </Anchor>
  ));

  return (
    <Box 
      component="footer" 
      mt={80} 
      bg="var(--mantine-color-body)" 
      style={{ borderTop: '1px solid light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4))' }}
    >
      <Container size="md">
        <Flex 
          direction={{ base: 'column', sm: 'row' }} 
          justify="space-between" 
          align="center" 
          py="xl"
        >
          <Title order={4} c="dimmed">
            Greenlabs H₂
          </Title>
          <Group mt={{ base: 'md', sm: 0 }}>{items}</Group>
        </Flex>
      </Container>
    </Box>
  );
}