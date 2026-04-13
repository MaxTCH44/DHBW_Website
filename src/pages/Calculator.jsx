import { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Container, Title, SimpleGrid, Card, Text, Paper, Anchor, Stack, Checkbox, Group, Badge, Alert, Select, SegmentedControl, Tooltip, ActionIcon, Box, Center } from '@mantine/core';
import { IconAlertCircle, IconQuestionMark } from '@tabler/icons-react';
import { useSessionStorage } from '@mantine/hooks';

import electrolyzers from '../data/electrolyzers_list.json';
import compressors from '../data/compressors_list.json';
import advices from '../data/calculator_advices.json';

import ValueInput from '../components/ValueInput.jsx';
import SliderInput from '../components/SliderInput.jsx';
import ResultDisplay from '../components/ResultDisplay.jsx';
import EquipmentSelector from '../components/EquipmentSelector.jsx';
import LabelWithTooltip from '../components/LabelWithTooltip.jsx';
import DetailSection from '../components/DetailSection.jsx';
import IncrementalInput from '../components/IncrementalInput.jsx';
import AdviceCards from '../components/AdviceCards.jsx';



const ELEC_PRICE_UNITS = [{ label: "€/MWh", factor: 0.001 }, { label: "€/kWh", factor: 1 }];
const POWER_UNITS = [{ label: "MW", factor: 1000 }, { label: "kW", factor: 1}];
const WATER_VOLUME_PRICE_UNITS = [{ label: "€/m³", factor: 0.001 }, { label: "€/L", factor: 1 }];
const TIME_PER_YEAR_UNITS = [{ label: "days/year", factor: 24 }, { label: "h/year", factor: 1 }];
const VOLUME_PER_TIME_UNITS = [{ label: "kg/h", factor: 1 }, { label: "m³/h", factor: (1/11.1) }, { label: "kg/day", factor: (1/24) }, { label: "m³/day", factor: (1/(11.1*24)) }];
const VOLUME_UNITS = [{ label: "kg", factor: 1 }, { label: "m³", factor: 11.1 }];
const H2_VOLUME_PRICE_UNITS = [{ label: "€/kg", factor: 1 }, { label: "€/m³", factor: 11.1 }];
const H2_VOLUME_POWER_UNITS = [{ label: "kWh/kg", factor: 1 }, { label: "kWh/m³", factor: 11.1 }];
const MAINTENANCE_UNITS = [{ label: "% CAPEX", factor: 1 }, { label: "€", factor: 1 }];

const WATER_PER_KG_OF_H2 = 0.015; //m³ of water
const EMISSIONS_PER_KG_OF_H2 = 9.5; //kg of CO2


export default function Calculator() {
    const [selectedElectrolyzer, setSelectedElectrolyzer] = useState(electrolyzers.list[0]);
    const [electrolyzerSettings, setElectrolyzerSettings] = useState({maint_unit: MAINTENANCE_UNITS[0], cons_unit: H2_VOLUME_POWER_UNITS[0], owned: 0});
    const [customElectrolyzer, setCustomElectrolyzer] = useState(electrolyzers.list.find(e => e.id === 0));

    const [systemSize, setSystemSize] = useState({ value: selectedElectrolyzer.power, unit: POWER_UNITS[1], selfProduced: 0 });
    //const [productionGoal, setProductionGoal] = useState({ value: 0, unit: VOLUME_PER_TIME_UNITS[0] });
    const [operatingTime, setOperatingTime] = useState({ value: 4000, unit: TIME_PER_YEAR_UNITS[1] });

    const [electricityPrice, setElectricityPrice] = useState({ value: 89, unit: ELEC_PRICE_UNITS[0] });
    const [waterPrice, setWaterPrice] = useState({ value: 2, unit: WATER_VOLUME_PRICE_UNITS[0] });

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
        operatingTime: { value: 8000, unit: TIME_PER_YEAR_UNITS[1] },
        cons_unit: H2_VOLUME_POWER_UNITS[0],
        maint_unit: MAINTENANCE_UNITS[0],
        flow_unit: VOLUME_PER_TIME_UNITS[2],
        maint_value: 0
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

            setSystemSize({ 
                value: Number((validModules * activeElectrolyzer.power).toFixed(2)), 
                unit:  POWER_UNITS[1],
                selfProduced: 0
            });
        }
    }, [isAdvancedMode]);


    const availableElectrolyzers = useMemo(() => {
        if (isAdvancedMode) {
            return electrolyzers;
        }
        return {
            ...electrolyzers,
            list: electrolyzers.list.filter(e => e.id !== 0)
        };
    }, [isAdvancedMode]);

    const calcResults = useMemo(() => {
        const electrolyzerQuantity = Math.ceil(((systemSize.value * systemSize.unit.factor) / selectedElectrolyzer.power).toFixed(3));
        
        let compressorQuantity = 0;
        let compressorCapex = 0;
        let extraStacksNeeded = 0;
        let totalStacksNeeded = 0;

        if (isCompressorNeeded && massToCompress > 0) {
            const compOpHoursPerYear = compressorSettings.operatingTime.value * compressorSettings.operatingTime.unit.factor;
            
            if (selectedCompressor.type === 'Mechanical') {
                const annualCapPerComp = (selectedCompressor.unitary_flowrate_kg_per_day * compressorSettings.flow_unit.factor) * compOpHoursPerYear;
                compressorQuantity = annualCapPerComp > 0 ? Math.ceil(massToCompress / annualCapPerComp) : 0;
                
                const newComps = Math.max(0, compressorQuantity - compressorSettings.owned);
                compressorCapex = newComps * selectedCompressor.price;
            } 
            else if (selectedCompressor.type === 'Electrochemical') {
                const flowPerStackKgPerH = selectedCompressor.unitary_flowrate_kg_per_day * compressorSettings.flow_unit.factor * selectedCompressor.cells_per_stack;
                const annualCapPerStack = flowPerStackKgPerH * compOpHoursPerYear;
                
                totalStacksNeeded = annualCapPerStack > 0 ? Math.ceil(massToCompress / annualCapPerStack) : 0;
                const maxStacksPerComp = selectedCompressor.cells_per_stack > 0 ? Math.floor(selectedCompressor.max_cells / selectedCompressor.cells_per_stack) : 1;
                
                compressorQuantity = maxStacksPerComp > 0 ? Math.ceil(totalStacksNeeded / maxStacksPerComp) : 0;
                extraStacksNeeded = Math.max(0, totalStacksNeeded - compressorQuantity);
                
                const newComps = Math.max(0, compressorQuantity - compressorSettings.owned);
                
                const actualOwnedStacks = Math.max(compressorSettings.ownedStacks, compressorSettings.owned);
                const ownedExtraStacks = Math.max(0, actualOwnedStacks - compressorSettings.owned);
                const newExtraStacks = Math.max(0, extraStacksNeeded - ownedExtraStacks);
                
                compressorCapex = (newComps * selectedCompressor.price) + (newExtraStacks * selectedCompressor.cell_stack_price);
            }
        }

        const capex = (Math.max(0, electrolyzerQuantity - electrolyzerSettings.owned) * selectedElectrolyzer.price) + compressorCapex;
        const annualDepre = capex / projectLifetime;
        const capexPerKgShare = annualDepre / annualProd; 
        
        const avgInflaFactor = inflationRate === 0 ? 1 : ((1 + inflationRate / 100) ** projectLifetime - 1) / ((inflationRate / 100) * projectLifetime);
        const smoothedElecPrice = (electricityPrice.value * electricityPrice.unit.factor) * avgInflaFactor;
        const gridElectricityRatio = systemSize.value > 0 ? Math.max(0, systemSize.value - systemSize.selfProduced) / systemSize.value : 0;
        
        const carbonTaxPerKg = EMISSIONS_PER_KG_OF_H2 * (carbonTax / 1000);
        const baseGreyPrice = greyHydrogenPrice.value * greyHydrogenPrice.unit.factor;
        const greyPriceWithTax = baseGreyPrice + carbonTaxPerKg;
        const smoothedGreyPrice = greyPriceWithTax * avgInflaFactor;

        const annualAuxElec = selectedElectrolyzer.total_auxiliary_consumption * (operatingTime.value * operatingTime.unit.factor);

        const totalElecNeeded = (annualProd * (selectedElectrolyzer.energy_consumption_kwh_per_kg * electrolyzerSettings.cons_unit.factor)) + annualAuxElec +
                                (isCompressorNeeded ? (massToCompress * (selectedCompressor.energy_consumption_kwh_per_kg * compressorSettings.cons_unit.factor)) : 0);
        const totalWaterNeeded = selectedElectrolyzer.water_consumption_l_per_h * (operatingTime.value * operatingTime.unit.factor) * electrolyzerQuantity

        const elecShare = annualProd > 0 ? (totalElecNeeded * smoothedElecPrice * gridElectricityRatio) / annualProd : 0;
        const waterShare = annualProd > 0 ? totalWaterNeeded * (waterPrice.value * waterPrice.unit.factor) / annualProd : 0;
        
        const annualElectrolyzerMaintenance = electrolyzerSettings.maint_unit.label === "€" 
            ? selectedElectrolyzer.maintenance_percent_capex * electrolyzerQuantity
            : (selectedElectrolyzer.price * electrolyzerQuantity) * (selectedElectrolyzer.maintenance_percent_capex / 100);

        const totalCompressorHardwareValue = (compressorQuantity * selectedCompressor.price) + (extraStacksNeeded * (selectedCompressor.cell_stack_price || 0));
        
        const annualCompressorMaintenance = isCompressorNeeded 
            ? (compressorSettings.maint_unit.label === "€" 
                ? (compressorSettings.maint_value * compressorQuantity)
                : totalCompressorHardwareValue * (selectedCompressor.maintenance_percent_capex / 100))
            : 0;
        
        const showCellWarning = selectedCompressor.type === 'Electrochemical' && selectedCompressor.cells_per_stack > 0 && (selectedCompressor.max_cells % selectedCompressor.cells_per_stack !== 0);

        const maintenanceShare = (annualElectrolyzerMaintenance + annualCompressorMaintenance) / annualProd;

        const lcoh = capexPerKgShare + elecShare + waterShare + maintenanceShare;
        
        const costDifference = smoothedGreyPrice - lcoh; 
        const annualDifference = costDifference * annualProd;

        const costBreakdown = {
            capex: capexPerKgShare,
            electricity: elecShare,
            water: waterShare,
            maintenance: maintenanceShare
        };

        const installedElectrolyzerPower = (electrolyzerQuantity * selectedElectrolyzer.power).toFixed(2);
        const utilizationRate = installedElectrolyzerPower > 0 
            ? ((systemSize.value * systemSize.unit.factor) / installedElectrolyzerPower) * 100 
            : 0;

        const extraMetrics = {
            annualProd: annualProd, 
            annualElec: annualProd * (selectedElectrolyzer.energy_consumption_kwh_per_kg + (isCompressorNeeded ? selectedCompressor.energy_consumption_kwh_per_kg : 0)), 
            annualWater: totalWaterNeeded,
            installedCapacity: installedElectrolyzerPower,
            utilizationRate: utilizationRate 
        };

        const greyDetails = {
            base: baseGreyPrice,
            tax: carbonTaxPerKg,
            totalWithTax: greyPriceWithTax,
            smoothed: smoothedGreyPrice
        };

        return {
            electrolyzerQuantity,
            compressorQuantity,
            totalStacksNeeded,
            capex,
            showCellWarning,
            lcoh,
            costDifference,
            annualDifference,
            costBreakdown,
            extraMetrics,
            greyDetails
        };
    }, [
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
        waterPrice
    ]);

    const {
        electrolyzerQuantity,
        compressorQuantity,
        totalStacksNeeded,
        capex,
        showCellWarning,
        lcoh,
        costDifference,
        annualDifference,
        costBreakdown,
        extraMetrics,
        greyDetails
    } = calcResults;


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
                        units="years"
                        currentUnit="years"
                        value={projectLifetime}
                        onValueChange={val => setProjectLifetime(val)}
                        nullBlocker
                    />
                    <ValueInput
                        label={<LabelWithTooltip label="Interest Rate" tooltip="The average percentage of annual prices increase. " />}
                        units="%"
                        currentUnit="%"
                        value={inflationRate}
                        onValueChange={val => setInflationRate(val)}
                    />
                </Card>)}
                </Stack>
                <CompressorSetup 
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
                    totalStacksNeeded={totalStacksNeeded}
                    showCellWarning={showCellWarning}
                    openedSections={openedSections}
                    toggleSection={toggleSection}
                    isAdvancedMode={isAdvancedMode}
                />
            </SimpleGrid>
            <ResultDisplay 
                cost={lcoh} 
                capex={capex} 
                costDifference={costDifference} 
                annualDifference={annualDifference} 
                breakdown={costBreakdown} 
                metrics={extraMetrics}
                greyDetails={greyDetails} 
            />
            {showHelp && (
                <AdviceCards 
                    helpData={advices} 
                    onClose={() => setShowHelp(false)} 
                />
            )}
        </Container>
    );
}

function ElectrolyzerSetup ({
    systemSize, 
    setSystemSize, 
    operatingTime, 
    setOperatingTime,
    selectedElectrolyzer,
    setSelectedElectrolyzer,
    availableElectrolyzers,
    electrolyzerSettings,
    setElectrolyzerSettings,
    customElectrolyzer,
    electrolyzerQuantity,
    openedSections,
    toggleSection,
    isAdvancedMode
}) {
    return(
        <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Text fw={700} size="xl" mb="md" pb="xs" style={{ borderBottom: '2px solid #f0f0f0' }}>
                Electrolyzer Setup
            </Text>
            {isAdvancedMode ? (
                <ValueInput
                    id="system_size"
                    label={<LabelWithTooltip label="System size" tooltip="Total electrical power capacity of your electrolyzer setup." />}
                    units={POWER_UNITS}
                    currentUnit={systemSize.unit}
                    value={systemSize.value}
                    onValueChange={val => setSystemSize({ ...systemSize, value: val })}
                    onUnitChange={u => setSystemSize({ ...systemSize, unit: u })}
                    nullBlocker
                />
            ) : (
                <IncrementalInput
                    label={<LabelWithTooltip label="System size" tooltip="Total electrical power capacity of your electrolyzer setup." />}
                    value={systemSize.value}
                    step={selectedElectrolyzer.power}
                    min={selectedElectrolyzer.power}
                    unit="kW"
                    onValueChange={val => setSystemSize({ ...systemSize, value: val })}
                />
            )}
            {isAdvancedMode && (<DetailSection openedSections={openedSections.system} toggleSection={() => toggleSection('system')}>
                <SliderInput 
                    label={<LabelWithTooltip label="Self-produced" tooltip="Percentage of the required electrical power generated on-site (e.g., via solar panels), reducing the energy drawn from the grid." />}
                    units={systemSize.unit.label}
                    value={systemSize.selfProduced}
                    onValueChange={v => setSystemSize({ ...systemSize, selfProduced: v })}
                    min={0}
                    max={systemSize.value}
                />
            </DetailSection>)}
            <ValueInput
                id="electrolyzer_operating_time"
                label={<LabelWithTooltip label="Operating time" tooltip="Number of hours or days the electrolyzer system operates continuously per year." />}
                units={TIME_PER_YEAR_UNITS}
                currentUnit={operatingTime.unit}
                value={operatingTime.value}
                max={365 * 24 / operatingTime.unit.factor}
                onValueChange={val => setOperatingTime({ ...operatingTime, value: val })}
                onUnitChange={u => setOperatingTime({ ...operatingTime, unit: u })}
                nullBlocker
            />
            <Paper bg="gray.0" p="md" radius="md" withBorder mt="md">
                <EquipmentSelector
                    label={
                        <Stack gap="xs">
                            <LabelWithTooltip label="Electrolyzer Setup :" tooltip="Different technologies have distinct efficiencies and costs. Check the 'Learn' section for details." />
                            <Anchor component={Link} to="/electrolyzers" size="xs" mb="sm" c="blue">
                                Learn more about the different types
                            </Anchor>
                        </Stack>
                    }
                    itemsList={availableElectrolyzers}
                    selectedItem={selectedElectrolyzer}
                    onItemChange={(val) => {
                        const newElectrolyzer = electrolyzers.list[val];
                        const currentSystemPowerInKw = systemSize.value * systemSize.unit.factor;
                        if (!isAdvancedMode) {
                            const numberOfModules = Math.round(currentSystemPowerInKw / newElectrolyzer.power);
                            const validModules = Math.max(1, numberOfModules); 
                            const newPowerKw = validModules * newElectrolyzer.power;

                            setSystemSize({ 
                                value: Number(newPowerKw.toFixed(2)), 
                                unit: { label: "kW", factor: 1 },
                                selfProduced: 0
                            });
                        } else {
                            if (currentSystemPowerInKw === selectedElectrolyzer.power) {
                                setSystemSize({ ...systemSize, value: newElectrolyzer.power / systemSize.unit.factor });
                            }
                        }
                        if (newElectrolyzer.id === 0){
                            if (!openedSections.electrolyzer) {toggleSection('electrolyzer')};
                            setSelectedElectrolyzer(customElectrolyzer);
                        } else {
                            setSelectedElectrolyzer(newElectrolyzer);
                        }
                    }}
                    quantityOwned={electrolyzerSettings.owned} 
                    onOwnedChange={(v) => setElectrolyzerSettings({ ...electrolyzerSettings, owned: v })}
                    ownedLabel={electrolyzerQuantity <= 1 ? "Already owned (No CAPEX)" : "Pre-owned electrolyzers"}
                    max={electrolyzerQuantity}
                    isAdvancedMode={isAdvancedMode}
                />
                {isAdvancedMode && (<DetailSection openedSections={openedSections.electrolyzer} toggleSection={() => toggleSection('electrolyzer')}>
                    {selectedElectrolyzer.id === 0 && (
                        <Select
                            label="Electrolyzer type"
                            data={["PEM", "Alkaline", "AEM"]}
                            value={selectedElectrolyzer.type}
                            onChange={val => setSelectedElectrolyzer({ ...selectedElectrolyzer, type: val })}
                            mb="md"
                        />
                    )}
                    {!(electrolyzerSettings.owned === electrolyzerQuantity) && (
                        <ValueInput
                            label="Electrolyzer purchase price"
                            units="€"
                            currentUnit="€"
                            value={selectedElectrolyzer.price}
                            onValueChange={val => setSelectedElectrolyzer({ ...selectedElectrolyzer, price: val })}
                        />
                    )}
                    <ValueInput
                        label={<LabelWithTooltip label="Electrolyzer power" tooltip="The rated electrical power input of the electrolyzer system, which determines its production capacity." />}
                        units="kW"
                        currentUnit="kW"
                        value={selectedElectrolyzer.power}
                        onValueChange={val => setSelectedElectrolyzer({ ...selectedElectrolyzer, power: val })}
                        nullBlocker
                    />
                    <ValueInput
                        label={<LabelWithTooltip label="Electrolyzer energy consumption" tooltip="Specific energy consumption of the electrolyzer stack itself to produce one unit of hydrogen. This value excludes system-wide auxiliaries like cooling or drying." />}
                        units={H2_VOLUME_POWER_UNITS}
                        currentUnit={electrolyzerSettings.cons_unit}
                        value={selectedElectrolyzer.energy_consumption_kwh_per_kg}
                        onValueChange={val => setSelectedElectrolyzer({ ...selectedElectrolyzer, energy_consumption_kwh_per_kg: val })}
                        onUnitChange={(u) => setElectrolyzerSettings({ ...electrolyzerSettings, cons_unit : u })}
                        nullBlocker
                    />
                    <ValueInput
                        label={<LabelWithTooltip label="Total auxiliary consumption (BoP)" tooltip="Fixed electrical power (kW) required by the entire system's supporting hardware (cooling, drying, electronics). This is a global value for the whole setup, regardless of the number of electrolyzer units." />}
                        units="kW"
                        currentUnit="kW"
                        value={selectedElectrolyzer.total_auxiliary_consumption}
                        onValueChange={val => setSelectedElectrolyzer({ ...selectedElectrolyzer, total_auxiliary_consumption: val })}
                    />
                    <ValueInput
                        label={<LabelWithTooltip label="Water consumption" tooltip="The amount of purified water required per hour by a single electrolyzer unit at its rated power." />}
                        units="L/h"
                        currentUnit="L/h"
                        value={selectedElectrolyzer.water_consumption_l_per_h}
                        onValueChange={val => setSelectedElectrolyzer({ ...selectedElectrolyzer, water_consumption_l_per_h: val })}
                    />
                    <ValueInput
                        label={<LabelWithTooltip label="Maintenance costs" tooltip="Annual operation and maintenance (O&M) costs, generally estimated as a percentage of the initial equipment cost (CAPEX)." />}
                        units={MAINTENANCE_UNITS}
                        currentUnit={electrolyzerSettings.maint_unit}
                        value={selectedElectrolyzer.maintenance_percent_capex}
                        onValueChange={val => setSelectedElectrolyzer({ ...selectedElectrolyzer, maintenance_percent_capex: val })}
                        onUnitChange={(u) => setElectrolyzerSettings({ ...electrolyzerSettings, maint_unit : u })}
                    />
                </DetailSection>)}
            </Paper>
        </Card>
    );
}

function ResourcesCosts ({
    electricityPrice,
    setElectricityPrice,
    waterPrice,
    setWaterPrice,
    greyHydrogenPrice,
    setGreyHydrogenPrice,
    carbonTax,
    setCarbonTax,
    openedSections,
    toggleSection,
    isAdvancedMode
}){
    return(
        <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Text fw={700} size="xl" mb="md" pb="xs" style={{ borderBottom: '2px solid var(--mantine-color-gray-2)' }}>
                Resources Costs
            </Text>
            <ValueInput
                id="electricity_price"
                label={<LabelWithTooltip label="Electricity price" tooltip="The average grid electricity price. This is the primary cost driver for green hydrogen production." />}
                units={ELEC_PRICE_UNITS}
                currentUnit={electricityPrice.unit}
                value={electricityPrice.value}
                onValueChange={val => setElectricityPrice({ ...electricityPrice, value: val })}
                onUnitChange={u => setElectricityPrice({ ...electricityPrice, unit: u })}
            />
            {isAdvancedMode && (<><ValueInput
                label={<LabelWithTooltip label="Water price" tooltip="Cost of purified water supply for the electrolysis process." />}
                units={WATER_VOLUME_PRICE_UNITS}
                currentUnit={waterPrice.unit}
                value={waterPrice.value}
                onValueChange={val => setWaterPrice({ ...waterPrice, value: val })}
                onUnitChange={u => setWaterPrice({ ...waterPrice, unit: u })}
            />
            <ValueInput
                label={<LabelWithTooltip label="Grey Hydrogen price" tooltip="The current market price of grey hydrogen (produced from natural gas). Used as a baseline to calculate your savings." />}
                units={H2_VOLUME_PRICE_UNITS}
                currentUnit={greyHydrogenPrice.unit}
                value={greyHydrogenPrice.value}
                onValueChange={val => setGreyHydrogenPrice({ ...greyHydrogenPrice, value: val })}
                onUnitChange={u => setGreyHydrogenPrice({ ...greyHydrogenPrice, unit: u })}
            />
            <DetailSection openedSections={openedSections.greyH2} toggleSection={() => toggleSection('greyH2')}>
                <ValueInput
                    label={<LabelWithTooltip label="Carbon Tax" tooltip="The price applied per ton of CO2 emissions. A higher tax increases the cost of grey hydrogen, making green hydrogen more competitive." />}
                    units="€/t CO₂"
                    currentUnit="€/t CO₂"
                    value={carbonTax}
                    onValueChange={val => setCarbonTax(val)}
                />
            </DetailSection></>)}
        </Card>
    )
}

function CompressorSetup ({
    isCompressorNeeded,
    setIsCompressorNeeded,
    massToCompress,
    setMassToCompress,
    annualProd,
    compressorSettings,
    setCompressorSettings,
    selectedCompressor,
    setSelectedCompressor,
    customCompressor,
    compressorQuantity,
    totalStacksNeeded,
    showCellWarning,
    openedSections,
    toggleSection,
    isAdvancedMode
}){
    return(
        <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Text fw={700} size="xl" mb="md" pb="xs" style={{ borderBottom: '2px solid var(--mantine-color-gray-2)' }}>
                Compressor Setup
            </Text>
            <Checkbox mb="sm"
                label="We need to use a compressor"
                checked={isCompressorNeeded}
                onChange={(e) => setIsCompressorNeeded(e.currentTarget.checked)}
            />
            {isCompressorNeeded && isAdvancedMode && (<><SliderInput
                id="h2_to_compress" 
                label={<LabelWithTooltip label="Hydrogen to compress" tooltip="The total mass of hydrogen gas generated that needs to be compressed for storage or transport." />}
                units="kg"
                value={massToCompress}
                onValueChange={v => setMassToCompress(Math.round(v))}
                min={0}
                max={Math.round(annualProd)}
            />
            <ValueInput
                label={<LabelWithTooltip label="Operating time" tooltip="Number of hours or days the compressor system operates continuously per year." />}
                units={TIME_PER_YEAR_UNITS}
                currentUnit={compressorSettings.operatingTime.unit}
                value={compressorSettings.operatingTime.value}
                max={365 * 24 / compressorSettings.operatingTime.unit.factor}
                onValueChange={(val) => setCompressorSettings({ ...compressorSettings, operatingTime: { ...compressorSettings.operatingTime, value: val } })}
                onUnitChange={(u) => setCompressorSettings({ ...compressorSettings, operatingTime: { ...compressorSettings.operatingTime, unit: u } })}
                nullBlocker
            />
            {/*<ValueInput
                label={<LabelWithTooltip label="Storage capacity" tooltip="Volume or mass of hydrogen you need to hold on-site." />}
                units={VOLUME_UNITS}
                currentUnit={storageCapacity.unit}
                value={storageCapacity.value}
                onValueChange={val => setStorageCapacity({ ...storageCapacity, value: val })}
                onUnitChange={u => setStorageCapacity({ ...storageCapacity, unit: u })}
            />
            <ValueInput
                label="Storage tanks price"
                units="€"
                currentUnit="€"
                value={storagePrice}
                onValueChange={val => setStoragePrice(val)}
            />*/}
            <Paper bg="gray.0" p="md" radius="md" withBorder mt="md">
                <EquipmentSelector
                    label={<Stack gap="xs">
                            <LabelWithTooltip label="Compressor Setup :" tooltip="Required to compress the hydrogen for efficient storage or transport." />
                            <Anchor component={Link} to="/compressors" size="xs" mb="sm" c="blue">
                                Learn more about the different types
                            </Anchor>
                        </Stack>}
                    itemsList={compressors}
                    selectedItem={selectedCompressor}
                    onItemChange={(val) => {
                        if (compressors.list[val].id === 0){ 
                            if (!openedSections.compressor) {toggleSection('compressor')};
                            setSelectedCompressor(customCompressor);
                        } else {
                            setSelectedCompressor(compressors.list[val]);
                        }
                    }}
                    quantityOwned={compressorSettings.owned}
                    onOwnedChange={(v) => setCompressorSettings({ ...compressorSettings, owned: v })}
                    ownedLabel={compressorQuantity <= 1 ? "Already owned (No CAPEX)" : "Pre-owned compressors"}
                    max={compressorQuantity}
                />
                <Group mt="sm" mb="sm">
                    <Text size="sm" fw={600}>Hardware needed:</Text>
                    <Badge color="blue" variant="filled">{compressorQuantity} Compressor(s)</Badge>
                    {selectedCompressor.type === 'Electrochemical' && (
                        <Badge color="teal" variant="filled">{totalStacksNeeded} Stack(s)</Badge>
                    )}
                </Group>
                <DetailSection openedSections={openedSections.compressor} toggleSection={() => toggleSection('compressor')}>
                    {selectedCompressor.id === 0 && (
                        <Select
                            label="Compressor type"
                            data={["Mechanical", "Electrochemical"]}
                            value={selectedCompressor.type}
                            onChange={val => setSelectedCompressor({ ...selectedCompressor, type: val })}
                            mb="md"
                        />
                    )}
                    {!(compressorSettings.owned === compressorQuantity) && (
                        <ValueInput
                            label="Compressor purchase price"
                            units="€"
                            currentUnit="€"
                            value={selectedCompressor.price}
                            onValueChange={val => setSelectedCompressor({ ...selectedCompressor, price: val })}
                        />
                    )}
                    <ValueInput
                        label={<LabelWithTooltip label="Compressor energy consumption" tooltip="The electrical energy required by the system to increase the pressure of one kilogram of hydrogen to the target level." />}
                        units={H2_VOLUME_POWER_UNITS}
                        currentUnit={compressorSettings.cons_unit}
                        value={selectedCompressor.energy_consumption_kwh_per_kg}
                        onValueChange={val => setSelectedCompressor({ ...selectedCompressor, energy_consumption_kwh_per_kg: val })}
                        onUnitChange={(u) => setCompressorSettings({ ...compressorSettings, cons_unit: u })}
                    />
                    {selectedCompressor.type === 'Electrochemical' && (
                        <>
                            <SliderInput
                                label={<LabelWithTooltip label="Number of owned stacks" tooltip="The total number of individual cell stacks currently possessed or installed in your electrochemical compressor housing." />}
                                units="units"
                                value={compressorSettings.ownedStacks}
                                onValueChange={val => setCompressorSettings({ ...compressorSettings, ownedStacks: val })}
                                min={compressorSettings.owned}
                                max={totalStacksNeeded}
                            />
                            <ValueInput
                                label="Cell Stack Price"
                                units="€"
                                value={selectedCompressor.cell_stack_price}
                                onValueChange={val => setSelectedCompressor({ ...selectedCompressor, cell_stack_price: val })}
                            />
                            <ValueInput
                                label={<LabelWithTooltip label="Cells per stack" tooltip="The number of individual compression cells within each stack. More cells mean a higher compression flowrate per stack." />}
                                units="cells"
                                value={selectedCompressor.cells_per_stack}
                                onValueChange={val => setSelectedCompressor({ ...selectedCompressor, cells_per_stack: val })}
                                nullBlocker
                            />
                            <ValueInput
                                label={<LabelWithTooltip label="Max cells per compressor" tooltip="The maximum physical capacity of the compressor housing. Determines the upgrade limit of your setup." />}
                                units="cells"
                                value={selectedCompressor.max_cells}
                                onValueChange={val => setSelectedCompressor({ ...selectedCompressor, max_cells: val })}
                                nullBlocker
                            />
                            {showCellWarning && (
                                <Alert icon={<IconAlertCircle size={16} />} title="Suboptimal Configuration" color="orange" variant="light" mt="xs">
                                    The maximum number of cells ({selectedCompressor.max_cells}) is not a perfect multiple of the cells per stack ({selectedCompressor.cells_per_stack}). The remaining space cannot be fully utilized.
                                </Alert>
                            )}
                        </>
                    )}
                    <ValueInput
                        label={
                            <LabelWithTooltip 
                                label={selectedCompressor.type === 'Electrochemical' ? "Flowrate per cell" : "Flowrate per compressor"} 
                                tooltip={
                                    selectedCompressor.type === 'Electrochemical' 
                                    ? "The specific amount of hydrogen gas that a single electrochemical cell can compress per day." 
                                    : "The total amount of hydrogen gas that the mechanical compressor can handle per day."
                                } 
                            />
                        }
                        units={VOLUME_PER_TIME_UNITS}
                        currentUnit={compressorSettings.flow_unit}
                        value={selectedCompressor.unitary_flowrate_kg_per_day}
                        onValueChange={val => setSelectedCompressor({ ...selectedCompressor, unitary_flowrate_kg_per_day: val })}
                        onUnitChange={(u) => setCompressorSettings({ ...compressorSettings, flow_unit: u })}
                        nullBlocker
                    />
                    <ValueInput
                        label={<LabelWithTooltip label="Maintenance costs" tooltip="Annual operation and maintenance (O&M) costs, generally estimated as a percentage of the initial equipment cost (CAPEX)." />}
                        units={MAINTENANCE_UNITS}
                        currentUnit={compressorSettings.maint_unit}
                        value={selectedCompressor.maintenance_percent_capex}
                        onValueChange={val => setSelectedCompressor({ ...selectedCompressor, maintenance_percent_capex: val })}
                        onUnitChange={(u) => setCompressorSettings({ ...compressorSettings, maint_unit: u })}
                    />
                </DetailSection>
            </Paper></>)}
        </Card>
    );
}