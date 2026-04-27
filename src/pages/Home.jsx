import { Container, Title, Text, Button, Group, Box, SimpleGrid, Paper, Grid, Badge, ThemeIcon } from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import { useMediaQuery } from '@mantine/hooks';
import '@mantine/carousel/styles.css';
import { IconCalculator, IconBook, IconRecycle, IconRoute, IconDroplet, IconGauge, IconFlask, IconArrowRight } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

import learnData from '../data/home_learn.json';
import toolsData from '../data/home_tools.json';
import ToolCard from '../components/ToolCard';
import LearnCard from '../components/LearnCard';

// --- ICON REGISTRY ---
// Maps string references from the JSON files directly to Tabler Icon React components.
// This allows non-developers to change icons by simply editing the JSON text, rather than the source code.
const ICON_MAP = {
    IconCalculator,
    IconRecycle,
    IconRoute,
    IconDroplet,
    IconGauge
};

/**
 * Renders the main landing page of the application.
 * It serves as a visual hub, directing users to the engineering tools (Calculators) 
 * or the educational knowledge base (Learn).
 */
export default function Home() {
    // Determines if the viewport is mobile-sized to dynamically adjust the Mantine Carousel controls
    const isMobile = useMediaQuery('(max-width: 768px)');

    return (
        <>
            {/* --- HERO SECTION --- */}
            <Box bg="linear-gradient(135deg, var(--mantine-color-dark-8) 0%, var(--mantine-primary-color-filled) 100%)" py={{ base: 80, md: 120 }}>
                <Container size="lg" ta="center">
                    <Title order={1} c="white" fz={{ base: 40, md: 60 }} fw={900} lh={1.1} mb="md">
                        Advanced Tools for <Text component="span" c="var(--mantine-primary-color-3)" inherit>Green Hydrogen</Text> Engineering
                    </Title>
                    <Text c="gray.3" fz={{ base: 'md', md: 'xl' }} maw={750} mx="auto" mb="xl">
                        A specialized platform designed for laboratories, researchers, and industrial engineers to plan, simulate, and optimize H₂ systems.
                    </Text>
                    <Group justify="center" gap="md">
                        <Button onClick={() => document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' })} size="xl" radius="md" variant="filled" leftSection={<IconCalculator size={24} />} >
                            Access Tools
                        </Button>
                        <Button onClick={() => document.getElementById('learn')?.scrollIntoView({ behavior: 'smooth' })} size="xl" radius="md" variant="white" c="var(--mantine-primary-color-filled)" leftSection={<IconBook size={24} />} >
                            Explore Technologies
                        </Button>
                    </Group>
                </Container>
            </Box>

            {/* --- LAB INTRODUCTION SECTION --- */}
            <Container size="lg" pt={80} pb={20}>
                <Paper radius="lg" p={{ base: 'xl', md: 50 }} bg="gray.0" style={{ border: '1px solid var(--mantine-color-gray-2)' }}>
                    <Grid align="center" gutter={{ base: 'xl', md: 50 }}>
                        <Grid.Col span={{ base: 12, md: 7 }}>
                            <Badge color="var(--mantine-primary-color-filled)" variant="light" size="lg" mb="sm">Our Facility</Badge>
                            <Title order={2} mb="md" lh={1.2}>
                                Inside the <Text component="span" c="var(--mantine-primary-color-filled)" inherit>GreenLab</Text>
                            </Title>
                            <Text c="dimmed" size="lg" mb="xl" lh={1.6}>
                                We are an advanced research facility dedicated to scaling green hydrogen technologies. Beyond digital simulations, our physical lab focuses on testing, optimizing, and developing the next generation of electrolyzers and gas recycling systems.
                            </Text>
                            <Button component={Link} to="/lab" size="md" radius="md" variant="outline" color="var(--mantine-primary-color-filled)" rightSection={<IconArrowRight size={18} />} >
                                Discover our Research
                            </Button>
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 5 }} ta="center">
                            <ThemeIcon size={160} radius="100%" variant="light" color="var(--mantine-primary-color-filled)">
                                <IconFlask size={80} stroke={1.5} />
                            </ThemeIcon>
                        </Grid.Col>
                    </Grid>
                </Paper>
            </Container>

            {/* --- TOOLS SECTION (Calculators) --- */}
            <Container id="tools" size="lg" py={80} mb={40}>
                <Title order={2} ta="center" mb="sm">Engineering Utilities</Title>
                <Text c="dimmed" ta="center" mb="xl" maw={600} mx="auto">
                    Direct access to our simulation and evaluation models.
                </Text>
                
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl" mt={40}>
                    {/* Dynamically maps the tools listed in home_tools.json */}
                    {toolsData.map((tool, index) => {
                        const IconComponent = ICON_MAP[tool.iconName];
                        return (
                            <ToolCard 
                                key={index} 
                                title={tool.title} 
                                description={tool.description} 
                                buttonText={tool.buttonText} 
                                link={tool.link} 
                                Icon={IconComponent} 
                            />
                        );
                    })}
                </SimpleGrid>
            </Container>

            {/* --- KNOWLEDGE BASE SECTION (Learn) --- */}
            <Box id="learn" bg="gray.0" py={80} style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}>
                <Container size="lg">
                    <Title order={2} ta="center" mb="sm">Knowledge Base</Title>
                    <Text c="dimmed" ta="center" mb="xl" maw={600} mx="auto">
                        Dive deep into the core technologies of the hydrogen supply chain. Explore our comprehensive technical documentation.
                    </Text>

                    {/* Uses a Carousel slider to prevent the cards from stacking vertically and taking up too much page height */}
                    <Carousel
                        withControls={isMobile || learnData.length > 3} // Only show arrows if there are enough items to actually scroll
                        height="100%"
                        slideSize={{ base: '100%', sm: '50%', md: '33.333333%' }}
                        slideGap="md"
                        emblaOptions={{ loop: true, align: "start" }}
                        mt={40}
                        style={{ paddingBottom: '40px' }}
                    >
                        {/* Dynamically maps the documentation articles listed in home_learn.json */}
                        {learnData.map((item, index) => {
                            const IconComponent = ICON_MAP[item.iconName];
                            return (
                                <Carousel.Slide key={index}>
                                    <LearnCard 
                                        title={item.title} 
                                        description={item.description} 
                                        link={item.link} 
                                        Icon={IconComponent} 
                                    />
                                </Carousel.Slide>
                            );
                        })}
                    </Carousel>
                </Container>
            </Box>
        </>
    );
}