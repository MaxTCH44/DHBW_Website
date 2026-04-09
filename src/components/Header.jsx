import { Burger, Container, Group, Title, Drawer, Stack, Button, Flex, Box, Menu, Text, Image } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Link, useLocation } from 'react-router-dom';
import { IconChevronDown, IconFlask } from '@tabler/icons-react';



const links = [
    { link: '/lab', label: <><IconFlask /> <Text fw="900" size="lg" ml="10" >Our Lab</Text></> },
    { link: '/calculator', label: 'H₂ Calculator' },
    { link: '/recycling', label: 'H₂ Recycling' },
    {
        link: '#learn',
        label: 'Learn',
        links: [
            { link: '/production', label: 'Production Chain' },
            { link: '/recycling-process', label: 'Recycling Process' },
            { link: '/electrolyzers', label: 'Electrolyzers' },
            { link: '/compressors', label: 'Compressors' },
        ],
    },
];

export default function Header() {
    const [opened, { toggle, close }] = useDisclosure(false);
    const location = useLocation();

    const desktopItems = links.map((link) => {
        if (link.links) {
            const isGroupActive = link.links.some(sub => location.pathname === sub.link);
            
            const menuItems = link.links.map((item) => {
                const isSubActive = location.pathname === item.link;
                return (
                    <Menu.Item
                        key={item.link}
                        component={Link}
                        to={item.link}
                        onClick={close}
                        fw={isSubActive ? 700 : 500}
                        c={isSubActive ? 'var(--mantine-primary-color-filled)' : undefined}
                    >
                        {item.label}
                    </Menu.Item>
                );
            });

            return (
                <Menu key={link.label} trigger="hover" transitionProps={{ exitDuration: 0 }} withinPortal>
                    <Menu.Target>
                        <Button
                            variant={isGroupActive ? 'light' : 'subtle'}
                            color={isGroupActive ? 'var(--mantine-primary-color-filled)' : 'gray'}
                            c={isGroupActive ? 'var(--mantine-primary-color-filled)' : 'light-dark(var(--mantine-color-gray-7), var(--mantine-color-dark-0))'}
                            px="sm"
                            radius="sm"
                            style={{ fontWeight: 500 }}
                            rightSection={<IconChevronDown size={14} stroke={1.5} />}
                        >
                            {link.label}
                        </Button>
                    </Menu.Target>
                    <Menu.Dropdown>{menuItems}</Menu.Dropdown>
                </Menu>
            );
        }

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

    const mobileItems = links.map((link) => {
        if (link.links) {
            return (
                <Stack key={link.label} gap={5} mt="sm">
                    <Text size="xs" fw={700} c="dimmed" px="sm" style={{ letterSpacing: 1 }}>
                        {link.label.toUpperCase()}
                    </Text>
                    {link.links.map((item) => {
                        const isSubActive = location.pathname === item.link;
                        return (
                            <Button
                                key={item.label}
                                component={Link}
                                to={item.link}
                                variant={isSubActive ? 'filled' : 'subtle'}
                                color={isSubActive ? 'var(--mantine-primary-color-filled)' : 'gray'}
                                c={isSubActive ? 'white' : 'light-dark(var(--mantine-color-gray-7), var(--mantine-color-dark-0))'}
                                onClick={close}
                                px="sm"
                                radius="sm"
                                justify="flex-start"
                                style={{ fontWeight: 500 }}
                            >
                                {item.label}
                            </Button>
                        );
                    })}
                </Stack>
            );
        }

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
                justify="flex-start"
                style={{ fontWeight: 500 }}
            >
                {link.label}
            </Button>
        );
    });

    return (
        <Box 
            component="header" 
            bg="var(--mantine-color-gray-1)" 
            style={{ 
                borderBottom: '1px solid light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4))',
                position: 'fixed', 
                top: 0,            
                left: 0,           
                width: '100%',     
                zIndex: 100       
            }}
        >
            <Container size="md">
                <Flex h={100} justify="space-between" align="center">
                    <Group 
                        component={Link} 
                        to="/" 
                        gap="0px" 
                        style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                        <Image
                            title="GreenLabs H₂ Logo"
                            src="public/img/logo2.svg"
                            w={{base:"60px", md:"80px"}}
                        />
                        <Title order={3}>
                            GreenLabs H₂
                        </Title>
                    </Group>
                    <Group gap={5} visibleFrom="sm">
                        {desktopItems}
                    </Group>
                    <Burger
                        opened={opened}
                        onClick={toggle}
                        hiddenFrom="sm"
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
                hiddenFrom="sm"
                zIndex={1000000}
            >
                <Stack gap="sm">
                    {mobileItems}
                </Stack>
            </Drawer>
        </Box>
    );
}