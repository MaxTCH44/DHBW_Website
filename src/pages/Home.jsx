import { Container, Title, Text, Button, Group, Box, SimpleGrid, Paper, Grid, Badge, ThemeIcon } from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import { useMediaQuery } from '@mantine/hooks';
import '@mantine/carousel/styles.css';
import { IconCalculator, IconBook, IconRecycle, IconRoute, IconDroplet, IconGauge, IconFlask, IconArrowRight } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

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

    const { t } = useTranslation("home");

    return (
        <>
            {/* --- HERO SECTION --- */}
            <Box bg="linear-gradient(135deg, var(--mantine-color-dark-8) 0%, var(--mantine-primary-color-filled) 100%)" py={{ base: 80, md: 120 }}>
                <Container size="lg" ta="center" mt="150">
                <Title order={1} c="white" fz={{ base: 40, md: 60 }} fw={900} lh={1.1} mb="md">
                    {t("home_hero.titleP1")}
                    <Text component="span" c="var(--mantine-primary-color-3)" inherit>
                        {t("home_hero.titleGreen")}
                    </Text>
                    {t("home_hero.titleP2")}
                </Title>

                <Text c="gray.3" fz={{ base: 'md', md: 'xl' }} maw={750} mx="auto" mb="xl">
                    {t("home_hero.subtitle")}
                </Text>

                <Group justify="center" gap="md">
                    <Button
                    onClick={() => document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' })}
                    size="xl"
                    radius="md"
                    variant="filled"
                    leftSection={<IconCalculator size={24} />}
                    >
                    {t("home_hero.buttons.primary")}
                    </Button>

                    <Button
                    onClick={() => document.getElementById('learn')?.scrollIntoView({ behavior: 'smooth' })}
                    size="xl"
                    radius="md"
                    variant="white"
                    c="#00a41b"
                    leftSection={<IconBook size={24} />}
                    >
                    {t("home_hero.buttons.secondary")}
                    </Button>
                </Group>
                </Container>
            </Box>

            {/* --- LAB INTRODUCTION SECTION --- */}
            <Container size="lg" pt={80} pb={20}>
                <Paper radius="lg" p={{ base: 'xl', md: 50 }} bg="gray.0" style={{ border: '1px solid var(--mantine-color-gray-2)' }}>
                <Grid align="center" gutter={{ base: 'xl', md: 50 }}>
                    <Grid.Col span={{ base: 12, md: 7 }}>
                    <Badge color="#00a41b" variant="light" size="lg" mb="sm">
                        {t("home_lab.badge")}
                    </Badge>

                    <Title order={2} mb="md" lh={1.2}>
                        {t("home_lab.title")} <Text component="span" c="#00a41b" inherit>GreenLab</Text>
                    </Title>

                    <Text c="#495057" size="lg" mb="xl" lh={1.6}>
                        {t("home_lab.description")}
                    </Text>

                    <Button
                        component={Link}
                        to="/lab"
                        size="md"
                        radius="md"
                        variant="outline"
                        color="#00a41b"
                        rightSection={<IconArrowRight size={18} />}
                    >
                        {t("home_lab.button")}
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
                <Title order={2} ta="center" mb="sm">
                {t("home_tools_section.title")}
                </Title>

                <Text c="#495057" ta="center" mb="xl" maw={600} mx="auto">
                {t("home_tools_section.subtitle")}
                </Text>

                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl" mt={40}>
                {toolsData.map((tool, index) => {
                    const IconComponent = ICON_MAP[tool.iconName];
                    return (
                    <ToolCard
                        key={index}
                        title={t(tool.title)}
                        description={t(tool.description)}
                        buttonText={t(tool.buttonText)}
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
                <Title order={2} ta="center" mb="sm">
                    {t("home_learn_section.title")}
                </Title>

                <Text c="#495057" ta="center" mb="xl" maw={600} mx="auto">
                    {t("home_learn_section.subtitle")}
                </Text>

                <Carousel
                    withControls={isMobile || learnData.length > 3}
                    height="100%"
                    slideSize={{ base: '100%', sm: '50%', md: '33.333333%' }}
                    slideGap="md"
                    emblaOptions={{ loop: true, align: "start" }}
                    mt={40}
                    pb={40}
                    styles={{
                        control: {
                            backgroundColor: 'var(--mantine-color-green-3)',
                            color: 'var(--mantine-color-white)',
                            border: 'none',
                            boxShadow: 'var(--mantine-shadow-sm)',
                            '&:hover': {
                                backgroundColor: 'var(--mantine-color-green-4)',
                            }
                        }
                    }}
                >
                    {learnData.map((item, index) => {
                    const IconComponent = ICON_MAP[item.iconName];
                    return (
                        <Carousel.Slide key={index}>
                        <LearnCard
                            title={t(item.title)}
                            description={t(item.description)}
                            link={item.link}
                            Icon={IconComponent}
                            documentation={t(item.documentation)}
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