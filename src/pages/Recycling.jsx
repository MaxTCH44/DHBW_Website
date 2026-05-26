import { useState, useMemo } from 'react';
import { Container, Title, Text, Grid, Card, Group, Badge, Box, Paper, Button, Modal, Anchor } from '@mantine/core';
import { useMediaQuery, useSessionStorage } from '@mantine/hooks';
import { IconMail, IconRecycle, IconCoin, IconClockHour4, IconArrowRight, IconLeaf } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { t } from 'i18next';

import gasData from '../data/recycling_gases.json';

import { ELEC_PRICE_UNITS, H2_VOLUME_POWER_UNITS, MAINTENANCE_UNITS, H2_VOLUME_PRICE_UNITS } from '../components/calculator/calculatorConstants';
import RecyclingInputs from '../components/calculator/RecyclingInputs';

/**
 * Main component for the Hydrogen Recycling Calculator.
 * It evaluates the financial viability (ROI) and physical yield of capturing and recycling 
 * mixed exhaust gases instead of venting them into the atmosphere.
 */
export default function Recycling() {
    const isMobile = useMediaQuery('(max-width: 768px)');

    const { t, i18n } = useTranslation("recycling");

    const [resetModalOpened, setResetModalOpened] = useState(false);
    
    function handleResetDefaults() {
        Object.keys(sessionStorage)
            .filter(key => key.startsWith('recycling-'))
            .forEach(key => sessionStorage.removeItem(key));
        window.location.reload();
    }

    // --- STATE MANAGEMENT ---
    const [gasType, setGasType] = useSessionStorage({
        key: 'recycling-gas-type',
        defaultValue: null,
        getInitialValueInEffect: false
    });
    const [annualMixedGas, setAnnualMixedGas] = useSessionStorage({
        key: 'recycling-annual-mixed-gas',
        defaultValue: 10000,
        getInitialValueInEffect: false
    });
    const [h2Concentration, setH2Concentration] = useSessionStorage({
        key: 'recycling-h2-concentration',
        defaultValue: 40,
        getInitialValueInEffect: false
    });
    
    // Financial baselines to calculate the Return on Investment (ROI)
    const [energyConsumption, setEnergyConsumption] = useSessionStorage({
        key: 'recycling-energy-consumption',
        defaultValue: { value: 11, unit: H2_VOLUME_POWER_UNITS[0] },
        getInitialValueInEffect: false
    });

    const [electricityPrice, setElectricityPrice] = useSessionStorage({
        key: 'calc-electricity-price',
        defaultValue: { value: 89, unit: ELEC_PRICE_UNITS[0] },
        getInitialValueInEffect: false
    });

    const [h2Price, setH2Price] = useSessionStorage({
        key: 'recycling-h2-price',
        defaultValue: { value: 6.11, unit: H2_VOLUME_PRICE_UNITS[0] },
        getInitialValueInEffect: false
    });
    const [systemPrice, setSystemPrice] = useSessionStorage({
        key: 'recycling-system-price',
        defaultValue: 25000,
        getInitialValueInEffect: false
    });
    const [annualOpexRate, setAnnualOpexRate] = useSessionStorage({
        key: 'recycling-annualOpexRate',
        defaultValue: { value: 3, unit: MAINTENANCE_UNITS[0] },
        getInitialValueInEffect: false
    });

    // --- CORE MATH & LOGIC ---
    // useMemo prevents recalculating the physics and financials unless the input states actually change.
    const { 
        complexity, 
        complexityColor, 
        recoveryRate, 
        advice, 
        annualRecoveredH2Kg, 
        annualSavings, 
        roiYears,
        co2Avoided
    } = useMemo(() => {
        // Find the technical parameters corresponding to the user's selected gas mixture
        const info = gasData.find(gas => gas.value === gasType);
        
        // Default fallbacks before the user selects a gas
        const comp = info ? info.complexity : "gasRecoveryAdvices.default.complexity";
        const color = info ? info.complexityColor : "gray";
        const rate = info ? info.recovery_rate : 0;
        const adv = info ? info.advice : "gasRecoveryAdvices.default.advice";
        
        // --- 1. VOLUMETRIC & MASS CALCULATIONS ---
        const annualH2Volume = annualMixedGas * (h2Concentration / 100);
        
        // Convert volumetric flow (Nm³) to mass (kg). 
        // Using 11.1 to strictly match the factor in calculatorConstants.js
        const annualH2Kg = annualH2Volume / 11.1; 
        const recoveredKg = annualH2Kg * rate;
        
        // --- 2. ENERGY & UNIT FACTORS ---
        // Convert to kWh/kg
        const energyPerKg = energyConsumption.value * energyConsumption.unit.factor; 
        // Convert to €/kWh
        const elecPricePerKwh = electricityPrice.value * electricityPrice.unit.factor; 
        // Convert to €/kg
        const h2PricePerKg = h2Price.value * h2Price.unit.factor; 

        // --- 3. FINANCIALS ---
        const totalElectricityPrice = recoveredKg * energyPerKg * elecPricePerKwh; 
        const savings = recoveredKg * h2PricePerKg;

        // Check if OPEX is a percentage of CAPEX or a flat € rate
        const isOpexPercent = annualOpexRate.unit.label === "units.percent_capex";
        const maintenanceCost = isOpexPercent
            ? systemPrice * (annualOpexRate.value / 100)
            : annualOpexRate.value;

        const annualOpex = maintenanceCost + totalElectricityPrice;
        const netAnnualSavings = savings - annualOpex;
        
        // Prevent division by zero or negative ROI calculation
        const roi = netAnnualSavings > 0 ? systemPrice / netAnnualSavings : null;

        // --- 4. AVOIDED EMISSIONS (CO2) ---
        const CO2_GRID_INTENSITY = 0.295; // kg CO₂/kWh — EU grid mix 2024
        const H2_GWP = 11.6; // kg CO₂eq/kg H₂ vented — IPCC AR6 2023

        // Calculate the emissions generated by running the recycling equipment
        const recyclingEmissions = (recoveredKg * energyPerKg) * CO2_GRID_INTENSITY;
        
        //0 because we assume it's green energy
        const co2AvoidedKg = (recoveredKg * H2_GWP) - 0; 
        const co2AvoidedTons = co2AvoidedKg / 1000;

        return {
            complexity: comp,
            complexityColor: color,
            recoveryRate: rate,
            advice: adv,
            annualRecoveredH2Kg: recoveredKg,
            annualSavings: savings, // Kept as gross savings to match your UI label "Estimated Gross Savings"
            roiYears: roi,
            co2Avoided: co2AvoidedTons
        };
    }, [
        gasType, 
        annualMixedGas, 
        h2Concentration, 
        h2Price, 
        systemPrice, 
        annualOpexRate, 
        energyConsumption, 
        electricityPrice,
        t
    ]);

    return (
        <Container size="xl" px="xl" py="lg" mt="150px">
            {/* --- PAGE HEADER --- */}
            <Box mb={20} ta="center">
                <Title order={1} c="dark.7" mb="md">
                    {t("recyclingCalculatorPage.header.title")}
                </Title>

                <Text size="lg" c="dimmed" maw={800} mx="auto" mb="md">
                    {t("recyclingCalculatorPage.header.description")}
                </Text>

                <Button 
                    component={Link} 
                    to="/recycling-process" 
                    variant="light" 
                    color="myColor"
                    radius="xl"
                    rightSection={<IconArrowRight size={16} />}
                >
                    {t("recyclingCalculatorPage.header.learnMoreButton")}
                </Button>
            </Box>

            <Box mb={10} ta="center">
                <Anchor 
                    component="button" 
                    type="button" 
                    size="sm" 
                    c="dimmed" 
                    mb="xs" 
                    onClick={() => setResetModalOpened(true)}
                >
                    {t("recyclingCalculatorPage.reset.link")}
                </Anchor>

                <Modal 
                    opened={resetModalOpened} 
                    onClose={() => setResetModalOpened(false)} 
                    title={t("recyclingCalculatorPage.reset.modalTitle")}
                    centered
                >
                    <Text size="sm" mb="xl">
                        {t("recyclingCalculatorPage.reset.modalDescription")}
                    </Text>

                    <Group justify="flex-end">
                        <Button variant="default" onClick={() => setResetModalOpened(false)}>
                            {t("recyclingCalculatorPage.reset.cancelButton")}
                        </Button>

                        <Button color="red" onClick={handleResetDefaults}>
                            {t("recyclingCalculatorPage.reset.confirmButton")}
                        </Button>
                    </Group>
                </Modal>
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
                        annualOpexRate={annualOpexRate}
                        setAnnualOpexRate={setAnnualOpexRate}
                        energyConsumption={energyConsumption}
                        setEnergyConsumption={setEnergyConsumption}
                        electricityPrice={electricityPrice}
                        setElectricityPrice={setElectricityPrice}                 
                    />
                </Grid.Col>

                {/* --- RIGHT COLUMN: RESULTS DASHBOARD --- */}
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Card shadow="sm" padding="lg" radius="md" withBorder h="100%" bg="gray.0">
                        <Title order={3} mb="xl">
                            {t("recyclingCalculatorPage.results.title")}
                        </Title>
                        
                        <Group justify="space-between" mb="xs">
                            <Text fw={500}>
                                {t("recyclingCalculatorPage.results.systemComplexity")}
                            </Text>

                            <Badge color={complexityColor} size="lg" variant="light">
                                {t(complexity)}
                            </Badge>
                        </Group>

                        <Text size="sm" c="dimmed" mb="xl">
                            {t(advice)}
                        </Text>

                        {/* Renders the financial metrics ONLY if the user has selected a valid gas mixture */}
                        {gasType ? (
                            <Box mt="xl">
                                {/* Recovered Yield */}
                                <Paper p="md" radius="md" withBorder bg="white" mb="md">
                                    <Group align="center" gap="sm">
                                        <IconRecycle size={32} color="var(--mantine-color-blue-6)" />

                                        <div>
                                            <Text size="sm" c="dimmed" fw={500}>
                                                {t("recyclingCalculatorPage.results.recoveredHydrogen")}
                                            </Text>

                                            <Text size="xl" fw={900} c="blue.7">
                                                {annualRecoveredH2Kg.toLocaleString(i18n.language, { maximumFractionDigits: 0 })} {t("units.kg_per_year")}
                                            </Text>
                                        </div>
                                    </Group>
                                </Paper>

                                {/* Financial Savings */}
                                <Paper p="md" radius="md" withBorder bg="white" mb="md">
                                    <Group align="center" gap="sm">
                                        <IconCoin size={32} color="var(--mantine-color-teal-6)" />

                                        <div>
                                            <Text size="sm" c="dimmed" fw={500}>
                                                {t("recyclingCalculatorPage.results.estimatedGrossSavings")}
                                            </Text>

                                            <Text size="xl" fw={900} c="teal.6">
                                                {annualSavings.toLocaleString(i18n.language, { maximumFractionDigits: 0 })} {t("units.eur_per_year")}
                                            </Text>
                                        </div>
                                    </Group>
                                </Paper>

                                {/* Avoided CO2 */}
                                <Paper p="md" radius="md" withBorder bg="white" mb="md">
                                    <Group align="center" gap="sm">
                                        <IconLeaf size={32} color="var(--mantine-color-myColor-9)" />

                                        <div>
                                            <Text size="sm" c="dimmed" fw={500}>
                                                {t("recyclingCalculatorPage.results.avoidedCo2")}
                                            </Text>

                                            <Text size="xl" fw={900} c="myColor.9">
                                                {co2Avoided !== null 
                                                    ? `${co2Avoided.toLocaleString(i18n.language, { maximumFractionDigits: 1 })} ${t("units.tons")}` 
                                                    : "0"
                                                }
                                            </Text>
                                        </div>
                                    </Group>
                                </Paper>

                                {/* ROI Projection */}
                                <Paper p="md" radius="md" withBorder bg="var(--mantine-color-myColor-0)" style={{ borderColor: 'var(--mantine-color-myColor-3)' }}>
                                    <Group align="center" gap="sm">
                                        <IconClockHour4 size={32} color="var(--mantine-color-myColor-9)" />

                                        <div>
                                            <Text size="sm" c="dimmed" fw={500}>
                                                {t("recyclingCalculatorPage.results.roi")}
                                            </Text>

                                            <Text size="xl" fw={900} c="myColor.9">
                                                {roiYears !== null 
                                                    ? `${roiYears.toLocaleString(i18n.language, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} ${t("units.years")}`
                                                    : t("recyclingCalculatorPage.results.never")
                                                }
                                            </Text>
                                        </div>
                                    </Group>
                                </Paper>
                            </Box>
                        ) : (
                            // Placeholder shown when no gas is selected
                            <Paper 
                                p="xl" 
                                radius="md" 
                                mt="xl" 
                                bg="white" 
                                style={{ borderStyle: 'dashed', borderWidth: 2, borderColor: 'var(--mantine-color-gray-3)' }}
                            >
                                <Text ta="center" c="dimmed">
                                    {t("recyclingCalculatorPage.results.placeholder")}
                                </Text>
                            </Paper>
                        )}

                        <Box mt="auto" pt="xl">
                            <Text size="xs" c="dimmed" ta="center">
                                {t("recyclingCalculatorPage.results.footer", {
                                    rate: recoveryRate * 100
                                })}
                            </Text>
                        </Box>
                    </Card>
                </Grid.Col>
            </Grid>

            {/* --- CALL TO ACTION (CTA) --- */}
            <Paper radius="md" p="xl" bg="var(--mantine-primary-color-filled)" c="white" ta="center">
                <Title order={2} mb="md" c="white">
                    {t("recyclingCalculatorPage.cta.title")}
                </Title>

                <Text size="lg" mb="xl" maw={600} mx="auto">
                    {t("recyclingCalculatorPage.cta.description")}
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
                    {t("recyclingCalculatorPage.cta.button")}
                </Button>
            </Paper>
        </Container>
    );
}