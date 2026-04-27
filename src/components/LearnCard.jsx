import { Card, Text, ThemeIcon, Button } from '@mantine/core';
import { Link } from 'react-router-dom';
import { IconArrowRight } from '@tabler/icons-react';

/**
 * Renders a navigational card used in the "Knowledge Base" (Learn) section.
 * It displays a specific educational topic (e.g., Electrolyzers, Compressors) 
 * with an icon, description, and a call-to-action button linking to the detailed documentation.
 * * @param {Object} props
 * @param {string} props.title - The main heading of the educational card.
 * @param {string} props.description - A brief summary of the topic covered.
 * @param {React.ElementType} props.Icon - A Tabler Icon component used as the visual identifier for the topic.
 * @param {string} props.link - The local router path (e.g., '/electrolyzers') to navigate to when the button is clicked.
 */
export default function LearnCard({ title, description, Icon, link }) {
    return (
        <Card 
            shadow="sm" 
            padding="xl" 
            radius="md" 
            withBorder 
            h="100%" 
            display="flex" 
            style={{ flexDirection: 'column' }}
        >
            <ThemeIcon 
                size={60} 
                radius="md" 
                variant="light" 
                color="var(--mantine-primary-color-filled)" 
                mb="md"
            >
                <Icon size={34} stroke={1.5} />
            </ThemeIcon>
            
            <Text fw={700} size="xl" mb="xs">
                {title}
            </Text>
            
            <Text c="dimmed" size="sm" mb="xl" style={{ flexGrow: 1 }}>
                {description}
            </Text>
            
            <Button 
                component={Link} 
                to={link} 
                variant="light" 
                color="var(--mantine-primary-color-filled)" 
                rightSection={<IconArrowRight size={16} />} 
                fullWidth
            >
                Read Documentation
            </Button>
        </Card>
    );
}