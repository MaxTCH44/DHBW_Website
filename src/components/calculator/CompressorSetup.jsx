import { Card, Text, Box, Checkbox, Paper, Group, Badge, Alert, Stack, Anchor, Select } from '@mantine/core';
import { Link } from 'react-router-dom';
import { IconAlertCircle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { memo } from 'react';

import ValueInput from '../ValueInput';
import SliderInput from '../SliderInput';
import LabelWithTooltip from '../LabelWithTooltip';
import DetailSection from '../DetailSection';
import EquipmentSelector from './EquipmentSelector';
import { VOLUME_PER_TIME_UNITS, MAINTENANCE_UNITS, TIME_PER_YEAR_UNITS, H2_VOLUME_POWER_UNITS } from './calculatorConstants';

const MAP_TYPE = {
    "Mechanical": "Mechanical",
    "Electrochemical": "Electrochemical"
}


/**
 * Manages the configuration and financial parameters of the hydrogen compression system.
 * It handles the physical sizing (mass to compress, flowrate) and distinguishes between 
 * mechanical and electrochemical technologies to accurately project CAPEX and OPEX.
 * * @param {Object} props - Destructured state and setters from the parent Calculator logic.
 * @param {Object} props.compressors - JSON data containing the list of available industrial compressors.
 * @param {boolean} props.isCompressorNeeded - Toggles the inclusion of compression in global calculations.
 * @param {Function} props.setIsCompressorNeeded - Setter for the compressor requirement toggle.
 * @param {number} props.massToCompress - Total mass of H2 (in kg) targeted for compression.
 * @param {Function} props.setMassToCompress - Setter for the targeted mass to compress.
 * @param {number} props.annualProd - Total annual hydrogen production (used as a maximum threshold).
 * @param {Object} props.compressorSettings - Global operating parameters (operating time, owned units, unit states).
 * @param {Function} props.setCompressorSettings - Setter for global compressor settings.
 * @param {Object} props.selectedCompressor - Data object of the specific compressor model currently active.
 * @param {Function} props.setSelectedCompressor - Setter for the active compressor model.
 * @param {Object} props.customCompressor - Template object used when creating a custom compressor from scratch.
 * @param {number} props.compressorQuantity - Calculated number of full compressor units required.
 * @param {number} props.totalCompStacksNeeded - Calculated number of electrochemical stacks required.
 * @param {boolean} props.showCellWarning - Flag triggered if max_cells is not a perfect multiple of cells_per_stack.
 * @param {Object} props.openedSections - Tracks which detail sections (accordions) are expanded.
 * @param {Function} props.toggleSection - Handler to toggle the visibility of specific sections.
 * @param {boolean} props.isAdvancedMode - Toggles between a simplified view and full technical customization.
 */
function CompressorSetup ({
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
    const { t } = useTranslation("calculator");
    
    return(
        <Card shadow="sm" padding="lg" radius="md" withBorder>
                    
            <Text fw={700} size="xl" mb="md" pb="xs" style={{ borderBottom: '2px solid var(--mantine-color-gray-2)' }}>
                {t('compressorSetup.title')}
            </Text>
            
            {/* --- COMPRESSOR TOGGLE & GENERAL SIZING --- */}
            {/* Compression is not mandatory for all projects (e.g., immediate local consumption at low pressure). */}
            <Box id="is_compressor_needed">
                <Checkbox mb="sm"
                    label={t('compressorSetup.useCompressor')}
                    checked={isCompressorNeeded}
                    onChange={(e) => setIsCompressorNeeded(e.currentTarget.checked)}
                />
            </Box>

            {isCompressorNeeded && isAdvancedMode && (
                <>
                    <SliderInput
                        id="h2_to_compress" 
                        label={
                            <LabelWithTooltip 
                                label={t('compressorSetup.hydrogenToCompress.label')} 
                                tooltip={t('compressorSetup.hydrogenToCompress.tooltip')} 
                            />
                        }
                        units={t('units.kg')}
                        value={massToCompress}
                        onValueChange={v => setMassToCompress(Math.round(v))}
                        min={0}
                        max={Math.round(annualProd)}
                    />
                    
                    <ValueInput
                        label={
                            <LabelWithTooltip 
                                label={t('compressorSetup.operatingTime.label')} 
                                tooltip={t('compressorSetup.operatingTime.tooltip')} 
                            />
                        }
                        id="compressor_operating_time"
                        units={TIME_PER_YEAR_UNITS}
                        currentUnit={compressorSettings.operatingTime.unit}
                        namespace="calculator"
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

                    {/* --- EQUIPMENT SELECTION --- */}
                    {/* Maps over the pre-defined JSON list of industrial compressors. */}
                    <Paper bg="gray.0" p="md" radius="md" withBorder mt="md">
                        <EquipmentSelector
                            id="compressor_selector"
                            label={
                                <Stack gap="xs">
                                    <LabelWithTooltip 
                                        label={t('compressorSetup.equipmentSelector.label')} 
                                        tooltip={t('compressorSetup.equipmentSelector.tooltip')} 
                                    />
                                    <Anchor component={Link} to="/compressors" size="xs" mb="sm" c="blue">
                                        {t('compressorSetup.equipmentSelector.learnMore')}
                                    </Anchor>
                                </Stack>
                            }
                            itemsList={compressors}
                            selectedItem={selectedCompressor}
                            onItemChange={(val) => {
                                // ID 0 is reserved for 'Custom Compressor'
                                if (compressors.list[val].id === 0){ 
                                    if (!openedSections.compressor) {toggleSection('compressor')};
                                    setSelectedCompressor(customCompressor);
                                } else {
                                    setSelectedCompressor(compressors.list[val]);
                                }
                            }}
                            quantityOwned={compressorSettings.owned}
                            onOwnedChange={(v) => setCompressorSettings({ ...compressorSettings, owned: v })}
                            ownedLabel={
                                compressorQuantity <= 1
                                    ? t('compressorSetup.owned.single')
                                    : t('compressorSetup.owned.multiple')
                            }
                            max={compressorQuantity}
                        />

                        <Text size="sm" fw={600}>
                            {t('compressorSetup.hardwareNeeded')}
                        </Text>

                        <Group mt="sm" mb="sm">
                            <Badge color="blue" variant="filled">
                                {compressorQuantity} {t('compressorSetup.compressorSetupBadge')}
                            </Badge>

                            {selectedCompressor.type === 'Electrochemical' && (
                                <Badge color="teal" variant="filled">
                                    {totalCompStacksNeeded} {t('compressorSetup.stackBadge')}
                                </Badge>
                            )}
                        </Group>

                        {/* --- FINANCIAL & TECHNICAL DETAILS (CAPEX/OPEX) --- */}
                        <DetailSection openedSections={openedSections.compressor} toggleSection={() => toggleSection('compressor')}>
                            
                            {/* Custom hardware requires specifying the core technology, as it radically changes the financial lifecycle model */}
                            {selectedCompressor.id === 0 && (
                                <Select
                                    label={t('compressorSetup.compressorType')}
                                    data={[t("compressorSetup.type.mechanical"), t("compressorSetup.type.electrochemical")]}
                                    value={t(selectedCompressor.uiType)}
                                    onChange={val => setSelectedCompressor({ ...selectedCompressor, type: MAP_TYPE[val] })}
                                    mb="md"
                                />
                            )}

                            {!(compressorSettings.owned === compressorQuantity) && (
                                <ValueInput
                                    label={
                                        <LabelWithTooltip 
                                            label={t('compressorSetup.purchasePrice.label')} 
                                            tooltip={t('compressorSetup.purchasePrice.tooltip')} 
                                        />
                                    }
                                    id="compressor_price"
                                    units="units.eur"
                                    currentUnit="units.eur"
                                    namespace="calculator"
                                    value={selectedCompressor.price}
                                    onValueChange={val => setSelectedCompressor({ ...selectedCompressor, price: val })}
                                />
                            )}

                            <ValueInput
                                label={
                                    <LabelWithTooltip 
                                        label={t('compressorSetup.energyConsumption.label')} 
                                        tooltip={t('compressorSetup.energyConsumption.tooltip')} 
                                    />
                                }
                                id="compressor_energy_consumption"
                                units={H2_VOLUME_POWER_UNITS}
                                currentUnit={compressorSettings.cons_unit}
                                namespace="calculator"
                                value={selectedCompressor.energy_consumption_kwh_per_kg}
                                onValueChange={val => setSelectedCompressor({ ...selectedCompressor, energy_consumption_kwh_per_kg: val })}
                                onUnitChange={(u) => setCompressorSettings({ ...compressorSettings, cons_unit: u })}
                            />

                            {/* --- ELECTROCHEMICAL SPECIFIC FIELDS --- */}
                            {/* Unlike mechanical systems, EHC capacity scales by adding physical cell stacks. 
                                Replacement cost and structural limits must be tracked. */}
                            {selectedCompressor.type === 'Electrochemical' && (
                                <>
                                    {(totalCompStacksNeeded !== 1 || compressorSettings.owned !== 1) && (
                                        <SliderInput
                                            label={
                                                <LabelWithTooltip 
                                                    label={t('compressorSetup.ownedStacks.label')} 
                                                    tooltip={t('compressorSetup.ownedStacks.tooltip')} 
                                                />
                                            }
                                            id="compressor_owned_stacks"
                                            units={t('units.units')}
                                            value={compressorSettings.ownedStacks}
                                            onValueChange={val => setCompressorSettings({ ...compressorSettings, ownedStacks: val })}
                                            min={compressorSettings.owned}
                                            max={totalCompStacksNeeded}
                                        />
                                    )}

                                    <ValueInput
                                        label={
                                            <LabelWithTooltip 
                                                label={t('compressorSetup.cellStackPrice.label')} 
                                                tooltip={t('compressorSetup.cellStackPrice.tooltip')} 
                                            />
                                        }
                                        id="compessor_stack_price"
                                        units="units.eur"
                                        namespace="calculator"
                                        value={selectedCompressor.cell_stack_price}
                                        onValueChange={val => setSelectedCompressor({ ...selectedCompressor, cell_stack_price: val })}
                                    />
                                    
                                    <ValueInput
                                        label={
                                            <LabelWithTooltip 
                                                label={t('compressorSetup.cellsPerStack.label')} 
                                                tooltip={t('compressorSetup.cellsPerStack.tooltip')} 
                                            />
                                        }
                                        id="cells_per_stack"
                                        units='units.cells'
                                        namespace="calculator"
                                        value={selectedCompressor.cells_per_stack}
                                        onValueChange={val => setSelectedCompressor({ ...selectedCompressor, cells_per_stack: val })}
                                        nullBlocker
                                    />
                                    
                                    <ValueInput
                                        label={
                                            <LabelWithTooltip 
                                                label={t('compressorSetup.maxCells.label')} 
                                                tooltip={t('compressorSetup.maxCells.tooltip')} 
                                            />
                                        }
                                        id="max_cells"
                                        units='units.cells'
                                        namespace="calculator"
                                        value={selectedCompressor.max_cells}
                                        onValueChange={val => setSelectedCompressor({ ...selectedCompressor, max_cells: val })}
                                        nullBlocker
                                    />
                                    
                                    {showCellWarning && (
                                        <Alert 
                                            icon={<IconAlertCircle size={16} />} 
                                            title={t('compressorSetup.warning.title')} 
                                            color="orange" 
                                            variant="light" 
                                            mt="xs"
                                        >
                                            {t('compressorSetup.warning.message', {
                                                maxCells: selectedCompressor.max_cells,
                                                cellsPerStack: selectedCompressor.cells_per_stack
                                            })}
                                        </Alert>
                                    )}
                                </>
                            )}

                            <ValueInput
                                label={
                                    <LabelWithTooltip 
                                        label={
                                            selectedCompressor.type === 'Electrochemical'
                                                ? t('compressorSetup.flowrate.perCellLabel')
                                                : t('compressorSetup.flowrate.perCompressorLabel')
                                        }
                                        tooltip={
                                            selectedCompressor.type === 'Electrochemical'
                                                ? t('compressorSetup.flowrate.perCellTooltip')
                                                : t('compressorSetup.flowrate.perCompressorTooltip')
                                        }
                                    />
                                }
                                id="flowrate"
                                units={VOLUME_PER_TIME_UNITS}
                                currentUnit={compressorSettings.flow_unit}
                                namespace="calculator"
                                value={selectedCompressor.unitary_flowrate_kg_per_day}
                                onValueChange={val => setSelectedCompressor({ ...selectedCompressor, unitary_flowrate_kg_per_day: val })}
                                onUnitChange={(u) => setCompressorSettings({ ...compressorSettings, flow_unit: u })}
                                nullBlocker
                            />

                            <ValueInput
                                label={
                                    <LabelWithTooltip 
                                        label={t('compressorSetup.maintenanceCosts.label')} 
                                        tooltip={t('compressorSetup.maintenanceCosts.tooltip')} 
                                    />
                                }
                                id="compressor_maintenance_costs"
                                units={MAINTENANCE_UNITS}
                                currentUnit={compressorSettings.maint_unit}
                                namespace="calculator"
                                value={selectedCompressor.maintenance_percent_capex}
                                onValueChange={val => setSelectedCompressor({ ...selectedCompressor, maintenance_percent_capex: val })}
                                onUnitChange={(u) => setCompressorSettings({ ...compressorSettings, maint_unit: u })}
                            />

                            {/* Stack lifetime is exclusively for electrochemical compressors. 
                                Mechanical degradation is covered entirely by standard maintenance % above. */}
                            {selectedCompressor.type === 'Electrochemical' && 
                                <ValueInput
                                    label={
                                        <LabelWithTooltip 
                                            label={t('compressorSetup.stackLifetime.label')} 
                                            tooltip={t('compressorSetup.stackLifetime.tooltip')} 
                                        />
                                    }
                                    id="compressor_stack_lifetime"
                                    units="units.hour"
                                    currentUnit="units.hour"
                                    namespace="calculator"
                                    value={selectedCompressor.stack_lifetime_hours}
                                    onValueChange={val => setSelectedCompressor({ ...selectedCompressor, stack_lifetime_hours: val })}
                                    nullBlocker
                                />
                            }
                        </DetailSection>
                    </Paper>
                </>
            )}
        </Card>
    );
}

export default memo(CompressorSetup);