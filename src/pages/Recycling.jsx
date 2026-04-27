import { useState, useMemo } from 'react';
import { Container, Title, Text, Grid, Card, Group, Badge, Box, Select, Paper, Button, Divider } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconMail, IconRecycle, IconCoin, IconClockHour4, IconArrowRight } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

import gasData from '../data/recycling_gases.json';

import SliderInput from '../components/SliderInput';
import ValueInput from '../components/ValueInput';

// --- DATA INITIALIZATION ---
// Extracts just the 'value' strings from the JSON array to populate the Select component
const gasOptions = gasData.map(gas => gas.value);

// Local constants for ValueInput units, preventing inline object recreation on every render
const UNIT_M3_YEAR = { label: "m³/year", factor: 1 };
const UNITS_M3_YEAR_ARRAY = [UNIT_M3_YEAR];

const UNIT_EUR_KG = { label: "€/kg", factor: 1 };
const UNITS_EUR_KG_ARRAY = [UNIT_EUR_KG];

const UNIT_EUR = { label: "€", factor: 1 };
const UNITS_EUR_ARRAY = [UNIT_EUR];

/**
 * Main component for the Hydrogen Recycling Calculator.
 * It evaluates the financial viability (ROI) and physical yield of capturing and recycling 
 * mixed exhaust gases instead of venting them into the atmosphere.
 */
export default function Recycling() {
    const isMobile = useMediaQuery('(max-width: 768px)');

    // --- STATE MANAGEMENT ---
    const [gasType, setGasType] = useState(null);
    const [annualMixedGas, setAnnualMixedGas] = useState(10000);
    const [h2Concentration, setH2Concentration] = useState(40);
    
    // Financial baselines to calculate the Return on Investment (ROI)
    const [h2Price, setH2Price] = useState(6.11); 
    const [systemPrice, setSystemPrice] = useState(25000);

    // --- CORE MATH & LOGIC ---
    // useMemo prevents recalculating the physics and financials unless the input states actually change.
    const { 
        complexity, 
        complexityColor, 
        recoveryRate, 
        advice, 
        annualRecoveredH2Kg, 
        annualSavings, 
        roiYears 
    } = useMemo(() => {
        // Find the technical parameters corresponding to the user's selected gas mixture
        const info = gasData.find(gas => gas.value === gasType);
        
        // Default fallbacks before the user selects a gas
        const comp = info ? info.complexity : "Select a gas type";
        const color = info ? info.complexityColor : "gray";
        const rate = info ? info.recovery_rate : 0;
        const adv = info ? info.advice : "Please provide details about your mixed gas to get a preliminary assessment.";

        // --- CALCULATIONS ---
        // 1. Calculate raw hydrogen volume in the exhaust stream
        const annualH2Volume = annualMixedGas * (h2Concentration / 100);
        // 2. Convert volumetric flow (m³) to mass (kg). The density factor used here is roughly 11.1 m³ per kg of H2 at standard conditions.
        const annualH2Kg = annualH2Volume / 11.1; 
        // 3. Apply the system's technical recovery efficiency (e.g., PSA systems rarely recover 100%)
        const recoveredKg = annualH2Kg * rate;
        
        // 4. Financials
        const savings = recoveredKg * h2Price;
        const roi = savings > 0 ? systemPrice / savings : null;

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
            {/* --- PAGE HEADER --- */}
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
                {/* --- LEFT COLUMN: INPUTS --- */}
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

                {/* --- RIGHT COLUMN: RESULTS DASHBOARD --- */}
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

                        {/* Renders the financial metrics ONLY if the user has selected a valid gas mixture */}
                        {gasType ? (
                            <Box mt="xl">
                                {/* Recovered Yield */}
                                <Paper p="md" radius="md" withBorder bg="white" mb="md">
                                    <Group align="center" gap="sm">
                                        <IconRecycle size={32} color="var(--mantine-color-blue-6)" />
                                        <div>
                                            <Text size="sm" c="dimmed" fw={500}>Recovered Hydrogen</Text>
                                            <Text size="xl" fw={900} c="blue.7">
                                                {annualRecoveredH2Kg.toLocaleString('de-DE', { maximumFractionDigits: 0 })} kg / year
                                            </Text>
                                        </div>
                                    </Group>
                                </Paper>

                                {/* Financial Savings */}
                                <Paper p="md" radius="md" withBorder bg="white" mb="md">
                                    <Group align="center" gap="sm">
                                        <IconCoin size={32} color="var(--mantine-color-teal-6)" />
                                        <div>
                                            <Text size="sm" c="dimmed" fw={500}>Estimated Gross Savings</Text>
                                            <Text size="xl" fw={900} c="teal.6">
                                                {annualSavings.toLocaleString('de-DE', { maximumFractionDigits: 0 })} € / year
                                            </Text>
                                        </div>
                                    </Group>
                                </Paper>

                                {/* ROI Projection */}
                                <Paper p="md" radius="md" withBorder bg="var(--mantine-color-myColor-0)" style={{ borderColor: 'var(--mantine-color-myColor-3)' }}>
                                    <Group align="center" gap="sm">
                                        <IconClockHour4 size={32} color="var(--mantine-color-myColor-9)" />
                                        <div>
                                            <Text size="sm" c="dimmed" fw={500}>Return on Investment (ROI)</Text>
                                            <Text size="xl" fw={900} c="myColor.9">
                                                {roiYears !== null 
                                                    ? `${roiYears.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} years`
                                                    : "N/A"}
                                            </Text>
                                        </div>
                                    </Group>
                                </Paper>
                            </Box>
                        ) : (
                            // Placeholder shown when no gas is selected
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

            {/* --- CALL TO ACTION (CTA) --- */}
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

/**
 * Sub-component isolating the input form for the recycling calculator.
 * Passing down the state and setters keeps the main component cleaner.
 * * @param {Object} props
 * @param {string|null} props.gasType - The selected mixed gas matrix.
 * @param {Function} props.setGasType - Setter for the gas type.
 * @param {number} props.annualMixedGas - The total volume of exhaust gas produced per year.
 * @param {Function} props.setAnnualMixedGas - Setter for the annual mixed gas volume.
 * @param {number} props.h2Concentration - The percentage of pure hydrogen inside the exhaust gas.
 * @param {Function} props.setH2Concentration - Setter for the H2 concentration.
 * @param {number} props.h2Price - Current baseline cost of hydrogen per kg.
 * @param {Function} props.setH2Price - Setter for the baseline H2 price.
 * @param {number} props.systemPrice - Estimated CAPEX for the recycling plant.
 * @param {Function} props.setSystemPrice - Setter for the recycling system CAPEX.
 */
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
                units={UNITS_M3_YEAR_ARRAY}
                currentUnit={UNIT_M3_YEAR}
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
                units={UNITS_EUR_KG_ARRAY}
                currentUnit={UNIT_EUR_KG}
            />
            <ValueInput
                label="Estimated Recycling System Price (CAPEX)"
                value={systemPrice}
                onValueChange={setSystemPrice}
                units={UNITS_EUR_ARRAY}
                currentUnit={UNIT_EUR}
            />
        </Card>
    )
}