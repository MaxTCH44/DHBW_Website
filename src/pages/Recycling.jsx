import { useState, useMemo } from 'react';
import { Container, Title, Text, Grid, Card, Group, Badge, Box, Select, Paper, Button, Divider, Modal, Anchor } from '@mantine/core';
import { useMediaQuery, useSessionStorage } from '@mantine/hooks';
import { IconMail, IconRecycle, IconCoin, IconClockHour4, IconArrowRight, IconLeaf } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { t } from 'i18next';

import gasData from '../data/recycling_gases.json';

import SliderInput from '../components/SliderInput';
import ValueInput from '../components/ValueInput';
import LabelWithTooltip from '../components/LabelWithTooltip';
import { ELEC_PRICE_UNITS, H2_VOLUME_POWER_UNITS, MAINTENANCE_UNITS, H2_VOLUME_PRICE_UNITS } from '../components/calculator/calculatorConstants';

// --- DATA INITIALIZATION ---
// Extracts just the 'value' strings from the JSON array to populate the Select component
const gasOptions = gasData.map(gas => gas.value);

/**
 * Main component for the Hydrogen Recycling Calculator.
 * It evaluates the financial viability (ROI) and physical yield of capturing and recycling 
 * mixed exhaust gases instead of venting them into the atmosphere.
 */
export default function Recycling() {
    const isMobile = useMediaQuery('(max-width: 768px)');

    const { t } = useTranslation("recycling");

    const [resetModalOpened, setResetModalOpened] = useState(false);
    function handleResetDefaults(){
        sessionStorage.clear(); 
        window.location.reload(); 
    };

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
        const info = gasData.find(gas => t(gas.value) === gasType);
        
        // Default fallbacks before the user selects a gas
        const comp = info ? info.complexity : "gasRecoveryAdvices.default.complexity";
        const color = info ? info.complexityColor : "gray";
        const rate = info ? info.recovery_rate : 0;
        const adv = info ? info.advice : "gasRecoveryAdvices.default.advice";
        
        // --- CALCULATIONS ---
        // 1. Calculate raw hydrogen volume in the exhaust stream
        const annualH2Volume = annualMixedGas * (h2Concentration / 100);
        // 2. Convert volumetric flow (m³) to mass (kg). The density factor used here is roughly 11.1 m³ per kg of H2 at standard conditions.
        const annualH2Kg = annualH2Volume / 11.126; 
        // 3. Apply the system's technical recovery efficiency (e.g., PSA systems rarely recover 100%)
        const recoveredKg = annualH2Kg * rate;
        
        // 4. Financials
        const totalElectricityPrice = recoveredKg * energyConsumption * electricityPrice.value * electricityPrice.unit.factor 
        const savings = recoveredKg * h2Price;
        const annualOpex = systemPrice * (annualOpexRate / 100) + totalElectricityPrice;
        const netAnnualSavings = savings - annualOpex;
        const roi = netAnnualSavings > 0 ? systemPrice / netAnnualSavings : null;

        //5. Avoided CO2
        const CO2_GRID_INTENSITY = 0.295; // kg CO₂/kWh — EU grid mix 2024
        const H2_GWP = 11.6; // kg CO₂eq/kg H₂ vented — IPCC AR6 2023

        //0 because we assume it's green energy
        const co2Avoided = (recoveredKg * H2_GWP) - 0; // kg CO₂eq/year
        const co2AvoidedTons = co2Avoided / 1000; // tCO₂eq/year

        return {
            complexity: comp,
            complexityColor: color,
            recoveryRate: rate,
            advice: adv,
            annualRecoveredH2Kg: recoveredKg,
            annualSavings: savings,
            roiYears: roi,
            co2Avoided: co2AvoidedTons
        };
    }, [gasType, annualMixedGas, h2Concentration, h2Price, systemPrice, annualOpexRate, energyConsumption, electricityPrice]);

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
                                                {annualRecoveredH2Kg.toLocaleString('de-DE', { maximumFractionDigits: 0 })} {t("units.kg_per_year")}
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
                                                {annualSavings.toLocaleString('de-DE', { maximumFractionDigits: 0 })} {t("units.eur_per_year")}
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
                                                    ? `${co2Avoided.toLocaleString('de-DE', { maximumFractionDigits: 1 })} ${t("units.tons")}` 
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
                                                    ? `${roiYears.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} ${t("units.years")}`
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
    setSystemPrice,
    annualOpexRate,
    setAnnualOpexRate,
    energyConsumption,
    setEnergyConsumption,
    electricityPrice,
    setElectricityPrice
}){
    const { t } = useTranslation("recycling");
    return(
        <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Title order={3} mb="md">
                {t("recyclingForm.exhaustGasParametersTitle")}
            </Title>
            
            <Select
                label={
                    <LabelWithTooltip
                        label={t("recyclingForm.mixedGasType.label")}
                        tooltip={t("recyclingForm.mixedGasType.tooltip")}
                    />
                }
                placeholder={t("recyclingForm.mixedGasType.placeholder")}
                data={gasOptions.map(gas => t(gas))}
                value={gasType}
                onChange={setGasType}
                mb="md"
            />

            <ValueInput
                label={
                    <LabelWithTooltip
                        label={t("recyclingForm.annualMixedGasProduced.label")}
                        tooltip={t("recyclingForm.annualMixedGasProduced.tooltip")}
                    />
                }
                value={annualMixedGas}
                onValueChange={setAnnualMixedGas}
                units="units.normalized_m3_per_year"
                currentUnit="units.normalized_m3_per_year"
                namespace="recycling"
            />

            <SliderInput
                label={
                    <LabelWithTooltip
                        label={t("recyclingForm.h2Concentration.label")}
                        tooltip={t("recyclingForm.h2Concentration.tooltip")}
                    />
                }
                value={h2Concentration}
                onValueChange={setH2Concentration}
                units="%"
                min={5}
                max={95}
            />
            
            <Divider my="md" />
            
            <Title order={4} mb="sm" c="dimmed">
                {t("recyclingForm.financialsTitle")}
            </Title>

            <ValueInput
                label={
                    <LabelWithTooltip
                        label={t("recyclingForm.currentH2PurchasePrice.label")}
                        tooltip={t("recyclingForm.currentH2PurchasePrice.tooltip")}
                    />
                }
                units={H2_VOLUME_PRICE_UNITS}
                currentUnit={h2Price.unit}
                value={h2Price.value}
                onValueChange={val => setH2Price({...h2Price, value: val})}
                onUnitChange={u => setH2Price({...h2Price, unit: u})}
                namespace="recycling"
            />

            <ValueInput
                label={
                    <LabelWithTooltip
                        label={t("recyclingForm.recyclingSystemPrice.label")}
                        tooltip={t("recyclingForm.recyclingSystemPrice.tooltip")}
                    />
                }
                value={systemPrice}
                onValueChange={setSystemPrice}
                units="units.eur"
                currentUnit="units.eur"
                namespace="recycling"
            />

            <ValueInput
                label={
                    <LabelWithTooltip
                        label={t("recyclingForm.maintenanceCosts.label")}
                        tooltip={t("recyclingForm.maintenanceCosts.tooltip")}
                    />
                }
                units={MAINTENANCE_UNITS}
                currentUnit={annualOpexRate.unit}
                value={annualOpexRate.value}
                namespace="recycling"
                onValueChange={val => setAnnualOpexRate({ ...annualOpexRate, value: val })}
                onUnitChange={u => setAnnualOpexRate({ ...annualOpexRate, unit: u })}
            />

            <ValueInput
                label={
                    <LabelWithTooltip
                        label={t("recyclingForm.energyConsumption.label")}
                        tooltip={t("recyclingForm.energyConsumption.tooltip")}
                    />
                }
                units={H2_VOLUME_POWER_UNITS}
                currentUnit={energyConsumption.unit}
                value={energyConsumption.value}
                namespace="recycling"
                onValueChange={val => setEnergyConsumption({ ...energyConsumption, value: val })}
                onUnitChange={u => setEnergyConsumption({ ...energyConsumption, unit: u })}
            />

            <ValueInput
                label={
                    <LabelWithTooltip
                        label={t("recyclingForm.electricityPrice.label")}
                        tooltip={t("recyclingForm.electricityPrice.tooltip")}
                    />
                }
                units={ELEC_PRICE_UNITS}
                currentUnit={electricityPrice.unit}
                value={electricityPrice.value}
                namespace="recycling"
                onValueChange={val => setElectricityPrice({ ...electricityPrice, value: val })}
                onUnitChange={u => setElectricityPrice({ ...electricityPrice, unit: u })}
            />
        </Card>
    )
}