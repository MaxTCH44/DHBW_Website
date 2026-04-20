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
import { ELEC_PRICE_UNITS, POWER_UNITS, WATER_VOLUME_PRICE_UNITS, TIME_PER_YEAR_UNITS, VOLUME_PER_TIME_UNITS, VOLUME_UNITS, H2_VOLUME_PRICE_UNITS, H2_VOLUME_POWER_UNITS, MAINTENANCE_UNITS } from '../components/calculator/calculatorConstants.js';
import ElectrolyzerSetup from '../components/calculator/ElectrolyzerSetup.jsx';
import ResourcesCosts from '../components/calculator/ResourcesCosts.jsx';
import CompressorSetup from '../components/calculator/CompressorSetup.jsx';



export default function Calculator() {
    const [selectedElectrolyzer, setSelectedElectrolyzer] = useState(electrolyzers.list[0]);
    const [electrolyzerSettings, setElectrolyzerSettings] = useState({
        owned: 0,
        ownedStacks: 0,
        maint_unit: MAINTENANCE_UNITS[0], 
        cons_unit: H2_VOLUME_POWER_UNITS[0]
        });
    const [customElectrolyzer, setCustomElectrolyzer] = useState(electrolyzers.list.find(e => e.id === 0));

    const [systemSize, setSystemSize] = useState({ value: selectedElectrolyzer.power, unit: POWER_UNITS[1], selfProduced: 0 });
    //const [productionGoal, setProductionGoal] = useState({ value: 0, unit: VOLUME_PER_TIME_UNITS[0] });
    const [operatingTime, setOperatingTime] = useState({ value: 4000, unit: TIME_PER_YEAR_UNITS[1] });

    const [electricityPrice, setElectricityPrice] = useState({ value: 89, unit: ELEC_PRICE_UNITS[0] });
    const [waterPrice, setWaterPrice] = useState({ value: 2, unit: WATER_VOLUME_PRICE_UNITS[0] });

    const [currentHydrogenPrice, setCurrentHydrogenPrice] = useState({value : 6.11, unit: H2_VOLUME_PRICE_UNITS[0] });
    const [greyHydrogenPrice, setGreyHydrogenPrice] = useState({value : 3.5, unit: H2_VOLUME_PRICE_UNITS[0] });
    const [carbonTax, setCarbonTax] = useState(50);

    const [projectLifetime, setProjectLifetime] = useState(15);
    const [inflationRate, setInflationRate] = useState(2);

    //const [storageCapacity, setStorageCapacity] = useState({ value: 100, unit: VOLUME_UNITS[0] });
    //const [storagePrice, setStoragePrice] = useState(20000);
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

    const [openedSections, setOpenedSections] = useState({ electrolyzer: false, compressor: false, system: false, greyH2: false });
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
    

    const annualProd = ((systemSize.value * systemSize.unit.factor) * (operatingTime.value * operatingTime.unit.factor)) / selectedElectrolyzer.energy_consumption_kwh_per_kg;

    const prevMaxRef = useRef(Math.round(annualProd));

    useEffect(() => {
        const newMax = Math.round(annualProd);
        const oldMax = prevMaxRef.current;
        setMassToCompress((currentMass) => {
            if (currentMass === oldMax || currentMass > newMax || currentMass < 0) {
                return newMax;
            }
            return currentMass;
        });
        prevMaxRef.current = newMax;
    }, [annualProd]);

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

    useEffect(() => {
        if (!isAdvancedMode) {
            let activeElectrolyzer = selectedElectrolyzer;
            if (selectedElectrolyzer.id === 0) {
                const fallback = electrolyzers.list.find(e => e.id !== 0);
                if (fallback) {
                    activeElectrolyzer = fallback;
                    setSelectedElectrolyzer(fallback);
                }
            }
            const currentPowerKw = systemSize.value * systemSize.unit.factor;
            const numberOfModules = Math.round(currentPowerKw / activeElectrolyzer.power);
            const validModules = Math.max(1, numberOfModules);

            const closedSections = Object.keys(openedSections).reduce((acc, key) => {
                acc[key] = false;
                return acc;
            }, {});
            
            setOpenedSections(closedSections);
            setShowHelp(false);

            setSystemSize({ 
                value: Number((validModules * activeElectrolyzer.power).toFixed(2)), 
                unit:  POWER_UNITS[1],
                selfProduced: 0
            });
        }
    }, [isAdvancedMode]);

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


    const availableElectrolyzers = useMemo(() => {
        if (isAdvancedMode) {
            return electrolyzers;
        }
        return {
            ...electrolyzers,
            list: electrolyzers.list.filter(e => e.id !== 0)
        };
    }, [isAdvancedMode]);

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
                {isAdvancedMode && (<Card shadow="sm" padding="lg" radius="md" withBorder>
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
                </Card>)}
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
            {showHelp && (
                <AdviceCards 
                    helpData={dynamicAdvices}
                    onClose={() => setShowHelp(false)} 
                    onStepChange={(step) => {
                        if (step.openSection && !openedSections[step.openSection]) {
                            setOpenedSections(prev => ({ ...prev, [step.openSection]: true }));
                        }
                    }}
                />
            )}
        </Container>
    );
}
