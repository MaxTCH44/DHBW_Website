import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Title, SimpleGrid, Card, Text, Paper, Anchor, Group, Badge, Stack } from '@mantine/core';

import electrolyzers from './../data/electrolyzers.json';
import compressors from './../data/compressors.json';

import ValueInput from '../components/ValueInput.jsx';
import SliderInput from '../components/SliderInput.jsx';
import ResultDisplay from '../components/ResultDisplay.jsx';
import EquipmentSelector from '../components/EquipmentSelector.jsx';



const ELEC_PRICE_UNITS = [{ label: "€/MWh", factor: 1 }, { label: "€/kWh", factor: 1000 }];
const POWER_UNITS = [{ label: "MW", factor: 1 }, { label: "kW", factor: 1000 }];
const VOLUME_PRICE_UNITS = [{ label: "€/m³", factor: 1 }, { label: "€/L", factor: 1000 }];
const TIME_PER_YEAR_UNITS = [{ label: "days/year", factor: 1 }, { label: "h/year", factor: 24 }];
const VOLUME_UNITS = [{ label: "kg", factor: 1 }, { label: "m³", factor: 11.1 }];



export default function Production() {
  const [selectedElectrolyzer, setSelectedElectrolyzer] = useState(electrolyzers[0]);
  const [isElectrolyzerOwned, setIsElectrolyzerOwned] = useState(false);
  const [electrolyserDetail, setElectrolyserDetail] = useState(false);
  
  const [systemSize, setSystemSize] = useState({ value: 1, unit: POWER_UNITS[0] });
  const [operatingTime, setOperatingTime] = useState({ value: 4000, unit: TIME_PER_YEAR_UNITS[1] });

  const [electricityPrice, setElectricityPrice] = useState({ value: 50, unit: ELEC_PRICE_UNITS[0] }); 
  const [waterPrice, setWaterPrice] = useState({ value: 2, unit: VOLUME_PRICE_UNITS[0] });

  const [storageCapacity, setStorageCapacity] = useState({ value: 100, unit: VOLUME_UNITS[0] });
  const [storagePrice, setStoragePrice] = useState(20000);

  const [selectedCompressor, setSelectedCompressor] = useState(compressors[0]);
  const [isCompressorOwned, setIsCompressorOwned] = useState(false);
  const [compressorDetail, setCompressorDetail] = useState(false);

  const baseElecPrice = electricityPrice.value / electricityPrice.unit.factor;
  const lcoh = (((baseElecPrice) / selectedElectrolyzer.efficiency) * 10).toFixed(2); 
  const capex = (isElectrolyzerOwned ? 0 : selectedElectrolyzer.price) + (isCompressorOwned ? 0 : selectedCompressor.price) + storagePrice;

  return (
    <Container size="xl" px="xl" py="lg">
        <Title order={1} ta="center" mb="xl" c="dark.7">Hydrogen Cost Calculator</Title>
        <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="lg">
            <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Text fw={700} size="xl" mb="md" pb="xs" style={{ borderBottom: '2px solid #f0f0f0' }}>
                    Electrolyzer Setup
                </Text>
                <ValueInput 
                    label="System size" 
                    units={POWER_UNITS} 
                    currentUnit={systemSize.unit} 
                    value={systemSize.value} 
                    onValueChange={val => setSystemSize({ ...systemSize, value: val })} 
                    onUnitChange={u => setSystemSize({ ...systemSize, unit: u })} 
                />
                <ValueInput 
                    label="Operating time" 
                    units={TIME_PER_YEAR_UNITS} 
                    currentUnit={operatingTime.unit} 
                    value={operatingTime.value} 
                    onValueChange={val => setOperatingTime({ ...operatingTime, value: val })} 
                    onUnitChange={u => setOperatingTime({ ...operatingTime, unit: u })} 
                />
                <Paper bg="gray.0" p="md" radius="md" withBorder mt="md">
                    <EquipmentSelector 
                        label={
                            <Stack>
                                <span>Electrolyzer Type :</span>
                                <Anchor component={Link} to="/electrolyzers" size="xs" c="blue">
                                    Learn more about the different types
                                </Anchor>
                            </Stack>
                        }
                        itemsList={electrolyzers} 
                        selectedItem={selectedElectrolyzer} 
                        onItemChange={(val) => setSelectedElectrolyzer(electrolyzers[val])} 
                        isOwned={isElectrolyzerOwned} onOwnedChange={setIsElectrolyzerOwned} 
                        ownedLabel="We already own this electrolyzer" 
                    />
                    {!isElectrolyzerOwned && (
                        <ValueInput 
                            label="Electrolyzer purchase price" 
                            units="€" 
                            currentUnit="€" 
                            value={selectedElectrolyzer.price} 
                            onValueChange={val => setSelectedElectrolyzer({ ...selectedElectrolyzer, price: val })} 
                            onUnitChange={() => {}} 
                        />
                    )}
                    {electrolyserDetail && (
                        <SliderInput 
                            label="Efficiency" 
                            units="%" 
                            value={selectedElectrolyzer.efficiency} 
                            onValueChange={eff => setSelectedElectrolyzer({ ...selectedElectrolyzer, efficiency: eff })} 
                            min={0} 
                            max={100} 
                        />
                    )}
                    <Anchor component="button" type="button" size="sm" c="dimmed" mt="sm" onClick={() => setElectrolyserDetail(!electrolyserDetail)}>
                        {electrolyserDetail ? "Hide details" : "Show details"}
                    </Anchor>
                </Paper>
            </Card>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Text fw={700} size="xl" mb="md" pb="xs" style={{ borderBottom: '2px solid var(--mantine-color-gray-2)' }}>
                    Resources Costs
                </Text>
                <ValueInput 
                    label="Electricity price" 
                    units={ELEC_PRICE_UNITS} 
                    currentUnit={electricityPrice.unit} 
                    value={electricityPrice.value} 
                    onValueChange={val => setElectricityPrice({ ...electricityPrice, value: val })} 
                    onUnitChange={u => setElectricityPrice({ ...electricityPrice, unit: u })} 
                />
                <ValueInput 
                    label="Water price" 
                    units={VOLUME_PRICE_UNITS} 
                    currentUnit={waterPrice.unit} 
                    value={waterPrice.value} 
                    onValueChange={val => setWaterPrice({ ...waterPrice, value: val })} 
                    onUnitChange={u => setWaterPrice({ ...waterPrice, unit: u })} 
                />
            </Card>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Text fw={700} size="xl" mb="md" pb="xs" style={{ borderBottom: '2px solid var(--mantine-color-gray-2)' }}>
                    Storage & Compression
                </Text>
                <ValueInput 
                    label="Storage capacity" 
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
                    onUnitChange={() => {}} 
                />
                <Paper bg="gray.0" p="md" radius="md" withBorder mt="md">
                    <EquipmentSelector 
                        label="Compressor Type :" 
                        itemsList={compressors} 
                        selectedItem={selectedCompressor} 
                        onItemChange={(val) => setSelectedCompressor(compressors[val])} 
                        isOwned={isCompressorOwned} 
                        onOwnedChange={setIsCompressorOwned} 
                        ownedLabel="We already own a compressor" 
                    />
                    {!isCompressorOwned && (
                        <ValueInput 
                            label="Compressor price" 
                            units="€" 
                            currentUnit="€" 
                            value={selectedCompressor.price} 
                            onValueChange={val => setSelectedCompressor({ ...selectedCompressor, price: val })} 
                            onUnitChange={() => {}} 
                        />
                    )}
                    {compressorDetail && (
                        <SliderInput 
                            label="Efficiency" 
                            units="%" 
                            value={selectedCompressor.efficiency} 
                            onValueChange={eff => setSelectedCompressor({ ...selectedCompressor, efficiency: eff })} 
                            min={0} 
                            max={100} 
                        />
                    )}
                    <Anchor component="button" type="button" size="sm" c="dimmed" mt="sm" onClick={() => setCompressorDetail(!compressorDetail)}>
                        {compressorDetail ? "Hide details" : "Show details"}
                    </Anchor>
                </Paper>
            </Card>
        </SimpleGrid>
        <ResultDisplay cost={lcoh} capex={capex} />
    </Container>
  );
}