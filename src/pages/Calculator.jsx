import { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Container, Title, SimpleGrid, Card, Text, Stack, SegmentedControl, Tooltip, ActionIcon, Box, Center } from '@mantine/core';
import { IconQuestionMark } from '@tabler/icons-react';
import { useSessionStorage } from '@mantine/hooks';

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

/**
 * Main state manager and orchestrator for the Hydrogen Levelized Cost (LCOH) Calculator.
 * It acts as the "Single Source of Truth", holding all user inputs (from equipment specs to economic variables),
 * feeds them into the mathematical hook (`useCalculatorLogic`), and distributes the resulting data 
 * to the visual dashboard (`ResultDisplay`). It also controls the interactive tutorial overlay (`AdviceCards`).
 * * * Note: This component does not take external props. It initializes its state locally and via JSON imports.
 */
export default function Calculator() {
    
    // --- 1. ELECTROLYZER STATE ---
    const [selectedElectrolyzer, setSelectedElectrolyzer] = useState(electrolyzers.list[0]);
    const [electrolyzerSettings, setElectrolyzerSettings] = useState({
        owned: 0,
        ownedStacks: 0,
        maint_unit: MAINTENANCE_UNITS[0], 
        cons_unit: H2_VOLUME_POWER_UNITS[0]
    });
    const [customElectrolyzer, setCustomElectrolyzer] = useState(electrolyzers.list.find(e => e.id === 0));

    // --- 2. GLOBAL SIZING & OPERATIONAL STATE ---
    const [systemSize, setSystemSize] = useState({ value: selectedElectrolyzer.power, unit: POWER_UNITS[1], selfProduced: 0 });
    const [operatingTime, setOperatingTime] = useState({ value: 4000, unit: TIME_PER_YEAR_UNITS[1] });
    
    // --- 3. MACRO-ECONOMIC & UTILITY STATE ---
    const [electricityPrice, setElectricityPrice] = useState({ value: 89, unit: ELEC_PRICE_UNITS[0] });
    const [waterPrice, setWaterPrice] = useState({ value: 2, unit: WATER_VOLUME_PRICE_UNITS[0] });
    const [currentHydrogenPrice, setCurrentHydrogenPrice] = useState({value : 6.11, unit: H2_VOLUME_PRICE_UNITS[0] });
    const [greyHydrogenPrice, setGreyHydrogenPrice] = useState({value : 3.5, unit: H2_VOLUME_PRICE_UNITS[0] });
    const [carbonTax, setCarbonTax] = useState(50);
    const [projectLifetime, setProjectLifetime] = useState(15);
    const [inflationRate, setInflationRate] = useState(2);

    // --- 4. COMPRESSOR STATE ---
    const [massToCompress, setMassToCompress] = useState(-1);
    const [isCompressorNeeded, setIsCompressorNeeded] = useState(true);
    const [selectedCompressor, setSelectedCompressor] = useState(compressors.list[0]);
    const [compressorSettings, setCompressorSettings] = useState({
        owned: 0,
        ownedStacks: 0,
        operatingTime: { value: 4000, unit: TIME_PER_YEAR_UNITS[1] },
        cons_unit: H2_VOLUME_POWER_UNITS[0],
        maint_unit: MAINTENANCE_UNITS[0],
        flow_unit: VOLUME_PER_TIME_UNITS[2]
    });
    const [customCompressor, setCustomCompressor] = useState(compressors.list.find(e => e.id === 0));

    // --- 5. UI CONTROLS STATE ---
    // Tracks which accordions are open to show/hide advanced parameters
    const [openedSections, setOpenedSections] = useState({ electrolyzer: false, compressor: false, system: false, greyH2: false });
    // useSessionStorage ensures the user's mode preference (Simple/Advanced) persists even if they navigate away and come back
    const [isAdvancedMode, setIsAdvancedMode] = useSessionStorage({
        key: 'calculator-advanced-mode', 
        defaultValue: false 
    });
    const [showHelp, setShowHelp] = useState(false);

    function toggleSection (sectionName){
        setOpenedSections((prev) => ({
            ...prev,
            [sectionName]: !prev[sectionName]
        }));
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
    useEffect(() => {
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
            return electrolyzers;
        }
        return {
            ...electrolyzers,
            list: electrolyzers.list.filter(e => e.id !== 0)
        };
    }, [isAdvancedMode]);

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
            if (step.isPriceInput && step.openSection === "electrolyzer" && electrolyzerQuantity === electrolyzerSettings.owned) {
                return false;
            }
            if (step.isPriceInput && step.openSection === "compressor" && compressorQuantity === compressorSettings.owned) {
                return false;
            }
            return true;
        });
    }, [selectedCompressor?.type, isCompressorNeeded, electrolyzerQuantity, electrolyzerSettings.owned, compressorQuantity, compressorSettings.owned, advices]);


    // --- 9. RENDER ---
    return (
        <Container size="xl" px="xl" py="lg" mt="150px">
            
            <Title order={1} ta="center" mb="xl" c="dark.7">Hydrogen Cost Calculator</Title>
            <Text c="dimmed" ta="center" maw={800} mx="auto" mb="xl">
                Estimate the Levelized Cost of Hydrogen (LCOH) and total capital expenditure (CAPEX) for your production plant. 
                Adjust system parameters, resource costs, and financial variables to simulate different techno-economic scenarios.
            </Text>

            <Center mb="xl">
                <Box pos="relative">
                    <SegmentedControl
                        value={isAdvancedMode ? 'advanced' : 'simple'}
                        onChange={(val) => setIsAdvancedMode(val === 'advanced')}
                        data={[
                            { label: 'Simple Mode', value: 'simple' },
                            { label: 'Advanced Calculator', value: 'advanced' },
                        ]}
                        bg="green.1"
                    />
                    {isAdvancedMode && (
                        <Tooltip 
                            label="Click for step-by-step help" 
                            withArrow 
                            position="right"
                        >
                            <ActionIcon 
                                variant="light" 
                                color="blue" 
                                radius="xl" 
                                size="lg"
                                onClick={() => setShowHelp(true)}
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

            <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="lg" style={{ alignItems: 'flex-start' }}>
                <ElectrolyzerSetup 
                    electrolyzers={electrolyzers}
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
                            <Text fw={700} size="xl" mb="md" pb="xs" style={{ borderBottom: '2px solid var(--mantine-color-gray-2)' }}>
                                Lifecycle Parameters
                            </Text>

                            <ValueInput
                                label={<LabelWithTooltip label="Project Lifetime" tooltip="Expected operational lifespan of the plant to amortize the CAPEX." />}
                                id="project_lifetime"
                                units="years"
                                currentUnit="years"
                                value={projectLifetime}
                                onValueChange={val => setProjectLifetime(val)}
                                nullBlocker
                            />

                            <ValueInput
                                label={<LabelWithTooltip label="Inflation Rate" tooltip="The average percentage of annual prices increase. " />}
                                id="inflation_rate"
                                units="%"
                                currentUnit="%"
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

            {/* INTERACTIVE TUTORIAL OVERLAY */}
            {showHelp && (
                <AdviceCards 
                    helpData={dynamicAdvices} 
                    onClose={() => setShowHelp(false)} 
                    onStepChange={(step) => {
                        // Automatically forces advanced parameter accordions open if the tutorial needs to target a hidden input
                        if (step.openSection && !openedSections[step.openSection]) {
                            setOpenedSections(prev => ({ ...prev, [step.openSection]: true }));
                        }
                    }}
                />
            )}
        </Container>
    );
}