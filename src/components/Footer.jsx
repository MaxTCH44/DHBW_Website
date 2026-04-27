import { Anchor, Container, Group, Title, Box, Flex } from '@mantine/core';
import { Link } from 'react-router-dom'; 

/**
 * Global application footer.
 * Provides consistent secondary navigation across all pages (contact, literature references, tools).
 */
export default function Footer() {
  return (
    <Box 
      component="footer" 
      mt={80} 
      bg="var(--mantine-color-gray-1)" 
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
            GreenLabs H₂
          </Title>
          <Group mt={{ base: 'md', sm: 0 }}>
            <Anchor component={Link} to="/contact" c="dimmed" size="sm">
              Contact
            </Anchor>
            <Anchor component={Link} to="/references" c="dimmed" size="sm">
              References
            </Anchor>
            <Anchor component={Link} to="/setup" c="dimmed" size="sm">
              Setup Builder
            </Anchor>
          </Group>
        </Flex>
      </Container>
    </Box>
  );
}