import { Container, Title, Text, Button, Group, Box } from '@mantine/core';
import { Link } from 'react-router-dom';
import { IconHome } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

/**
 * Standard 404 Error Page.
 * Acts as the fallback UI when a user navigates to a URL route that does not exist in the application.
 * It provides a clear error message and a safe navigation button back to the Home page.
 */
export default function NotFound() {

    const { t } = useTranslation("notFound");

    return (
        <Container
            size="md"
            style={{
                minHeight: 'calc(100vh - 100px - 171px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
            >
            <Box ta="center">
                <Title
                c="var(--mantine-primary-color-filled)"
                fw={900}
                style={{ fontSize: '120px', lineHeight: 1 }}
                >
                404
                </Title>

                <Title order={1} mb="md">
                {t("not_found.title")}
                </Title>

                <Text c="dimmed" size="lg" maw={500} mx="auto" mb="xl">
                {t("not_found.description")}
                </Text>

                <Group justify="center">
                <Button
                    component={Link}
                    to="/"
                    size="md"
                    leftSection={<IconHome size={18} />}
                >
                    {t("not_found.button")}
                </Button>
                </Group>
            </Box>
            </Container>
    );
}