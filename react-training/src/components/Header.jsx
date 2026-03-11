import { Burger, Container, Group, Title, Drawer, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Link, useLocation } from 'react-router-dom'; 
import classes from './Header.module.css';

const links = [
  { link: '/production', label: 'Production' },
  { link: '/recycling', label: 'Recycling' },
  { link: '/electrolyzers', label: 'Electrolyzers' },
];

export default function Header() {
  const [opened, { toggle, close }] = useDisclosure(false);
  const location = useLocation(); 

  const items = links.map((link) => (
    <Link
      key={link.label}
      to={link.link}
      className={classes.link}
      data-active={location.pathname === link.link || undefined}
      onClick={close} 
    >
      {link.label}
    </Link>
  ));

  return (
    <header className={classes.header}>
      <Container size="md" className={classes.inner}>
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
    </header>
  );
}