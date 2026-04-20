import { Card, Text, Box, Checkbox, Paper, Group, Badge, Alert, Stack, Anchor } from '@mantine/core';
import { Link } from 'react-router-dom';
import { IconAlertCircle } from '@tabler/icons-react';

import ValueInput from '../ValueInput';
import SliderInput from '../SliderInput';
import LabelWithTooltip from '../LabelWithTooltip';
import DetailSection from '../DetailSection';
import EquipmentSelector from './EquipmentSelector';

import { VOLUME_PER_TIME_UNITS, MAINTENANCE_UNITS, TIME_PER_YEAR_UNITS, VOLUME_UNITS, H2_VOLUME_POWER_UNITS } from './calculatorConstants';



export default function CompressorSetup ({
    compressors,
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
    totalCompStacksNeeded,
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
            <Box id="is_compressor_needed">
            <Checkbox mb="sm"
                label="We need to use a compressor"
                checked={isCompressorNeeded}
                onChange={(e) => setIsCompressorNeeded(e.currentTarget.checked)}
            />
            </Box>
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
                id="compressor_operating_time"
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
                    id="compressor_selector"
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
                <Text size="sm" fw={600}>Hardware needed:</Text>
                <Group mt="sm" mb="sm">
                    <Badge color="blue" variant="filled">{compressorQuantity} Compressor Setup(s)</Badge>
                    {selectedCompressor.type === 'Electrochemical' && (
                        <Badge color="teal" variant="filled">{totalCompStacksNeeded} Stack(s)</Badge>
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
                            label={<LabelWithTooltip label="Compressor purchase price" tooltip="Total initial purchase cost (CAPEX) including all necessary auxiliary components. For electrochemical systems, the first cell stack is already included in this base price." />}
                            id="compressor_price"
                            units="€"
                            currentUnit="€"
                            value={selectedCompressor.price}
                            onValueChange={val => setSelectedCompressor({ ...selectedCompressor, price: val })}
                        />
                    )}
                    <ValueInput
                        label={<LabelWithTooltip label="Compressor energy consumption" tooltip="The electrical energy required by the system to increase the pressure of one kilogram of hydrogen to the target level." />}
                        id="compressor_energy_consumption"
                        units={H2_VOLUME_POWER_UNITS}
                        currentUnit={compressorSettings.cons_unit}
                        value={selectedCompressor.energy_consumption_kwh_per_kg}
                        onValueChange={val => setSelectedCompressor({ ...selectedCompressor, energy_consumption_kwh_per_kg: val })}
                        onUnitChange={(u) => setCompressorSettings({ ...compressorSettings, cons_unit: u })}
                    />
                    {selectedCompressor.type === 'Electrochemical' && (
                        <>
                            {(totalCompStacksNeeded !== 1 || compressorSettings.owned !== 1) &&<SliderInput
                                label={<LabelWithTooltip label="Number of owned stacks" tooltip="The total number of individual cell stacks currently possessed or installed in your electrochemical compressor housing." />}
                                id="compressor_owned_stacks"
                                units="units"
                                value={compressorSettings.ownedStacks}
                                onValueChange={val => setCompressorSettings({ ...compressorSettings, ownedStacks: val })}
                                min={compressorSettings.owned}
                                max={totalCompStacksNeeded}
                            />}
                            <ValueInput
                                label={<LabelWithTooltip label="Cell Stack Price" tooltip="The replacement cost of a single electrochemical cell stack. This is used to project long-term maintenance expenses over the project's lifetime." />}
                                id="compessor_stack_price"
                                units="€"
                                value={selectedCompressor.cell_stack_price}
                                onValueChange={val => setSelectedCompressor({ ...selectedCompressor, cell_stack_price: val })}
                            />
                            <ValueInput
                                label={<LabelWithTooltip label="Cells per stack" tooltip="The number of individual compression cells within each stack. More cells mean a higher compression flowrate per stack." />}
                                id="cells_per_stack"
                                units="cells"
                                value={selectedCompressor.cells_per_stack}
                                onValueChange={val => setSelectedCompressor({ ...selectedCompressor, cells_per_stack: val })}
                                nullBlocker
                            />
                            <ValueInput
                                label={<LabelWithTooltip label="Max cells per compressor" tooltip="The maximum physical capacity of the compressor housing. Determines the upgrade limit of your setup." />}
                                id="max_cells"
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
                        id="flowrate"
                        units={VOLUME_PER_TIME_UNITS}
                        currentUnit={compressorSettings.flow_unit}
                        value={selectedCompressor.unitary_flowrate_kg_per_day}
                        onValueChange={val => setSelectedCompressor({ ...selectedCompressor, unitary_flowrate_kg_per_day: val })}
                        onUnitChange={(u) => setCompressorSettings({ ...compressorSettings, flow_unit: u })}
                        nullBlocker
                    />
                    <ValueInput
                        label={<LabelWithTooltip label="Maintenance costs" tooltip="Annual operation and maintenance (O&M) costs, generally estimated as a percentage of the initial equipment cost (CAPEX)." />}
                        id="compressor_maintenance_costs"
                        units={MAINTENANCE_UNITS}
                        currentUnit={compressorSettings.maint_unit}
                        value={selectedCompressor.maintenance_percent_capex}
                        onValueChange={val => setSelectedCompressor({ ...selectedCompressor, maintenance_percent_capex: val })}
                        onUnitChange={(u) => setCompressorSettings({ ...compressorSettings, maint_unit: u })}
                    />
                    {selectedCompressor.type === 'Electrochemical' && <ValueInput
                        label={<LabelWithTooltip label="Stack Lifetime" tooltip="The operational lifespan of the electrochemical cell stack in hours before a replacement is needed. This impacts your long-term operational expenditures." />}
                        id="compressor_stack_lifetime"
                        units="h"
                        currentUnit="h"
                        value={selectedCompressor.stack_lifetime_hours}
                        onValueChange={val => setSelectedCompressor({ ...selectedCompressor, stack_lifetime_hours: val })}
                        nullBlocker
                    />}
                </DetailSection>
            </Paper></>)}
        </Card>
    );
}