import { Card, Text, ThemeIcon, Button } from '@mantine/core';
import { Link } from 'react-router-dom';
import { IconArrowRight } from '@tabler/icons-react';



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