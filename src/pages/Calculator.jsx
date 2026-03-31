import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Container, Title, SimpleGrid, Card, Text, Paper, Anchor, Stack, Checkbox, Group, Badge } from '@mantine/core';

import electrolyzers from '../data/electrolyzers_list.json';
import compressors from '../data/compressors_list.json';

import ValueInput from '../components/ValueInput.jsx';
import SliderInput from '../components/SliderInput.jsx';
import ResultDisplay from '../components/ResultDisplay.jsx';
import EquipmentSelector from '../components/EquipmentSelector.jsx';
import LabelWithTooltip from '../components/LabelWithTooltip.jsx';
import DetailSection from '../components/DetailSection.jsx';



const ELEC_PRICE_UNITS = [{ label: "€/MWh", factor: 0.001 }, { label: "€/kWh", factor: 1 }];
const POWER_UNITS = [{ label: "MW", factor: 1000 }, { label: "kW", factor: 1}];
const WATER_VOLUME_PRICE_UNITS = [{ label: "€/m³", factor: 1 }, { label: "€/L", factor: 1000 }];
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

    const [systemSize, setSystemSize] = useState({ value: selectedElectrolyzer.power, unit: POWER_UNITS[1], selfProduced: 0 });
    //const [productionGoal, setProductionGoal] = useState({ value: 0, unit: VOLUME_PER_TIME_UNITS[0] });
    const [operatingTime, setOperatingTime] = useState({ value: 4000, unit: TIME_PER_YEAR_UNITS[1] });

    const [electricityPrice, setElectricityPrice] = useState({ value: 50, unit: ELEC_PRICE_UNITS[0] });
    const [waterPrice, setWaterPrice] = useState({ value: 2, unit: WATER_VOLUME_PRICE_UNITS[0] });

    const [greyHydrogenPrice, setGreyHydrogenPrice] = useState({value : 2, unit: H2_VOLUME_PRICE_UNITS[0] });
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
        cons_unit: ELEC_PRICE_UNITS[1],
        maint_unit: MAINTENANCE_UNITS[0],
        flow_unit: VOLUME_PER_TIME_UNITS[2],
        maint_value: 0
    });

    const [openedSections, setOpenedSections] = useState({ electrolyzer: false, compressor: false, system: false, greyH2: false });

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


    const electrolyzerQuantity = Math.ceil((systemSize.value * systemSize.unit.factor) / selectedElectrolyzer.power);
    
    let compressorQuantity = 0;
    let compressorCapex = 0;
    let extraStacksNeeded = 0;
    let totalStacksNeeded = 0;

    if (isCompressorNeeded && massToCompress > 0) {
        const compOpHoursPerYear = compressorSettings.operatingTime.value * compressorSettings.operatingTime.unit.factor;
        
        if (selectedCompressor.type === 'mechanical') {
            const annualCapPerComp = (selectedCompressor.unitary_flowrate_kg_per_day * compressorSettings.flow_unit.factor) * compOpHoursPerYear;
            compressorQuantity = annualCapPerComp > 0 ? Math.ceil(massToCompress / annualCapPerComp) : 0;
            
            const newComps = Math.max(0, compressorQuantity - compressorSettings.owned);
            compressorCapex = newComps * selectedCompressor.price;
        } 
        else if (selectedCompressor.type === 'electrochemical') {
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
    
    const avgInflaFactor = ((1 + inflationRate / 100) ** projectLifetime - 1) / ((inflationRate / 100) * projectLifetime);
    const smoothedElecPrice = (electricityPrice.value * electricityPrice.unit.factor) * avgInflaFactor;
    const gridElectricityRatio = systemSize.value > 0 ? Math.max(0, systemSize.value - systemSize.selfProduced) / systemSize.value : 0;
    
    const carbonTaxPerKg = EMISSIONS_PER_KG_OF_H2 * (carbonTax / 1000);
    const baseGreyPrice = greyHydrogenPrice.value * greyHydrogenPrice.unit.factor;
    const greyPriceWithTax = baseGreyPrice + carbonTaxPerKg;
    const smoothedGreyPrice = greyPriceWithTax * avgInflaFactor;

    const totalElecNeeded = (annualProd * (selectedElectrolyzer.energy_consumption_kwh_per_kg * electrolyzerSettings.cons_unit.factor)) + 
                            (isCompressorNeeded ? (massToCompress * (selectedCompressor.energy_consumption_kwh_per_kg * compressorSettings.cons_unit.factor)) : 0);

    const elecShare = annualProd > 0 ? (totalElecNeeded * smoothedElecPrice * gridElectricityRatio) / annualProd : 0;
    const waterShare = WATER_PER_KG_OF_H2 * (waterPrice.value * waterPrice.unit.factor);
    
    const annualElectrolyzerMaintenance = electrolyzerSettings.maint_unit.label === "€" 
        ? selectedElectrolyzer.maintenance_percent_capex * electrolyzerQuantity
        : (selectedElectrolyzer.price * electrolyzerQuantity) * (selectedElectrolyzer.maintenance_percent_capex / 100);

    const totalCompressorHardwareValue = (compressorQuantity * selectedCompressor.price) + (extraStacksNeeded * (selectedCompressor.cell_stack_price || 0));
    
    const annualCompressorMaintenance = isCompressorNeeded 
        ? (compressorSettings.maint_unit.label === "€" 
            ? (compressorSettings.maint_value * compressorQuantity)
            : totalCompressorHardwareValue * (selectedCompressor.maintenance_percent_capex / 100))
        : 0;
    
    const showCellWarning = selectedCompressor.type === 'electrochemical' && selectedCompressor.cells_per_stack > 0 && (selectedCompressor.max_cells % selectedCompressor.cells_per_stack !== 0);

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
        annualWater: annualProd * WATER_PER_KG_OF_H2,
        installedCapacity: installedElectrolyzerPower,
        utilizationRate: utilizationRate 
    };

    const greyDetails = {
        base: baseGreyPrice,
        tax: carbonTaxPerKg,
        totalWithTax: greyPriceWithTax,
        smoothed: smoothedGreyPrice
    };


    return (
        <Container size="xl" px="xl" py="lg">
            <Title order={1} ta="center" mb="xl" c="dark.7">Hydrogen Cost Calculator</Title>
            <Text c="dimmed" ta="center" maw={800} mx="auto" mb="xl">
                Estimate the Levelized Cost of Hydrogen (LCOH) and total capital expenditure (CAPEX) for your production plant. 
                Adjust system parameters, resource costs, and financial variables to simulate different techno-economic scenarios.
            </Text>
            <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="lg" style={{ alignItems: 'flex-start' }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Text fw={700} size="xl" mb="md" pb="xs" style={{ borderBottom: '2px solid #f0f0f0' }}>
                        Electrolyzer Setup
                    </Text>
                    <ValueInput
                        label={<LabelWithTooltip label="System size" tooltip="Total electrical power capacity of your electrolyzer setup." />}
                        units={POWER_UNITS}
                        currentUnit={systemSize.unit}
                        value={systemSize.value}
                        onValueChange={val => setSystemSize({ ...systemSize, value: val })}
                        onUnitChange={u => setSystemSize({ ...systemSize, unit: u })}
                        nullBlocker
                    />
                    <DetailSection openedSections={openedSections.system} toggleSection={() => toggleSection('system')}>
                        <SliderInput 
                            label={<LabelWithTooltip label="Self-produced" tooltip="The share of the electrical power needed for your setup which you produce by yourself" />}
                            units={systemSize.unit.label}
                            value={systemSize.selfProduced}
                            onValueChange={v => setSystemSize({ ...systemSize, selfProduced: v })}
                            min={0}
                            max={systemSize.value}
                        />
                    </DetailSection>
                    <ValueInput
                        label={<LabelWithTooltip label="Operating time" tooltip="Number of hours or days the system operates continuously per year." />}
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
                            itemsList={electrolyzers}
                            selectedItem={selectedElectrolyzer}
                            onItemChange={(val) => {
                                const newElectrolyzer = electrolyzers.list[val];
                                const currentSystemPowerInKw = systemSize.value * systemSize.unit.factor;
                                if (currentSystemPowerInKw === selectedElectrolyzer.power) {
                                    setSystemSize({ ...systemSize, value: newElectrolyzer.power / systemSize.unit.factor });
                                }
                                setSelectedElectrolyzer(newElectrolyzer);
                            }}
                            quantityOwned={electrolyzerSettings.owned} 
                            onOwnedChange={(v) => setElectrolyzerSettings({ ...electrolyzerSettings, owned: v })}
                            ownedLabel={electrolyzerQuantity <= 1 ? "Already owned (No CAPEX)" : "Pre-owned electrolyzers"}
                            max={electrolyzerQuantity}
                        />
                        <DetailSection openedSections={openedSections.electrolyzer} toggleSection={() => toggleSection('electrolyzer')}>
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
                                label="Electrolyzer power"
                                units="kW"
                                currentUnit="kW"
                                value={selectedElectrolyzer.power}
                                onValueChange={val => setSelectedElectrolyzer({ ...selectedElectrolyzer, power: val })}
                                nullBlocker
                            />
                            <ValueInput
                                label="Electrolyzer energy consumption"
                                units={H2_VOLUME_POWER_UNITS}
                                currentUnit={electrolyzerSettings.cons_unit}
                                value={selectedElectrolyzer.energy_consumption_kwh_per_kg}
                                onValueChange={val => setSelectedElectrolyzer({ ...selectedElectrolyzer, energy_consumption_kwh_per_kg: val })}
                                onUnitChange={(u) => setElectrolyzerSettings({ ...electrolyzerSettings, cons_unit : u })}
                                nullBlocker
                            />
                            <ValueInput
                                label="Maintenance costs"
                                units={MAINTENANCE_UNITS}
                                currentUnit={electrolyzerSettings.maint_unit}
                                value={selectedElectrolyzer.maintenance_percent_capex}
                                onValueChange={val => setSelectedElectrolyzer({ ...selectedElectrolyzer, maintenance_percent_capex: val })}
                                onUnitChange={(u) => setElectrolyzerSettings({ ...electrolyzerSettings, maint_unit : u })}
                            />
                        </DetailSection>
                    </Paper>
                </Card>
                <Stack gap="lg">
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Text fw={700} size="xl" mb="md" pb="xs" style={{ borderBottom: '2px solid var(--mantine-color-gray-2)' }}>
                        Resources Costs
                    </Text>
                    <ValueInput
                        label={<LabelWithTooltip label="Electricity price" tooltip="Average cost of electricity." />}
                        units={ELEC_PRICE_UNITS}
                        currentUnit={electricityPrice.unit}
                        value={electricityPrice.value}
                        onValueChange={val => setElectricityPrice({ ...electricityPrice, value: val })}
                        onUnitChange={u => setElectricityPrice({ ...electricityPrice, unit: u })}
                    />
                    <ValueInput
                        label={<LabelWithTooltip label="Water price" tooltip="Cost of purified water supply for the electrolysis process." />}
                        units={WATER_VOLUME_PRICE_UNITS}
                        currentUnit={waterPrice.unit}
                        value={waterPrice.value}
                        onValueChange={val => setWaterPrice({ ...waterPrice, value: val })}
                        onUnitChange={u => setWaterPrice({ ...waterPrice, unit: u })}
                    />
                    <ValueInput
                        label={<LabelWithTooltip label="Grey Hydrogen price" tooltip="Cost of grey hydrogen." />}
                        units={H2_VOLUME_PRICE_UNITS}
                        currentUnit={greyHydrogenPrice.unit}
                        value={greyHydrogenPrice.value}
                        onValueChange={val => setGreyHydrogenPrice({ ...greyHydrogenPrice, value: val })}
                        onUnitChange={u => setGreyHydrogenPrice({ ...greyHydrogenPrice, unit: u })}
                    />
                    <DetailSection openedSections={openedSections.greyH2} toggleSection={() => toggleSection('greyH2')}>
                        <ValueInput
                            label="Carbon Tax"
                            units="€/t CO₂"
                            currentUnit="€/t CO₂"
                            value={carbonTax}
                            onValueChange={val => setCarbonTax(val)}
                        />
                    </DetailSection>  
                </Card>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
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
                        label={<LabelWithTooltip label="Interest Rate" tooltip="The average percentage of annual electricity price increase. " />}
                        units="%"
                        currentUnit="%"
                        value={inflationRate}
                        onValueChange={val => setInflationRate(val)}
                    />
                </Card>
                </Stack>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Text fw={700} size="xl" mb="md" pb="xs" style={{ borderBottom: '2px solid var(--mantine-color-gray-2)' }}>
                        Compressor Setup
                    </Text>
                    <Checkbox mb="sm"
                        label="We need to use a compressor"
                        checked={isCompressorNeeded}
                        onChange={(e) => setIsCompressorNeeded(e.currentTarget.checked)}
                    />
                    {isCompressorNeeded && <SliderInput 
                        label={<LabelWithTooltip label="Hydrogen to compress" tooltip="Mass of hydrogen you need to compress" />}
                        units="kg"
                        value={massToCompress}
                        onValueChange={v => setMassToCompress(Math.round(v))}
                        min={0}
                        max={Math.round(annualProd)}
                    />}
                    {isCompressorNeeded && <ValueInput
                        label="Operating time"
                        units={TIME_PER_YEAR_UNITS}
                        currentUnit={compressorSettings.operatingTime.unit}
                        value={compressorSettings.operatingTime.value}
                        max={365 * 24 / compressorSettings.operatingTime.unit.factor}
                        onValueChange={(val) => setCompressorSettings({ ...compressorSettings, operatingTime: { ...compressorSettings.operatingTime, value: val } })}
                        onUnitChange={(u) => setCompressorSettings({ ...compressorSettings, operatingTime: { ...compressorSettings.operatingTime, unit: u } })}
                        nullBlocker
                    />}
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
                    {isCompressorNeeded && (<Paper bg="gray.0" p="md" radius="md" withBorder mt="md">
                        <EquipmentSelector
                            label={<Stack gap="xs">
                                    <LabelWithTooltip label="Compressor Setup :" tooltip="Required to compress the hydrogen for efficient storage or transport." />
                                    <Anchor component={Link} to="/compressors" size="xs" mb="sm" c="blue">
                                        Learn more about the different types
                                    </Anchor>
                                </Stack>}
                            itemsList={compressors}
                            selectedItem={selectedCompressor}
                            onItemChange={(val) => setSelectedCompressor(compressors.list[val])}
                            quantityOwned={compressorSettings.owned}
                            onOwnedChange={(v) => setCompressorSettings({ ...compressorSettings, owned: v })}
                            ownedLabel={compressorQuantity <= 1 ? "Already owned (No CAPEX)" : "Pre-owned compressors"}
                            max={compressorQuantity}
                        />
                        <Group mt="sm" mb="sm">
                            <Text size="sm" fw={600}>Hardware needed:</Text>
                            <Badge color="blue" variant="filled">{compressorQuantity} Compressor(s)</Badge>
                            {selectedCompressor.type === 'electrochemical' && (
                                <Badge color="teal" variant="filled">{totalStacksNeeded} Stack(s)</Badge>
                            )}
                        </Group>
                        <DetailSection openedSections={openedSections.compressor} toggleSection={() => toggleSection('compressor')}>
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
                                label="Compressor energy consumption"
                                units={H2_VOLUME_POWER_UNITS}
                                currentUnit={compressorSettings.cons_unit}
                                value={selectedCompressor.energy_consumption_kwh_per_kg}
                                onValueChange={val => setSelectedCompressor({ ...selectedCompressor, energy_consumption_kwh_per_kg: val })}
                                onUnitChange={(u) => setCompressorSettings({ ...compressorSettings, cons_unit: u })}
                            />
                            {selectedCompressor.type === 'electrochemical' && (
                                <>
                                    <ValueInput
                                        label="Number of owned stacks"
                                        units="units"
                                        value={compressorSettings.ownedStacks}
                                        onValueChange={val => setCompressorSettings({ ...compressorSettings, ownedStacks: Math.max(val, compressorSettings.owned) })}
                                    />
                                    <ValueInput
                                        label="Cell Stack Price"
                                        units="€"
                                        value={selectedCompressor.cell_stack_price}
                                        onValueChange={val => setSelectedCompressor({ ...selectedCompressor, cell_stack_price: val })}
                                    />
                                    <ValueInput
                                        label="Cells per stack"
                                        units="cells"
                                        value={selectedCompressor.cells_per_stack}
                                        onValueChange={val => setSelectedCompressor({ ...selectedCompressor, cells_per_stack: val })}
                                        nullBlocker
                                    />
                                    <ValueInput
                                        label="Max cells per compressor"
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
                                label={selectedCompressor.type === 'electrochemical' ? "Flowrate per cell" : "Flowrate per compressor"}
                                units={VOLUME_PER_TIME_UNITS}
                                currentUnit={compressorSettings.flow_unit}
                                value={selectedCompressor.unitary_flowrate_kg_per_day}
                                onValueChange={val => setSelectedCompressor({ ...selectedCompressor, unitary_flowrate_kg_per_day: val })}
                                onUnitChange={(u) => setCompressorSettings({ ...compressorSettings, flow_unit: u })}
                                nullBlocker
                            />
                            <ValueInput
                                label="Maintenance costs"
                                units={MAINTENANCE_UNITS}
                                currentUnit={compressorSettings.maint_unit}
                                value={selectedCompressor.maintenance_percent_capex}
                                onValueChange={val => setSelectedCompressor({ ...selectedCompressor, maintenance_percent_capex: val })}
                                onUnitChange={(u) => setCompressorSettings({ ...compressorSettings, maint_unit: u })}
                            />
                        </DetailSection>
                    </Paper>)}
                </Card>
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
        </Container>
    );
}