import { Card, Text, Button, ThemeIcon, Group } from '@mantine/core';
import { Link } from 'react-router-dom';

/**
 * Renders a primary navigation card for the interactive engineering tools (Calculators).
 * Similar to the LearnCard, but specifically styled to emphasize actionable utility 
 * rather than educational reading.
 * * @param {Object} props
 * @param {string} props.title - The name of the specific tool or calculator.
 * @param {string} props.description - A brief summary of what the tool computes (e.g., LCOH, ROI).
 * @param {React.ElementType} props.Icon - A Tabler Icon component representing the tool.
 * @param {string} props.buttonText - Call-to-action text displayed inside the bottom button.
 * @param {string} props.link - The local router path (e.g., '/calculator') to launch the tool.
 */
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