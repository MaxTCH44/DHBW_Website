import { useState } from 'react';
import { Container, Title, Text, Grid, Card, Group, Badge, Box, Select, Paper, Button } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconMail } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

import gasData from '../data/recycling_gases.json';

import SliderInput from '../components/SliderInput';



export default function Recycling() {
    const [gasType, setGasType] = useState(null);
    const [volume, setVolume] = useState(50);
    
    const isMobile = useMediaQuery('(max-width: 768px)');

    const gasOptions = gasData.map(gas => gas.value);

    const selectedGasInfo = gasData.find(gas => gas.value === gasType);

    const complexity = selectedGasInfo ? selectedGasInfo.complexity : "Select a gas type";
    const complexityColor = selectedGasInfo ? selectedGasInfo.complexityColor : "gray";
    const advice = selectedGasInfo ? selectedGasInfo.advice : "Please provide details about your mixed gas to get a preliminary assessment.";

    return (
        <Container size="xl" px="xl" py="lg">
            
            <Box mb={60} ta="center">
                <Title order={1} c="dark.7" mb="md">Hydrogen Recycling Process</Title>
                <Text size="lg" c="dimmed" maw={800} mx="auto">
                    Unlock the hidden value of your unused hydrogen. Recycling your industrial exhaust gases back into pure H₂ is a complex but highly profitable operation. Use our tool below to evaluate your potential.
                </Text>
            </Box>

            <Grid gutter="xl" mb={60}>
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Title order={3} mb="sm">Evaluate Your Potential</Title>
                    <Text c="dimmed" mb="xl">
                        The technology and investment required depend entirely on your current setup. Use this quick tool to estimate the complexity of your recycling project.
                    </Text>

                    <Select
                        label="Main impurity in your hydrogen stream"
                        placeholder="Select gas type"
                        data={gasOptions}
                        value={gasType}
                        onChange={setGasType}
                        mb="md"
                    />

                    <SliderInput 
                        label="Estimated daily volume to recycle"
                        units="kg"
                        value={volume}
                        onValueChange={v => setVolume(v)}
                        min={10}
                        max={1000}
                    />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Card shadow="xs" padding="xl" radius="md" withBorder h="100%">
                        <Text fw={700} size="lg" mb="md" style={{ borderBottom: '2px solid var(--mantine-color-gray-2)' }} pb="xs">
                            Preliminary Assessment
                        </Text>
                        
                        <Group justify="space-between" mb="md">
                            <Text fw={500}>System Complexity:</Text>
                            <Badge color={complexityColor} size="lg" variant="light">{complexity}</Badge>
                        </Group>

                        <Text c="dimmed" size="sm" mb="xl" style={{ minHeight: '60px' }}>
                            {advice}
                        </Text>
                        
                        <Box bg="gray.0" p="sm" radius="md">
                            <Text size="xs" c="dimmed" ta="center">
                                *This is an estimation. Real-world implementation requires a technical audit.
                            </Text>
                        </Box>
                    </Card>
                </Grid.Col>
            </Grid>

            <Paper radius="md" p="xl" bg="var(--mantine-primary-color-filled)" c="white" ta="center">
                <Title order={2} mb="md" c="white">Every Recycling System is Unique</Title>
                <Text size="lg" mb="xl" maw={600} mx="auto">
                    Because your gas mixtures and production requirements are specific to your plant, our engineers design custom separation and compression architectures for you.
                </Text>
                <Button 
                    size={isMobile ? "sm" : "lg"}
                    component={Link}
                    to="/contact"
                    fullWidth={isMobile}
                    variant="white" 
                    color="dark" 
                    leftSection={<IconMail size={20} />}
                    style={{ color: 'var(--mantine-primary-color-filled)' }}
                >
                    Get a Free Expert Assessment
                </Button>
            </Paper>

        </Container>
    );
}