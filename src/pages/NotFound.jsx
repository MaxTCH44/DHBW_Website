import { Container, Title, Text, Button, Group, Box } from '@mantine/core';
import { Link } from 'react-router-dom';
import { IconHome } from '@tabler/icons-react';

export default function NotFound() {
    return (
        <Container size="md" py={100}>
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