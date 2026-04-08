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



const ICON_MAP = {
    IconCalculator,
    IconRecycle,
    IconRoute,
    IconDroplet,
    IconGauge
};

export default function Home() {
    const isMobile = useMediaQuery('(max-width: 768px)');
    return (
        <>
            <Box bg="linear-gradient(135deg, var(--mantine-color-dark-8) 0%, var(--mantine-primary-color-filled) 100%)" py={{ base: 80, md: 120 }}>
                <Container size="lg" ta="center">
                    <Title order={1} c="white" fz={{ base: 40, md: 60 }} fw={900} lh={1.1} mb="md">
                        Advanced Tools for <Text component="span" c="var(--mantine-primary-color-3)" inherit>Green Hydrogen</Text> Engineering
                    </Title>

                    <Text c="gray.3" fz={{ base: 'md', md: 'xl' }} maw={750} mx="auto" mb="xl">
                        A specialized platform designed for laboratories, researchers, and industrial engineers to plan, simulate, and optimize H₂ systems.
                    </Text>

                    <Group justify="center" gap="md">
                        <Button 
                            onClick={() => document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' })}
                            size="xl" 
                            radius="md" 
                            variant="filled"
                            leftSection={<IconCalculator size={24} />}
                        >
                            Access Tools
                        </Button>

                        <Button 
                            onClick={() => document.getElementById('learn')?.scrollIntoView({ behavior: 'smooth' })}
                            size="xl" 
                            radius="md" 
                            variant="white"
                            c="var(--mantine-primary-color-filled)" 
                            leftSection={<IconBook size={24} />}
                        >
                            Explore Technologies
                        </Button>
                    </Group>
                </Container>
            </Box>
            
            <Container size="lg" pt={80} pb={20}>
                <Paper radius="lg" p={{ base: 'xl', md: 50 }} bg="gray.0" style={{ border: '1px solid var(--mantine-color-gray-2)' }}>
                    <Grid align="center" gutter={{ base: 'xl', md: 50 }}>
                        <Grid.Col span={{ base: 12, md: 7 }}>
                            <Badge color="var(--mantine-primary-color-filled)" variant="light" size="lg" mb="sm">Our Facility</Badge>
                            <Title order={2} mb="md" lh={1.2}>
                                Inside the <Text component="span" c="var(--mantine-primary-color-filled)" inherit>GreenLab</Text>
                            </Title>
                            <Text c="dimmed" size="lg" mb="xl" lh={1.6}>
                                We are an advanced research facility dedicated to scaling green hydrogen technologies. 
                                Beyond digital simulations, our physical lab focuses on testing, optimizing, and developing the next generation of electrolyzers and gas recycling systems.
                            </Text>
                            <Button 
                                component={Link} 
                                to="/lab" 
                                size="md" 
                                radius="md" 
                                variant="outline"
                                color="var(--mantine-primary-color-filled)"
                                rightSection={<IconArrowRight size={18} />}
                            >
                                Discover our Research
                            </Button>
                        </Grid.Col>
                        
                        <Grid.Col span={{ base: 12, md: 5 }} ta="center">
                            {/* Un grand cercle avec une icône de fiole de laboratoire pour illustrer */}
                            <ThemeIcon size={160} radius="100%" variant="light" color="var(--mantine-primary-color-filled)">
                                <IconFlask size={80} stroke={1.5} />
                            </ThemeIcon>
                        </Grid.Col>
                    </Grid>
                </Paper>
            </Container>

            <Container id="tools" size="lg" py={80} mb={40}>
                <Title order={2} ta="center" mb="sm">Engineering Utilities</Title>
                <Text c="dimmed" ta="center" mb="xl" maw={600} mx="auto">
                    Direct access to our simulation and evaluation models.
                </Text>

                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl" mt={40}>
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

            <Box id="learn" bg="gray.0" py={80} style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}>
                <Container size="lg">
                    <Title order={2} ta="center" mb="sm">Knowledge Base</Title>
                    <Text c="dimmed" ta="center" mb="xl" maw={600} mx="auto">
                        Dive deep into the core technologies of the hydrogen supply chain. Explore our comprehensive technical documentation.
                    </Text>

                    <Carousel
                        withControls={isMobile || learnData.length>3}
                        height="100%"
                        slideSize={{ base: '100%', sm: '50%', md: '33.333333%' }}
                        slideGap="md"
                        emblaOptions={{
                            loop: true,
                            align:"start"
                        }}
                        mt={40}
                        style={{ paddingBottom: '40px' }}
                    >
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