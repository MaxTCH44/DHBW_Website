import { Card, Text, Button, ThemeIcon, Group } from '@mantine/core';
import { Link } from 'react-router-dom';



export default function ToolCard({ title, description, Icon, buttonText, link }) {
    return (
        <Card 
            shadow="md" 
            padding="xl" 
            radius="md" 
            withBorder
            bg="var(--mantine-color-gray-0)"
            style={{ 
                display: 'flex', 
                flexDirection: 'column',
                height: '100%'
            }}
        >
            <Group mb="md">
                <ThemeIcon size={50} radius="md" color="var(--mantine-primary-color-filled)">
                    <Icon size={26} stroke={1.5} />
                </ThemeIcon>
                <Text fw={700} size="xl" style={{ flex: 1 }}>
                    {title}
                </Text>
            </Group>

            <Text c="dimmed" size="md" mb="xl" style={{ flexGrow: 1 }}>
                {description}
            </Text>

            <Button 
                component={Link} 
                to={link}
                size="md" 
                radius="md" 
                variant="filled" 
                fullWidth
            >
                {buttonText}
            </Button>
        </Card>
    );
}