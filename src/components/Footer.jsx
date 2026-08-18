import { Anchor, Container, Group, Title, Box, Flex } from '@mantine/core';
import { Link } from 'react-router-dom'; 
import { useTranslation } from 'react-i18next';

/**
 * Global application footer.
 * Provides consistent secondary navigation across all pages (contact, literature references, tools).
 */
export default function Footer() {
  const { t } = useTranslation("common");
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
          <Title order={4} c="#495057">
            GreenLabs H₂
          </Title>
          <Group mt={{ base: 'md', sm: 0 }}>
            <Anchor component={Link} to="/contact" c="#495057" size="sm">
              {t("footer.contact")}
            </Anchor>
            <Anchor component={Link} to="/references" c="#495057" size="sm">
              {t("footer.references")}
            </Anchor>
            <Anchor component={Link} to="/setup" c="#495057" size="sm">
              {t("footer.setupBuilder")}
            </Anchor>
          </Group>
        </Flex>
      </Container>
    </Box>
  );
}