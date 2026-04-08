import { useState, useMemo } from 'react';
import { Container, Title, Text, Grid, Card, Group, Badge, Box, Select, Paper, Button, Divider } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconMail, IconRecycle, IconCoin, IconClockHour4, IconArrowRight } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

import gasData from '../data/recycling_gases.json';

import SliderInput from '../components/SliderInput';
import ValueInput from '../components/ValueInput';



const gasOptions = gasData.map(gas => gas.value);


export default function Recycling() {
    const isMobile = useMediaQuery('(max-width: 768px)');

    const [gasType, setGasType] = useState(null);
    const [annualMixedGas, setAnnualMixedGas] = useState(10000);
    const [h2Concentration, setH2Concentration] = useState(40);
    
    const [h2Price, setH2Price] = useState(6.11); 
    const [systemPrice, setSystemPrice] = useState(25000);

    const { 
    complexity, 
    complexityColor, 
    recoveryRate, 
    advice, 
    annualRecoveredH2Kg, 
    annualSavings, 
    roiYears 
    } = useMemo(() => {
        const info = gasData.find(gas => gas.value === gasType);
        const comp = info ? info.complexity : "Select a gas type";
        const color = info ? info.complexityColor : "gray";
        const rate = info ? info.recovery_rate : 0;
        const adv = info ? info.advice : "Please provide details about your mixed gas to get a preliminary assessment.";

        const annualH2Volume = annualMixedGas * (h2Concentration / 100);
        const annualH2Kg = annualH2Volume / 11.1;
        const recoveredKg = annualH2Kg * rate;
        const savings = recoveredKg * h2Price;
        const roi = savings > 0 ? systemPrice / savings : 0;

        return {
            complexity: comp,
            complexityColor: color,
            recoveryRate: rate,
            advice: adv,
            annualRecoveredH2Kg: recoveredKg,
            annualSavings: savings,
            roiYears: roi
        };
    }, [gasType, annualMixedGas, h2Concentration, h2Price, systemPrice]);

    return (
        <Container size="xl" px="xl" py="lg" mt="150px">
           <Box mb={60} ta="center">
                <Title order={1} c="dark.7" mb="md">Hydrogen Recycling Calculator</Title>
                <Text size="lg" c="dimmed" maw={800} mx="auto" mb="md">
                    Stop venting valuable hydrogen into the atmosphere. Calculate how much H₂ you can recover annually and discover your Return on Investment (ROI).
                </Text>
                <Button 
                    component={Link} 
                    to="/recycling-process" 
                    variant="light" 
                    color="myColor"
                    radius="xl"
                    rightSection={<IconArrowRight size={16} />}
                >
                    Learn how the recycling process works
                </Button>
            </Box>
            <Grid gutter="xl" mb={60}>
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <RecyclingInputs 
                        gasType={gasType}
                        setGasType={setGasType}
                        annualMixedGas={annualMixedGas}
                        setAnnualMixedGas={setAnnualMixedGas}
                        h2Concentration={h2Concentration}
                        setH2Concentration={setH2Concentration}
                        h2Price={h2Price}
                        setH2Price={setH2Price}
                        systemPrice={systemPrice}
                        setSystemPrice={setSystemPrice}                    
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Card shadow="sm" padding="lg" radius="md" withBorder h="100%" bg="gray.0">
                        <Title order={3} mb="xl">Estimation Results</Title>
                        
                        <Group justify="space-between" mb="xs">
                            <Text fw={500}>System Complexity :</Text>
                            <Badge color={complexityColor} size="lg" variant="light">{complexity}</Badge>
                        </Group>
                        <Text size="sm" c="dimmed" mb="xl">
                            {advice}
                        </Text>

                        {gasType ? (
                            <Box mt="xl">
                                <Paper p="md" radius="md" withBorder bg="white" mb="md">
                                    <Group align="center" gap="sm">
                                        <IconRecycle size={32} color="var(--mantine-color-blue-6)" />
                                        <div>
                                            <Text size="sm" c="dimmed" fw={500}>Recovered Hydrogen</Text>
                                            <Text size="xl" fw={900} c="blue.7">
                                                {annualRecoveredH2Kg.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} kg / year
                                            </Text>
                                        </div>
                                    </Group>
                                </Paper>
                                <Paper p="md" radius="md" withBorder bg="white" mb="md">
                                    <Group align="center" gap="sm">
                                        <IconCoin size={32} color="var(--mantine-color-teal-6)" />
                                        <div>
                                            <Text size="sm" c="dimmed" fw={500}>Estimated Gross Savings</Text>
                                            <Text size="xl" fw={900} c="teal.6">
                                                {annualSavings.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} € / year
                                            </Text>
                                        </div>
                                    </Group>
                                </Paper>
                                <Paper p="md" radius="md" withBorder bg="var(--mantine-color-myColor-0)" style={{ borderColor: 'var(--mantine-color-myColor-3)' }}>
                                    <Group align="center" gap="sm">
                                        <IconClockHour4 size={32} color="var(--mantine-color-myColor-9)" />
                                        <div>
                                            <Text size="sm" c="dimmed" fw={500}>Return on Investment (ROI)</Text>
                                            <Text size="xl" fw={900} c="myColor.9">
                                                {roiYears.toFixed(1)} years
                                            </Text>
                                        </div>
                                    </Group>
                                </Paper>
                            </Box>
                        ) : (
                            <Paper p="xl" radius="md" mt="xl" bg="white" style={{ borderStyle: 'dashed', borderWidth: 2, borderColor: 'var(--mantine-color-gray-3)' }}>
                                <Text ta="center" c="dimmed">
                                    Select a mixed gas type on the left to see your potential savings and ROI.
                                </Text>
                            </Paper>
                        )}
                        <Box mt="auto" pt="xl">
                            <Text size="xs" c="dimmed" ta="center">
                                *Calculations assume a recovery rate of {recoveryRate * 100}%. Real-world implementation requires a technical audit.
                            </Text>
                        </Box>
                    </Card>
                </Grid.Col>
            </Grid>
            <Paper radius="md" p="xl" bg="var(--mantine-primary-color-filled)" c="white" ta="center">
                <Title order={2} mb="md" c="white">Want to Learn More?</Title>
                <Text size="lg" mb="xl" maw={600} mx="auto">
                    Hydrogen recycling systems are highly specific to the gas mixtures and processes involved. If you need more detailed information, research data, or want to discuss a specific use case, feel free to reach out.
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
                    Contact Us for More Information
                </Button>
            </Paper>
        </Container>
    );
}

function RecyclingInputs ({
    gasType,
    setGasType,
    annualMixedGas,
    setAnnualMixedGas,
    h2Concentration,
    setH2Concentration,
    h2Price,
    setH2Price,
    systemPrice,
    setSystemPrice
}){
    return(
        <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Title order={3} mb="md">Exhaust Gas Parameters</Title>
            
            <Select
                label="Mixed Gas Type (What is mixed with H₂?)"
                placeholder="Select secondary gas"
                data={gasOptions}
                value={gasType}
                onChange={setGasType}
                mb="md"
            />
            <ValueInput
                label="Annual Mixed Gas Produced"
                value={annualMixedGas}
                onValueChange={setAnnualMixedGas}
                units={[{ label: "m³/year", factor: 1 }]}
                currentUnit={{ label: "m³/year", factor: 1 }}
            />
            <SliderInput
                label="H₂ Concentration in Exhaust"
                value={h2Concentration}
                onValueChange={setH2Concentration}
                units="%"
                min={5}
                max={95}
            />
            <Divider my="md" />
            <Title order={4} mb="sm" c="dimmed">Financials & Investment</Title>
            <ValueInput
                label="Current Green H₂ Purchase Price"
                value={h2Price}
                onValueChange={setH2Price}
                units={[{ label: "€/kg", factor: 1 }]}
                currentUnit={{ label: "€/kg", factor: 1 }}
            />
            <ValueInput
                label="Estimated Recycling System Price (CAPEX)"
                value={systemPrice}
                onValueChange={setSystemPrice}
                units={[{ label: "€", factor: 1 }]}
                currentUnit={{ label: "€", factor: 1 }}
            />
        </Card>
    )
}