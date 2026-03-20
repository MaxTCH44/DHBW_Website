import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Title, SimpleGrid, Card, Text, Paper, Anchor, Stack, Checkbox, Collapse } from '@mantine/core';

import electrolyzers from '../data/electrolyzers_list.json';
import compressors from '../data/compressors_list.json';

import ValueInput from '../components/ValueInput.jsx';
import SliderInput from '../components/SliderInput.jsx';
import ResultDisplay from '../components/ResultDisplay.jsx';
import EquipmentSelector from '../components/EquipmentSelector.jsx';
import LabelWithTooltip from '../components/LabelWithTooltip.jsx';



const ELEC_PRICE_UNITS = [{ label: "€/MWh", factor: 0.001 }, { label: "€/kWh", factor: 1 }];
const POWER_UNITS = [{ label: "MW", factor: 1000 }, { label: "kW", factor: 1}];
const WATER_VOLUME_PRICE_UNITS = [{ label: "€/m³", factor: 1 }, { label: "€/L", factor: 1000 }];
const TIME_PER_YEAR_UNITS = [{ label: "days/year", factor: 24 }, { label: "h/year", factor: 1 }];
const VOLUME_PER_TIME_UNITS = [{ label: "kg/year", factor: 1 }, { label: "m³/year", factor: 11.1 }, { label: "kg/day", factor: 365 }, { label: "m³", factor: 4051.5 }];
const VOLUME_UNITS = [{ label: "kg", factor: 1 }, { label: "m³", factor: 11.1 }];
const H2_VOLUME_PRICE_UNITS = [{ label: "€/kg", factor: 1 }, { label: "€/m³", factor: 11.1 }];
const MAINTENANCE_UNITS = [{ label: "% CAPEX", factor: 1 }, { label: "€", factor: 1 }];

export default function Calculator() {
    const [selectedElectrolyzer, setSelectedElectrolyzer] = useState(electrolyzers[0]);
    const [electrolyzerSettings, setElectrolyzerSettings] = useState({unit: MAINTENANCE_UNITS[0], owned: 0});

    const [systemSize, setSystemSize] = useState({ value: 5, unit: POWER_UNITS[1], selfProduced: 0 });
    const [productionGoal, setProductionGoal] = useState({ value: 0, unit: VOLUME_PER_TIME_UNITS[0] });
    const [operatingTime, setOperatingTime] = useState({ value: 4000, unit: TIME_PER_YEAR_UNITS[1] });

    const [electricityPrice, setElectricityPrice] = useState({ value: 50, unit: ELEC_PRICE_UNITS[0] });
    const [waterPrice, setWaterPrice] = useState({ value: 2, unit: WATER_VOLUME_PRICE_UNITS[0] });
    const [greyHydrogenPrice, setGreyHydrogenPrice] = useState({value : 2, unit: H2_VOLUME_PRICE_UNITS[0] });

    const [projectLifetime, setProjectLifetime] = useState(15);
    const [inflationRate, setInflationRate] = useState(2);

    //const [storageCapacity, setStorageCapacity] = useState({ value: 100, unit: VOLUME_UNITS[0] });
    //const [storagePrice, setStoragePrice] = useState(20000);

    const [isCompressorNeeded, setIsCompressorNeeded] = useState(true);
    const [selectedCompressor, setSelectedCompressor] = useState(compressors[0]);
    const [compressorSettings, setCompressorSettings] = useState({unit: MAINTENANCE_UNITS[0], owned: 0});

    const [openedSections, setOpenedSections] = useState({ electrolyzer: false, compressor: false, system: false});

    function toggleSection (sectionName){
        setOpenedSections((prev) => ({
            ...prev,
            [sectionName]: !prev[sectionName]
        }));
    };


    const waterPerKgOfH = 0.015; //m³ of water
    const electrolyzerQuantity = Math.ceil((systemSize.value * systemSize.unit.factor) / selectedElectrolyzer.power);
    const compressorQuantity = 1;


    const annualProd = ((systemSize.value * systemSize.unit.factor) * (operatingTime.value * operatingTime.unit.factor)) / selectedElectrolyzer.energy_consumption_kwh_per_kg;
    
    const capex = ((electrolyzerQuantity - electrolyzerSettings.owned) * selectedElectrolyzer.price) + (isCompressorNeeded ? ((compressorQuantity - compressorSettings.owned) * selectedCompressor.price) : 0);
    const annualDepre = capex / projectLifetime;
    const capexPerKgShare = annualDepre / annualProd;
    
    const avgInflaFactor = ((1 + inflationRate / 100) ** projectLifetime - 1) / ((inflationRate / 100) * projectLifetime);
    const smoothedElecPrice = (electricityPrice.value * electricityPrice.unit.factor) * avgInflaFactor;
    const gridElectricityRatio = systemSize.value > 0 ? (systemSize.value - systemSize.selfProduced) / systemSize.value : 0;

    const elecShare = (selectedElectrolyzer.energy_consumption_kwh_per_kg + (isCompressorNeeded ? selectedCompressor.energy_consumption_kwh_per_kg : 0)) * smoothedElecPrice * gridElectricityRatio;
    const waterShare = waterPerKgOfH * (waterPrice.value * waterPrice.unit.factor);
    const electrolyzerMaintenance = electrolyzerSettings.unit.label === "€" ? selectedElectrolyzer.maintenance_percent_capex : (selectedElectrolyzer.price * selectedElectrolyzer.maintenance_percent_capex/100);
    const compressorMaintenance = compressorSettings.unit.label === "€" ? selectedCompressor.maintenance_percent_capex : (selectedCompressor.price * selectedCompressor.maintenance_percent_capex/100);
    const maintenanceShare = (electrolyzerMaintenance * electrolyzerQuantity + compressorMaintenance * compressorQuantity) / annualProd;
    
    const lcoh = capexPerKgShare + elecShare + waterShare + maintenanceShare;
    
    const greyPrice = greyHydrogenPrice.value * greyHydrogenPrice.unit.factor;
    const costDifference = greyPrice - lcoh; 
    const annualDifference = costDifference * annualProd;

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
                    />
                    <Collapse in={openedSections.system}>
                        <Card mb="sm" bg="green.0">
                        <SliderInput 
                            label={<LabelWithTooltip label="Self-produced" tooltip="The share of the electrical power needed for your setup which you produce by yourself" />}
                            units={systemSize.unit.label}
                            value={systemSize.selfProduced}
                            onValueChange={v => setSystemSize({ ...systemSize, selfProduced: v })}
                            min={0}
                            max={systemSize.value}
                        />
                        </Card>
                    </Collapse>
                    <Anchor component="button" type="button" size="sm" c="dimmed" mb="sm" onClick={() => toggleSection('system')}>
                        {openedSections.system ? "Hide details" : "Show details"}
                    </Anchor>
                    <ValueInput
                        label={<LabelWithTooltip label="Operating time" tooltip="Number of hours or days the system operates continuously per year." />}
                        units={TIME_PER_YEAR_UNITS}
                        currentUnit={operatingTime.unit}
                        value={operatingTime.value}
                        onValueChange={val => setOperatingTime({ ...operatingTime, value: val })}
                        onUnitChange={u => setOperatingTime({ ...operatingTime, unit: u })}
                    />
                    <Paper bg="gray.0" p="md" radius="md" withBorder mt="md">
                        <EquipmentSelector
                            label={
                                <Stack gap="xs">
                                    <LabelWithTooltip label="Electrolyzer Type :" tooltip="Different technologies have distinct efficiencies and costs. Check the 'Learn' section for details." />
                                    <Anchor component={Link} to="/electrolyzers" size="xs" mb="sm" c="blue">
                                        Learn more about the different types
                                    </Anchor>
                                </Stack>
                            }
                            itemsList={electrolyzers}
                            selectedItem={selectedElectrolyzer}
                            onItemChange={(val) => setSelectedElectrolyzer(electrolyzers[val])}
                            quantityOwned={electrolyzerSettings.owned} 
                            onOwnedChange={(v) => setElectrolyzerSettings({ ...electrolyzerSettings, owned: v })}
                            ownedLabel={electrolyzerQuantity <= 1 ? "We already own this electrolyzer" : "Number of own electrolyzers"}
                            max={electrolyzerQuantity}
                        />
                        {(!(electrolyzerSettings.owned === electrolyzerQuantity) || systemSize) && (
                            <ValueInput
                                label="Electrolyzer purchase price"
                                units="€"
                                currentUnit="€"
                                value={selectedElectrolyzer.price}
                                onValueChange={val => setSelectedElectrolyzer({ ...selectedElectrolyzer, price: val })}
                                onUnitChange={() => { }}
                            />
                        )}
                        <Collapse in={openedSections.electrolyzer}>
                            <Card bg="green.0">
                            <ValueInput
                                label="Electrolyzer energy consumption"
                                units="kWh/kg"
                                currentUnit="kWh/kg"
                                value={selectedElectrolyzer.energy_consumption_kwh_per_kg}
                                onValueChange={val => setSelectedElectrolyzer({ ...selectedElectrolyzer, energy_consumption_kwh_per_kg: val })}
                                onUnitChange={() => { }}
                            />
                            <ValueInput
                                label="Maintenance costs"
                                units={MAINTENANCE_UNITS}
                                currentUnit={electrolyzerSettings.unit}
                                value={selectedElectrolyzer.maintenance_percent_capex}
                                onValueChange={val => setSelectedElectrolyzer({ ...selectedElectrolyzer, maintenance_percent_capex: val })}
                                onUnitChange={(u) => setElectrolyzerSettings({ ...electrolyzerSettings, unit : u })}
                            />
                            </Card>
                        </Collapse>
                        <Anchor component="button" type="button" size="sm" c="dimmed" mt="sm" onClick={() => toggleSection('electrolyzer')}>
                            {openedSections.electrolyzer ? "Hide details" : "Show details"}
                        </Anchor>
                    </Paper>
                </Card>
                <Stack gap="lg">
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Text fw={700} size="xl" mb="md" pb="xs" style={{ borderBottom: '2px solid var(--mantine-color-gray-2)' }}>
                        Resources Costs
                    </Text>
                    <ValueInput
                        label={<LabelWithTooltip label="Electricity price" tooltip="Average cost of electricity required to split water into hydrogen and oxygen." />}
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
                        onUnitChange={() => { }}
                    />
                    <ValueInput
                        label={<LabelWithTooltip label="Interest Rate" tooltip="The discount rate or cost of capital used to calculate the levelized cost." />}
                        units="%"
                        currentUnit="%"
                        value={inflationRate}
                        onValueChange={val => setInflationRate(val)}
                        onUnitChange={() => { }}
                    />
                </Card>
                </Stack>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Text fw={700} size="xl" mb="md" pb="xs" style={{ borderBottom: '2px solid var(--mantine-color-gray-2)' }}>
                        Compressor Setup
                    </Text>
                    <Checkbox
                        label="We need to use a compressor"
                        checked={isCompressorNeeded}
                        onChange={(e) => setIsCompressorNeeded(e.currentTarget.checked)}
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
                        onUnitChange={() => { }}
                    />*/}
                    {isCompressorNeeded && (<Paper bg="gray.0" p="md" radius="md" withBorder mt="md">
                        <EquipmentSelector
                            label={<Stack gap="xs">
                                    <LabelWithTooltip label="Compressor Type :" tooltip="Required to compress the hydrogen for efficient storage or transport." />
                                    <Anchor component={Link} to="/compressors" size="xs" mb="sm" c="blue">
                                        Learn more about the different types
                                    </Anchor>
                                </Stack>}
                            itemsList={compressors}
                            selectedItem={selectedCompressor}
                            onItemChange={(val) => setSelectedCompressor(compressors[val])}
                            quantityOwned={compressorSettings.owned}
                            onOwnedChange={(v) => setCompressorSettings({ ...compressorSettings, owned: v })}
                            ownedLabel="We already own this compressor"
                            max={1}
                        />
                        {!(compressorSettings.owned === compressorQuantity) && (
                            <ValueInput
                                label="Compressor purchase price"
                                units="€"
                                currentUnit="€"
                                value={selectedCompressor.price}
                                onValueChange={val => setSelectedCompressor({ ...selectedCompressor, price: val })}
                                onUnitChange={() => { }}
                            />
                        )}
                        <Collapse in={openedSections.compressor}>
                            <Card bg="green.0">
                            <ValueInput
                                label="Compressor energy consumption"
                                units="kWh/kg"
                                currentUnit="kWh/kg"
                                value={selectedCompressor.energy_consumption_kwh_per_kg}
                                onValueChange={val => setSelectedCompressor({ ...selectedCompressor, energy_consumption_kwh_per_kg: val })}
                                onUnitChange={() => { }}
                            />
                            <ValueInput
                                label="Maintenance costs"
                                units={MAINTENANCE_UNITS}
                                currentUnit={compressorSettings.unit}
                                value={selectedCompressor.maintenance_percent_capex}
                                onValueChange={val => setSelectedCompressor({ ...selectedCompressor, maintenance_percent_capex: val })}
                                onUnitChange={(u) => setCompressorSettings({ ...compressorSettings, unit: u })}
                            />
                            </Card>
                        </Collapse>
                        <Anchor component="button" type="button" size="sm" c="dimmed" mt="sm" onClick={() => toggleSection('compressor')}>
                            {openedSections.compressor ? "Hide details" : "Show details"}
                        </Anchor>
                    </Paper>)}
                </Card>
            </SimpleGrid>
            <ResultDisplay cost={lcoh} capex={capex} costDifference={costDifference} annualDifference={annualDifference} />
        </Container>
    );
}