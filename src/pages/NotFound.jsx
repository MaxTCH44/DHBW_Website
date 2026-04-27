import { Container, Title, Text, Button, Group, Box } from '@mantine/core';
import { Link } from 'react-router-dom';
import { IconHome } from '@tabler/icons-react';

/**
 * Standard 404 Error Page.
 * Acts as the fallback UI when a user navigates to a URL route that does not exist in the application.
 * It provides a clear error message and a safe navigation button back to the Home page.
 */
export default function NotFound() {
    return (
        <Container 
            size="md" 
            style={{ 
                // Dynamic height calculation to perfectly center the content vertically, 
                // accounting for the fixed Header and Footer heights.
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
                    Page Not Found
                </Title>
                
                <Text c="dimmed" size="lg" maw={500} mx="auto" mb="xl">
                    Unfortunately, this is only a 404 page. You may have mistyped the address, or the page has been moved to another URL.
                </Text>
                
                <Group justify="center">
                    <Button 
                        component={Link} 
                        to="/" 
                        size="md" 
                        leftSection={<IconHome size={18} />}
                    >
                        Take me back to Home
                    </Button>
                </Group>
            </Box>
        </Container>
    );
}