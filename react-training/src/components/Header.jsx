import { Burger, Container, Group, Title, Drawer, Stack, Button, Flex, Box } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Link, useLocation } from 'react-router-dom';



const links = [
    { link: '/calculator', label: 'H₂ Calculator' },
    { link: '/production', label: 'Production Chain' },
    { link: '/recycling', label: 'Recycling' },
    { link: '/electrolyzers', label: 'Electrolyzers' },
];

export default function Header() {
    const [opened, { toggle, close }] = useDisclosure(false);
    const location = useLocation();

    const items = links.map((link) => {
        const isActive = location.pathname === link.link;
        return (
            <Button
                key={link.label}
                component={Link}
                to={link.link}
                variant={isActive ? 'filled' : 'subtle'}
                color={isActive ? 'var(--mantine-primary-color-filled)' : 'gray'}
                c={isActive ? 'white' : 'light-dark(var(--mantine-color-gray-7), var(--mantine-color-dark-0))'}
                onClick={close}
                px="sm"
                radius="sm"
                style={{ fontWeight: 500 }}
            >
                {link.label}
            </Button>
        );
    });

    return (
        <Box 
            component="header" 
            mb={80} 
            bg="var(--mantine-color-body)" 
            style={{ borderBottom: '1px solid light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4))' }}
        >
            <Container size="md">
                <Flex h={100} justify="space-between" align="center">
                    <Title order={3}>
                        Greenlabs H₂
                    </Title>
                    <Group gap={5} visibleFrom="xs">
                        {items}
                    </Group>
                    <Burger
                        opened={opened}
                        onClick={toggle}
                        hiddenFrom="xs"
                        size="sm"
                        aria-label="Toggle navigation"
                    />
                </Flex>
            </Container>
            <Drawer
                opened={opened}
                onClose={close}
                size="xs"
                title="Menu"
                hiddenFrom="xs"
                zIndex={1000000}
            >
                <Stack gap="sm">
                    {items}
                </Stack>
            </Drawer>
        </Box>
    );
}