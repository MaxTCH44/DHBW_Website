import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Container, Title, SimpleGrid, Card, Text, Stack, SegmentedControl, Tooltip, ActionIcon, Box, Center, Modal, Anchor, Group, Button } from '@mantine/core';
import { IconQuestionMark, IconDownload } from '@tabler/icons-react';
import { useSessionStorage, useLocalStorage, useDidUpdate } from '@mantine/hooks';
import { useTranslation } from 'react-i18next';

import electrolyzers from '../data/calculator/electrolyzers_list.json';
import compressors from '../data/calculator/compressors_list.json';
import advices from '../data/calculator/calculator_advices.json';

import ValueInput from '../components/ValueInput.jsx';
import ResultDisplay from '../components/calculator/ResultDisplay.jsx';
import LabelWithTooltip from '../components/LabelWithTooltip.jsx';
import AdviceCards from '../components/AdviceCards.jsx';
import { useCalculatorLogic } from '../components/calculator/useCalculatorLogic';
import { ELEC_PRICE_UNITS, POWER_UNITS, WATER_VOLUME_PRICE_UNITS, TIME_PER_YEAR_UNITS, VOLUME_PER_TIME_UNITS, H2_VOLUME_PRICE_UNITS, H2_VOLUME_POWER_UNITS, MAINTENANCE_UNITS } from '../components/calculator/calculatorConstants.js';
import ElectrolyzerSetup from '../components/calculator/ElectrolyzerSetup.jsx';
import ResourcesCosts from '../components/calculator/ResourcesCosts.jsx';
import CompressorSetup from '../components/calculator/CompressorSetup.jsx';
import { exportCSV } from '../utils/export-csv.js';
import { exportPDF } from '../utils/export-pdf.js';
import ComparisonSetup from '../components/calculator/ComparisonSetup.jsx';

const DEFAULT_CUSTOM_ELECTROLYZER = electrolyzers.list.find(e => e.id === 0);
const DEFAULT_CUSTOM_COMPRESSOR = compressors.list.find(e => e.id === 0);

/**
 * Main state manager and orchestrator for the Hydrogen Levelized Cost (LCOH) Calculator.
 * It acts as the "Single Source of Truth", holding all user inputs (from equipment specs to economic variables),
 * feeds them into the mathematical hook (`useCalculatorLogic`), and distributes the resulting data 
 * to the visual dashboard (`ResultDisplay`). It also controls the interactive tutorial overlay (`AdviceCards`).
 * * * Note: This component does not take external props. It initializes its state locally and via JSON imports.
 */
export default function Calculator() {

    const { t, i18n } = useTranslation("calculator");
    
    // --- 1. ELECTROLYZER STATE ---
    const [selectedElectrolyzer, setSelectedElectrolyzer] = useSessionStorage({
        key: 'calc-selected-electrolyzer',
        defaultValue: electrolyzers.list[0],
        getInitialValueInEffect: false
    });
    const [electrolyzerSettings, setElectrolyzerSettings] = useSessionStorage({
        key: 'calc-electrolyzer-settings',
        defaultValue: {
            owned: 0,
            ownedStacks: 0,
            maint_unit: MAINTENANCE_UNITS[0], 
            cons_unit: H2_VOLUME_POWER_UNITS[0]
        },
        getInitialValueInEffect: false
    });
    const [customElectrolyzer, setCustomElectrolyzer] = useSessionStorage({
        key: 'calc-custom-electrolyzer',
        defaultValue: DEFAULT_CUSTOM_ELECTROLYZER,
        getInitialValueInEffect: false
    });

    // --- 2. GLOBAL SIZING & OPERATIONAL STATE ---
    const [systemSize, setSystemSize] = useSessionStorage({
        key: 'calc-system-size',
        defaultValue: { value: selectedElectrolyzer.power, unit: POWER_UNITS[1], selfProduced: 0 },
        getInitialValueInEffect: false
    });
    const [operatingTime, setOperatingTime] = useSessionStorage({
        key: 'calc-operating-time',
        defaultValue: { value: 4000, unit: TIME_PER_YEAR_UNITS[1] },
        getInitialValueInEffect: false
    });
    
    // --- 3. MACRO-ECONOMIC & UTILITY STATE ---
    const [electricityPrice, setElectricityPrice] = useSessionStorage({
        key: 'calc-electricity-price',
        defaultValue: { value: 89, unit: ELEC_PRICE_UNITS[0] },
        getInitialValueInEffect: false
    });
    const [waterPrice, setWaterPrice] = useSessionStorage({
        key: 'calc-water-price',
        defaultValue: { value: 2, unit: WATER_VOLUME_PRICE_UNITS[0] },
        getInitialValueInEffect: false
    });
    const [currentHydrogenPrice, setCurrentHydrogenPrice] = useSessionStorage({
        key: 'calc-current-h2-price',
        defaultValue: {value : 6.11, unit: H2_VOLUME_PRICE_UNITS[0] },
        getInitialValueInEffect: false
    });
    const [greyHydrogenPrice, setGreyHydrogenPrice] = useSessionStorage({
        key: 'calc-grey-h2-price',
        defaultValue: {value : 3.5, unit: H2_VOLUME_PRICE_UNITS[0] },
        getInitialValueInEffect: false
    });
    const [carbonTax, setCarbonTax] = useSessionStorage({
        key: 'calc-carbon-tax',
        defaultValue: 50,
        getInitialValueInEffect: false
    });
    const [projectLifetime, setProjectLifetime] = useSessionStorage({
        key: 'calc-project-lifetime',
        defaultValue: 15,
        getInitialValueInEffect: false
    });
    const [inflationRate, setInflationRate] = useSessionStorage({
        key: 'calc-inflation-rate',
        defaultValue: 2,
        getInitialValueInEffect: false
    });

    // --- 4. COMPRESSOR STATE ---
    const [massToCompress, setMassToCompress] = useSessionStorage({
        key: 'calc-mass-to-compress',
        defaultValue: -1,
        getInitialValueInEffect: false
    });
    const [isCompressorNeeded, setIsCompressorNeeded] = useSessionStorage({
        key: 'calc-is-compressor-needed',
        defaultValue: true,
        getInitialValueInEffect: false
    });
    const [selectedCompressor, setSelectedCompressor] = useSessionStorage({
        key: 'calc-selected-compressor',
        defaultValue: compressors.list[0],
        getInitialValueInEffect: false
    });
    const [compressorSettings, setCompressorSettings] = useSessionStorage({
        key: 'calc-compressor-settings',
        defaultValue: {
            owned: 0,
            ownedStacks: 0,
            operatingTime: { value: 4000, unit: TIME_PER_YEAR_UNITS[1] },
            cons_unit: H2_VOLUME_POWER_UNITS[0],
            maint_unit: MAINTENANCE_UNITS[0],
            flow_unit: VOLUME_PER_TIME_UNITS[2]
        },
        getInitialValueInEffect: false
    });
    const [customCompressor, setCustomCompressor] = useSessionStorage({
        key: 'calc-custom-compressor',
        defaultValue: DEFAULT_CUSTOM_COMPRESSOR,
        getInitialValueInEffect: false
    });
    const [customSetups] = useLocalStorage({
        key: 'greenlab-custom-setups',
        defaultValue: [],
        getInitialValueInEffect: false
    });
    const combinedElectrolyzers = useMemo(() => {
        return {
            ...electrolyzers,
            list: [
                ...customSetups,
                ...electrolyzers.list
            ]     
        };
    }, [customSetups]);

    // --- 5. UI CONTROLS STATE ---
    // Tracks which accordions are open to show/hide advanced parameters
    const [openedSections, setOpenedSections] = useState({ electrolyzer: false, compressor: false, system: false, greyH2: false });
    // useSessionStorage ensures the user's mode preference (Simple/Advanced) persists even if they navigate away and come back
    const [isAdvancedMode, setIsAdvancedMode] = useLocalStorage({
        key: 'calculator-advanced-mode', 
        defaultValue: false,
        getInitialValueInEffect: false
    });
    const [showHelp, setShowHelp] = useState(false);
    const [resetHelp, setResetHelp] = useState(false);
    const [resetModalOpened, setResetModalOpened] = useState(false);

    const setResetHelpFalse = useCallback(() => {
        setResetHelp(false);
    }, []);

    const toggleSection = useCallback((section) => {
        setOpenedSections((prev) => ({
            ...prev,
            [section]: !prev[section]
        }));
    }, []);

    function handleResetDefaults() {
        Object.keys(sessionStorage)
            .filter(key => key.startsWith('calc-'))
            .forEach(key => sessionStorage.removeItem(key));
        window.location.reload();
    }

    const [exportError, setExportError] = useState(null);

    const handleExport = async (format) => {
        const inputs={
            selectedElectrolyzer, electrolyzerSettings,
            systemSize, operatingTime,
            electricityPrice, waterPrice,
            currentHydrogenPrice, greyHydrogenPrice,
            carbonTax, projectLifetime, inflationRate,
            isCompressorNeeded, selectedCompressor,
            compressorSettings, massToCompress,
        }
        const outputs={calcResults}

        setExportError(null);
        await new Promise(r => setTimeout(r, 50)); // laisse le DOM se mettre à jour
        try {
            if (format === 'csv') exportCSV(inputs, outputs, t, i18n.language);
            if (format === 'pdf') exportPDF(inputs, outputs, t, i18n.language);
        } catch (err) {
            setExportError(`${t('export.error')} --  ${err.message}`);
            setTimeout(() => setExportError(null), 4000);
        }
    };
    
    // --- 6. DYNAMIC CALCULATIONS & SAFETY LIMITS ---

    // Calculate maximum possible annual production to constrain the compressor mass limit
    const annualProd = ((systemSize.value * systemSize.unit.factor) * (operatingTime.value * operatingTime.unit.factor)) / selectedElectrolyzer.energy_consumption_kwh_per_kg;
    const prevMaxRef = useRef(Math.round(annualProd));

    // Safety Engine: Dynamically updates the "Mass to Compress" limit.
    // Prevents the impossible scenario where the user asks to compress more hydrogen than the plant actually produces.
    useEffect(() => {
        const newMax = Math.round(annualProd);
        const oldMax = prevMaxRef.current;
        setMassToCompress((currentMass) => {
            if (currentMass === oldMax || currentMass > newMax || currentMass < 0) {
                return newMax; // Auto-snap to the new maximum available production
            }
            return currentMass;
        });
        prevMaxRef.current = newMax;
    }, [annualProd]);

    useEffect(() => {
        const setupExists = combinedElectrolyzers.list.some(e => e.id === selectedElectrolyzer.id);
        
        if (!setupExists) {
            const baseCustom = electrolyzers.list.find(e => e.id === 0);

            setSelectedElectrolyzer(prev => ({
                ...prev,
                id: 0,
                name: baseCustom ? baseCustom.name : "Custom",
                isCustom: false
            }));
        }
    }, [combinedElectrolyzers, selectedElectrolyzer.id, setSelectedElectrolyzer]);

    // Keep Custom models synced in state so users don't lose their typed values when switching tabs
    useEffect(() => {
        if (selectedElectrolyzer.id === 0) {
            setCustomElectrolyzer(selectedElectrolyzer);
        }
    }, [selectedElectrolyzer]);

    useEffect(() => {
        if (selectedCompressor.id === 0) {
            setCustomCompressor(selectedCompressor);
        }
    }, [selectedCompressor]);

    // UI Engine: Toggling between Simple and Advanced modes requires strict data cleanup
    useDidUpdate(() => {
        if (!isAdvancedMode) {
            let activeElectrolyzer = selectedElectrolyzer;
            
            // "Custom" mode is too complex for Simple mode. We force a fallback to a standard commercial unit.
            if (selectedElectrolyzer.id === 0) {
                const fallback = electrolyzers.list.find(e => e.id !== 0);
                if (fallback) {
                    activeElectrolyzer = fallback;
                    setSelectedElectrolyzer(fallback);
                }
            }

            // In Simple mode, the system size MUST be a perfect multiple of the hardware's base power.
            // (e.g. You cannot buy 1.5 machines). We round the size to the nearest valid physical configuration.
            const currentPowerKw = systemSize.value * systemSize.unit.factor;
            const numberOfModules = Math.round(currentPowerKw / activeElectrolyzer.power);
            const validModules = Math.max(1, numberOfModules);

            // Close all advanced accordions
            const closedSections = Object.keys(openedSections).reduce((acc, key) => {
                acc[key] = false;
                return acc;
            }, {});
            setOpenedSections(closedSections);
            setShowHelp(false);

            setSystemSize({ 
                value: Number((validModules * activeElectrolyzer.power).toFixed(2)), 
                unit:  POWER_UNITS[1],
                selfProduced: 0 // Reset self-produced logic for Simple mode
            });
        }
    }, [isAdvancedMode]);

    // Inventory constraints: You cannot own more sub-components (stacks) than the total number of full units you own
    useEffect(() => {
        if ((electrolyzerSettings.owned) > (electrolyzerSettings.ownedStacks)) {
            setElectrolyzerSettings(prev => ({
                ...prev,
                ownedStacks: prev.owned
            }));
        }
        if (electrolyzerSettings.owned === 0 && electrolyzerSettings.ownedStacks === 1){
            setElectrolyzerSettings(prev => ({
                ...prev,
                ownedStacks: Math.max(0, prev.ownedStacks - 1)
            }));
        }
    }, [electrolyzerSettings.owned]);

    useEffect(() => {
        if ((compressorSettings.owned) > (compressorSettings.ownedStacks)) {
            setCompressorSettings(prev => ({
                ...prev,
                ownedStacks: prev.owned
            }));
        }
        if (compressorSettings.owned === 0 && compressorSettings.ownedStacks === 1){
            setCompressorSettings(prev => ({
                ...prev,
                ownedStacks: Math.max(0, prev.ownedStacks - 1)
            }));
        }
    }, [compressorSettings.owned]);

    // Filters the dropdown menu options based on the active mode (hides the 'Custom' option in Simple mode)
    const availableElectrolyzers = useMemo(() => {
        if (isAdvancedMode) {
            return combinedElectrolyzers;
        }
        return {
            ...combinedElectrolyzers,
            list: electrolyzers.list.filter(e => e.id !== 0)
        };
    }, [isAdvancedMode,combinedElectrolyzers]);

    // --- 7. EXECUTING THE CORE MATH HOOK ---
    const calcResults = useCalculatorLogic({
        annualProd,
        systemSize,
        selectedElectrolyzer,
        electrolyzerSettings,
        isCompressorNeeded,
        massToCompress,
        selectedCompressor,
        compressorSettings,
        projectLifetime,
        inflationRate,
        electricityPrice,
        carbonTax,
        greyHydrogenPrice,
        waterPrice,
        currentHydrogenPrice,
        operatingTime
    });

    const {
        electrolyzerQuantity,
        compressorQuantity,
        totalStacksNeeded,
        totalCompStacksNeeded,
        capex,
        showCellWarning,
        lcoh,
        costDifference,
        annualDifference,
        costBreakdown,
        extraMetrics,
        greyDetails,
        currentCostDifference, 
        currentAnnualDifference, 
        avoidedCO2
    } = calcResults;

    // --- 8. TUTORIAL (ADVICES) ENGINE ---
    // Dynamically filters the tutorial steps so the floating card doesn't ask the user 
    // to interact with components that are currently hidden (e.g., if compression is toggled off).
    const dynamicAdvices = useMemo(() => {
        return advices.filter(step => {
            if (step.showIfCompressor && selectedCompressor?.type !== step.showIfCompressor) {
                return false;
            }
            if ((step.isCompressorSection || step.openSection === "compressor") && !isCompressorNeeded) {
                return false;
            }
            if (step.isOwnedStackElectrolyser && step.openSection === "electrolyzer" && totalStacksNeeded === 1 && electrolyzerSettings.owned === 1){
                return false;
            }
            if (step.isOwnedStackCompressor && step.openSection === "compressor" && totalCompStacksNeeded === 1 && compressorSettings.owned === 1){
                return false;
            }
            return true;
        });
    }, [selectedCompressor?.type, isCompressorNeeded, electrolyzerSettings.owned, compressorSettings.owned, totalStacksNeeded, totalCompStacksNeeded, advices]);

    // --- 9. COMPARISON ---

    const [comparisonSetups, setComparisonSetups] = useLocalStorage({
        key: 'calc-comparison-setups',
        defaultValue: [],
        getInitialValueInEffect: false
    });

    // --- 10. RENDER ---
    return (
        <Container size="xl" px="xl" py="lg" mt="150px">
            
            <Title order={1} ta="center" mb="xl" c="dark.7">{t("title")}</Title>
            <Text c="dimmed" ta="center" maw={800} mx="auto" mb="xl">
                {t("introText")}
            </Text>

            <Center mb="md">
                <Box pos="relative">
                    <SegmentedControl
                        value={isAdvancedMode ? 'advanced' : 'simple'}
                        onChange={(val) => setIsAdvancedMode(val === 'advanced')}
                        data={[
                            { label: t("advanceToggle.simple"), value: 'simple' },
                            { label: t("advanceToggle.advanced"), value: 'advanced' },
                        ]}
                        bg="green.1"
                    />
                    {isAdvancedMode && (
                        <Tooltip 
                            label={t("advanceToggle.tooltipLabel")} 
                            withArrow 
                            position="right"
                        >
                            <ActionIcon 
                                variant="light" 
                                color="blue" 
                                radius="xl" 
                                size="lg"
                                onClick={() => {
                                    setShowHelp(true);
                                    setResetHelp(true);
                                }}
                                pos="absolute"
                                style={{
                                    left: 'calc(100% + 12px)', 
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                <IconQuestionMark size={20} stroke={2.5} />
                            </ActionIcon>
                        </Tooltip>
                    )}
                </Box>
            </Center>

            <Anchor 
                component="button" 
                type="button" 
                size="sm" 
                c="dimmed" 
                mb="xs" 
                onClick={() => setResetModalOpened(true)}
            >
                {t("reset")}
            </Anchor>

            <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="lg" style={{ alignItems: 'flex-start' }}>
                <ElectrolyzerSetup 
                    electrolyzers={combinedElectrolyzers}
                    systemSize={systemSize}
                    setSystemSize={setSystemSize}
                    operatingTime={operatingTime}
                    setOperatingTime={setOperatingTime}
                    selectedElectrolyzer={selectedElectrolyzer}
                    setSelectedElectrolyzer={setSelectedElectrolyzer}
                    availableElectrolyzers={availableElectrolyzers}
                    electrolyzerSettings={electrolyzerSettings}
                    setElectrolyzerSettings={setElectrolyzerSettings}
                    customElectrolyzer={customElectrolyzer}
                    electrolyzerQuantity={electrolyzerQuantity}
                    totalStacksNeeded={totalStacksNeeded}
                    openedSections={openedSections}
                    toggleSection={toggleSection}
                    isAdvancedMode={isAdvancedMode}
                />
                
                <Stack gap="lg">
                    <ResourcesCosts 
                        electricityPrice={electricityPrice}
                        setElectricityPrice={setElectricityPrice}
                        waterPrice={waterPrice}
                        setWaterPrice={setWaterPrice}
                        currentHydrogenPrice={currentHydrogenPrice}
                        setCurrentHydrogenPrice={setCurrentHydrogenPrice}
                        greyHydrogenPrice={greyHydrogenPrice}
                        setGreyHydrogenPrice={setGreyHydrogenPrice}
                        carbonTax={carbonTax}
                        setCarbonTax={setCarbonTax}
                        openedSections={openedSections}
                        toggleSection={toggleSection}
                        isAdvancedMode={isAdvancedMode}
                    />
                    
                    {isAdvancedMode && (
                        <Card shadow="sm" padding="lg" radius="md" withBorder>
                            <Text
                                fw={700}
                                size="xl"
                                mb="md"
                                pb="xs"
                                style={{ borderBottom: '2px solid var(--mantine-color-gray-2)' }}
                            >
                                {t("lifecycleParameters.title")}
                            </Text>

                            <ValueInput
                                label={
                                    <LabelWithTooltip
                                        label={t("lifecycleParameters.project_lifetime.label")}
                                        tooltip={t("lifecycleParameters.project_lifetime.tooltip")}
                                    />
                                }
                                id="project_lifetime"
                                units="units.years"
                                currentUnit="units.years"
                                namespace="calculator"
                                value={projectLifetime}
                                onValueChange={val => setProjectLifetime(val)}
                                nullBlocker
                            />

                            <ValueInput
                                label={
                                    <LabelWithTooltip
                                        label={t("lifecycleParameters.inflation_rate.label")}
                                        tooltip={t("lifecycleParameters.inflation_rate.tooltip")}
                                    />
                                }
                                id="inflation_rate"
                                units="units.pourcent"
                                currentUnit="units.pourcent"
                                namespace="calculator"
                                value={inflationRate}
                                onValueChange={val => setInflationRate(val)}
                            />
                        </Card>
                    )}
                </Stack>

                <CompressorSetup 
                    compressors={compressors}
                    isCompressorNeeded={isCompressorNeeded}
                    setIsCompressorNeeded={setIsCompressorNeeded}
                    massToCompress={massToCompress}
                    setMassToCompress={setMassToCompress}
                    annualProd={annualProd}
                    compressorSettings={compressorSettings}
                    setCompressorSettings={setCompressorSettings}
                    selectedCompressor={selectedCompressor}
                    setSelectedCompressor={setSelectedCompressor}
                    customCompressor={customCompressor}
                    compressorQuantity={compressorQuantity}
                    totalCompStacksNeeded={totalCompStacksNeeded}
                    showCellWarning={showCellWarning}
                    openedSections={openedSections}
                    toggleSection={toggleSection}
                    isAdvancedMode={isAdvancedMode}
                />
            </SimpleGrid>

            <ResultDisplay 
                cost={lcoh} 
                capex={capex} 
                greyCostDifference={costDifference} 
                greyAnnualDifference={annualDifference}
                currentCostDifference={currentCostDifference}
                currentAnnualDifference={currentAnnualDifference}
                avoidedCO2={avoidedCO2}
                breakdown={costBreakdown} 
                metrics={extraMetrics}
                greyDetails={greyDetails}
            />
            
            {exportError && (
                <Group justify="center" mt="20">
                    ⚠️ {exportError}
                </Group>
            )}

            <Group justify="center" mt="20">
                <Button 
                    variant="filled"
                    size="md" 
                    radius="md"
                    mt="lg" 
                    id="save_to_compare"
                    onClick={() => setComparisonSetups(prev => ([
                        ...prev,{
                            "results": {
                                "cost": lcoh,
                                "capex": capex,
                                "greyCostDifference": costDifference, 
                                "greyAnnualDifference": annualDifference,
                                "currentCostDifference": currentCostDifference,
                                "currentAnnualDifference": currentAnnualDifference,
                                "avoidedCO2": avoidedCO2,
                                "breakdown": costBreakdown, 
                                "metrics": extraMetrics,
                                "greyDetails": greyDetails
                            },
                            "inputs": {
                                "systemSize": systemSize,
                                "selectedElectrolyzer": selectedElectrolyzer,
                                "electrolyzerSettings": electrolyzerSettings,
                                "isCompressorNeeded": isCompressorNeeded,
                                "massToCompress": massToCompress,
                                "selectedCompressor": selectedCompressor,
                                "compressorSettings": compressorSettings,
                                "projectLifetime": projectLifetime,
                                "inflationRate": inflationRate,
                                "electricityPrice": electricityPrice,
                                "carbonTax": carbonTax,
                                "greyHydrogenPrice": greyHydrogenPrice,
                                "waterPrice": waterPrice,
                                "currentHydrogenPrice": currentHydrogenPrice,
                                "operatingTime": operatingTime
                            }
                        }
                    ]))}
                >        
                    {t("comparison.saveButtonlabel")}
                </Button>

                <Box
                    id="export_buttons"
                    display="inline-flex"
                    mt="lg"
                    style={{ gap: 8, borderRadius: 8 }}
                >
                    <Button
                        variant="filled"
                        size="md" 
                        radius="md"
                        rightSection={<IconDownload size={14} />}
                        onClick={() => handleExport('csv')}
                    >
                        CSV
                    </Button>

                    <Button
                        variant="filled"
                        size="md" 
                        radius="md"
                        rightSection={<IconDownload size={14} />}
                        onClick={() => handleExport('pdf')}
                    >
                        PDF
                    </Button>
                </Box>
            </Group>

            {/* INTERACTIVE TUTORIAL OVERLAY */}
            {showHelp && (
                <AdviceCards 
                    helpData={dynamicAdvices} 
                    onClose={() => setShowHelp(false)} 
                    onStepChange={(step) => {
                        if (step.openSection && !openedSections[step.openSection]) {
                            setOpenedSections(prev => ({ ...prev, [step.openSection]: true }));
                        }
                    }}
                    reset={resetHelp}
                    setReset={setResetHelpFalse}
                    namespace="calculator"
                />
            )}
            
            {comparisonSetups.length > 0 && (
                <Card shadow="lg" padding="xl" radius="md" withBorder mt="xl" bg="gray.0">
                    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                        {comparisonSetups.map((setup, i) => (
                            <ComparisonSetup
                                key={i}
                                setup={setup.results}
                                index={i}
                                onRemove={(ind) => setComparisonSetups(prev => prev.filter((_, i) => i !== ind))}
                                setCalculatorToSetup={() => {
                                    setSystemSize(setup.inputs.systemSize);
                                    setSelectedElectrolyzer(setup.inputs.selectedElectrolyzer);
                                    setElectrolyzerSettings(setup.inputs.electrolyzerSettings);
                                    setIsCompressorNeeded(setup.inputs.isCompressorNeeded);
                                    setMassToCompress(setup.inputs.massToCompress);
                                    setSelectedCompressor(setup.inputs.selectedCompressor);
                                    setCompressorSettings(setup.inputs.compressorSettings);
                                    setProjectLifetime(setup.inputs.projectLifetime);
                                    setInflationRate(setup.inputs.inflationRate);
                                    setElectricityPrice(setup.inputs.electricityPrice);
                                    setCarbonTax(setup.inputs.carbonTax);
                                    setGreyHydrogenPrice(setup.inputs.greyHydrogenPrice);
                                    setWaterPrice(setup.inputs.waterPrice);
                                    setCurrentHydrogenPrice(setup.inputs.currentHydrogenPrice);
                                    setOperatingTime(setup.inputs.operatingTime)
                                }}
                            />
                        ))}
                    </SimpleGrid>
                </Card>
            )}

            <Modal 
                opened={resetModalOpened} 
                onClose={() => setResetModalOpened(false)} 
                title={t("resetModal.title")} 
                centered
            >
                <Text size="sm" mb="xl">
                    {t("resetModal.text")} 
                </Text>
                <Group justify="flex-end">
                    <Button variant="default" onClick={() => setResetModalOpened(false)}>
                        {t("resetModal.cancelButton")}
                    </Button>
                    <Button color="red" onClick={handleResetDefaults}>
                        {t("resetModal.acceptButton")}
                    </Button>
                </Group>
            </Modal>

        </Container>
    );
}