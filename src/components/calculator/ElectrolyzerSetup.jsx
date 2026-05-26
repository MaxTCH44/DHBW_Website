import { Card, Text, Paper, Group, Badge, Stack, Anchor, Select } from '@mantine/core';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { memo } from 'react';

import ValueInput from '../ValueInput';
import IncrementalInput from '../IncrementalInput';
import LabelWithTooltip from '../LabelWithTooltip';
import DetailSection from '../DetailSection';
import EquipmentSelector from './EquipmentSelector';
import SliderInput from '../SliderInput';
import { POWER_UNITS, TIME_PER_YEAR_UNITS, MAINTENANCE_UNITS, H2_VOLUME_POWER_UNITS } from './calculatorConstants';

const MAP_TYPE = {
    "PEM": "PEM",
    "Alkaline": "Alkaline", 
    "AEM": "AEM"
}

/**
 * Renders the electrolyzer setup form, managing both physical sizing and technical/financial specifications.
 * * @param {Object} props - Destructured properties from the parent Calculator logic.
 * @param {Object} props.electrolyzers - JSON data containing the master list of all electrolyzer models.
 * @param {Object} props.systemSize - State tracking the total targeted electrical power and grid vs self-produced ratio.
 * @param {Function} props.setSystemSize - Setter for the system size state.
 * @param {Object} props.operatingTime - State tracking the annual continuous operating hours/days of the plant.
 * @param {Function} props.setOperatingTime - Setter for the operating time state.
 * @param {Object} props.selectedElectrolyzer - The specific electrolyzer model currently active in the calculator.
 * @param {Function} props.setSelectedElectrolyzer - Setter for the active electrolyzer model.
 * @param {Object} props.availableElectrolyzers - Filtered list of electrolyzers (typically hides 'Custom' in simple mode).
 * @param {Object} props.electrolyzerSettings - Tracks user-specific inventory like owned units, owned stacks, and unit preferences.
 * @param {Function} props.setElectrolyzerSettings - Setter for user-specific inventory and settings.
 * @param {Object} props.customElectrolyzer - The empty template object used when building a custom electrolyzer from scratch.
 * @param {number} props.electrolyzerQuantity - The calculated number of full, physical electrolyzer frames/cabinets needed.
 * @param {number} props.totalStacksNeeded - The calculated number of internal cell stacks needed to reach the target power.
 * @param {Object} props.openedSections - Tracks which advanced detail sections (accordions) are currently expanded.
 * @param {Function} props.toggleSection - Toggles the visibility of specific detail sections.
 * @param {boolean} props.isAdvancedMode - Toggles the UI between a simplified view and full technical parameter customization.
 */
function ElectrolyzerSetup ({
    electrolyzers,
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
    totalStacksNeeded,
    openedSections,
    toggleSection,
    isAdvancedMode
}) {
    const { t } = useTranslation("calculator");

    return(
        <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Text fw={700} size="xl" mb="md" pb="xs" style={{ borderBottom: '2px solid #f0f0f0' }}>
                {t('electrolyzer.setup.title')}
            </Text>

            {/* --- GENERAL SIZING --- */}
            {isAdvancedMode ? (
                <ValueInput
                    id="system_size"
                    label={
                        <LabelWithTooltip
                            label={t('electrolyzer.systemSize.label')}
                            tooltip={t('electrolyzer.systemSize.tooltip')}
                        />
                    }
                    units={POWER_UNITS}
                    currentUnit={systemSize.unit}
                    namespace="calculator"
                    value={systemSize.value}
                    onValueChange={val => setSystemSize({ ...systemSize, value: val })}
                    onUnitChange={u => setSystemSize({ ...systemSize, unit: u })}
                    nullBlocker
                />
            ) : (
                <IncrementalInput
                    label={
                        <LabelWithTooltip
                            label={t('electrolyzer.systemSize.label')}
                            tooltip={t('electrolyzer.systemSize.tooltip')}
                        />
                    }
                    value={systemSize.value}
                    step={selectedElectrolyzer.power}
                    min={selectedElectrolyzer.power}
                    unit="kW"
                    onValueChange={val => setSystemSize({ ...systemSize, value: val })}
                />
            )}

            {isAdvancedMode && (
                <DetailSection
                    openedSections={openedSections.system}
                    toggleSection={() => toggleSection('system')}
                >
                    <SliderInput
                        label={
                            <LabelWithTooltip
                                label={t('electrolyzer.selfProduced.label')}
                                tooltip={t('electrolyzer.selfProduced.tooltip')}
                            />
                        }
                        id="self_produced"
                        units={t(systemSize.unit.label)}
                        value={systemSize.selfProduced}
                        onValueChange={v => setSystemSize({ ...systemSize, selfProduced: v })}
                        min={0}
                        max={systemSize.value}
                    />
                </DetailSection>
            )}

            {/* Operating time */}
            <ValueInput
                id="electrolyzer_operating_time"
                label={
                    <LabelWithTooltip
                        label={t('electrolyzer.operatingTime.label')}
                        tooltip={t('electrolyzer.operatingTime.tooltip')}
                    />
                }
                units={TIME_PER_YEAR_UNITS}
                currentUnit={operatingTime.unit}
                value={operatingTime.value}
                namespace="calculator"
                max={365 * 24 / operatingTime.unit.factor}
                onValueChange={val => setOperatingTime({ ...operatingTime, value: val })}
                onUnitChange={u => setOperatingTime({ ...operatingTime, unit: u })}
                nullBlocker
            />

            {/* --- EQUIPMENT SELECTION --- */}
            <Paper bg="gray.0" p="md" radius="md" withBorder mt="md">
                <EquipmentSelector
                    id="electrolyzer_selector"
                    label={
                        <Stack gap="xs">
                            <LabelWithTooltip
                                label={t('electrolyzer.equipment.title')}
                                tooltip={t('electrolyzer.equipment.tooltip')}
                            />
                            <Anchor component={Link} to="/electrolyzers" size="xs" mb="sm" c="blue">
                                {t('electrolyzer.equipment.learnMore')}
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

                        if (newElectrolyzer.id === 0) {
                            if (!openedSections.electrolyzer) toggleSection('electrolyzer');
                            setSelectedElectrolyzer(customElectrolyzer);
                        } else {
                            setSelectedElectrolyzer(newElectrolyzer);
                        }
                    }}
                    quantityOwned={electrolyzerSettings.owned}
                    onOwnedChange={(v) => setElectrolyzerSettings({ ...electrolyzerSettings, owned: v })}
                    ownedLabel={
                        electrolyzerQuantity <= 1
                            ? t('electrolyzer.hardwareNeeded.ownedNoCapex')
                            : t('electrolyzer.hardwareNeeded.preowned')
                    }
                    max={electrolyzerQuantity}
                    isAdvancedMode={isAdvancedMode}
                />

                <Text size="sm" fw={600}>
                    {t('electrolyzer.hardwareNeeded.title')}
                </Text>

                <Group mt="sm" mb="sm">
                    <Badge color="blue" variant="filled">
                        {electrolyzerQuantity} {t('electrolyzer.hardwareNeeded.setup')}
                    </Badge>
                    <Badge color="teal" variant="filled">
                        {totalStacksNeeded} {t('electrolyzer.hardwareNeeded.stacks')}
                    </Badge>
                </Group>

                {/* --- FINANCIAL & TECHNICAL DETAILS --- */}
                {isAdvancedMode && (
                    <DetailSection
                        openedSections={openedSections.electrolyzer}
                        toggleSection={() => toggleSection('electrolyzer')}
                    >
                        {selectedElectrolyzer.id === 0 && (
                            <Select
                                label={t('electrolyzer.typeLabel')}
                                data={[t('electrolyzer.type.pem'), t('electrolyzer.type.alkaline'), t('electrolyzer.type.aem')]}
                                value={selectedElectrolyzer.type}
                                onChange={val => setSelectedElectrolyzer({ ...selectedElectrolyzer, type: MAP_TYPE[val] })}
                                mb="md"
                            />
                        )}

                        {!(electrolyzerSettings.owned === electrolyzerQuantity) && (
                            <ValueInput
                                label={
                                    <LabelWithTooltip
                                        label={t('electrolyzer.price.label')}
                                        tooltip={t('electrolyzer.price.tooltip')}
                                    />
                                }
                                id="electrolyzer_price"
                                units="units.eur"
                                currentUnit="units.eur"
                                namespace="calculator"
                                value={selectedElectrolyzer.price}
                                onValueChange={val => setSelectedElectrolyzer({ ...selectedElectrolyzer, price: val })}
                            />
                        )}

                        <ValueInput
                            label={
                                <LabelWithTooltip
                                    label={t('electrolyzer.stackPower.label')}
                                    tooltip={t('electrolyzer.stackPower.tooltip')}
                                />
                            }
                            id="electrolyzer_power"
                            units="units.power_kw"
                            currentUnit="units.power_kw"
                            namespace="calculator"
                            value={selectedElectrolyzer.stack_power}
                            onValueChange={val => setSelectedElectrolyzer({ ...selectedElectrolyzer, stack_power: val })}
                            nullBlocker
                        />

                        {(totalStacksNeeded !== 1 || electrolyzerSettings.owned !== 1) && (
                            <SliderInput
                                label={
                                    <LabelWithTooltip
                                        label={t('electrolyzer.ownedStacks.label')}
                                        tooltip={t('electrolyzer.ownedStacks.tooltip')}
                                    />
                                }
                                id="electrolyzer_owned_stacks"
                                units={t("units.units")}
                                value={electrolyzerSettings.ownedStacks}
                                onValueChange={val => setElectrolyzerSettings({ ...electrolyzerSettings, ownedStacks: val })}
                                min={electrolyzerSettings.owned}
                                max={totalStacksNeeded}
                            />
                        )}

                        <ValueInput
                            label={
                                <LabelWithTooltip
                                    label={t('electrolyzer.stackPrice.label')}
                                    tooltip={t('electrolyzer.stackPrice.tooltip')}
                                />
                            }
                            id="electrolyzer_stack_price"
                            units="units.eur"
                            currentUnit="units.eur"
                            namespace="calculator"
                            value={selectedElectrolyzer.stack_price}
                            onValueChange={val => setSelectedElectrolyzer({ ...selectedElectrolyzer, stack_price: val })}
                        />

                        <ValueInput
                            label={
                                <LabelWithTooltip
                                    label={t('electrolyzer.maxStacks.label')}
                                    tooltip={t('electrolyzer.maxStacks.tooltip')}
                                />
                            }
                            id="max_stack_per_electrolyzer"
                            units="units.stacks"
                            currentUnit="units.stacks"
                            namespace="calculator"
                            value={selectedElectrolyzer.max_stacks}
                            onValueChange={val => setSelectedElectrolyzer({ ...selectedElectrolyzer, max_stacks: val })}
                        />

                        <ValueInput
                            label={
                                <LabelWithTooltip
                                    label={t('electrolyzer.energyConsumption.label')}
                                    tooltip={t('electrolyzer.energyConsumption.tooltip')}
                                />
                            }
                            id="electrolyzer_energy_consumption"
                            units={H2_VOLUME_POWER_UNITS}
                            currentUnit={electrolyzerSettings.cons_unit}
                            namespace="calculator"
                            value={selectedElectrolyzer.energy_consumption_kwh_per_kg}
                            onValueChange={val => setSelectedElectrolyzer({ ...selectedElectrolyzer, energy_consumption_kwh_per_kg: val })}
                        />

                        <ValueInput
                            label={
                                <LabelWithTooltip
                                    label={t('electrolyzer.auxiliaryConsumption.label')}
                                    tooltip={t('electrolyzer.auxiliaryConsumption.tooltip')}
                                />
                            }
                            id="auxiliary_energy_consumption"
                            units="units.power_kw"
                            currentUnit="units.power_kw"
                            namespace="calculator"
                            value={selectedElectrolyzer.total_auxiliary_consumption}
                            onValueChange={val => setSelectedElectrolyzer({ ...selectedElectrolyzer, total_auxiliary_consumption: val })}
                        />

                        <ValueInput
                            label={
                                <LabelWithTooltip
                                    label={t('electrolyzer.waterConsumption.label')}
                                    tooltip={t('electrolyzer.waterConsumption.tooltip')}
                                />
                            }
                            id="water_consumption"
                            units="units.l_per_hour"
                            currentUnit="units.l_per_hour"
                            namespace="calculator"
                            value={selectedElectrolyzer.water_consumption_l_per_h}
                            onValueChange={val => setSelectedElectrolyzer({ ...selectedElectrolyzer, water_consumption_l_per_h: val })}
                        />

                        <ValueInput
                            label={
                                <LabelWithTooltip
                                    label={t('electrolyzer.maintenanceCosts.label')}
                                    tooltip={t('electrolyzer.maintenanceCosts.tooltip')}
                                />
                            }
                            id="electrolyzer_maintenance_costs"
                            units={MAINTENANCE_UNITS}
                            currentUnit={electrolyzerSettings.maint_unit}
                            namespace="calculator"
                            value={selectedElectrolyzer.maintenance_percent_capex}
                            onValueChange={val => setSelectedElectrolyzer({ ...selectedElectrolyzer, maintenance_percent_capex: val })}
                        />

                        <ValueInput
                            label={
                                <LabelWithTooltip
                                    label={t('electrolyzer.stackLifetime.label')}
                                    tooltip={t('electrolyzer.stackLifetime.tooltip')}
                                />
                            }
                            id="electrolyzer_stack_lifetime"
                            units="units.hour"
                            currentUnit="units.hour"
                            namespace="calculator"
                            value={selectedElectrolyzer.stack_lifetime_hours}
                            onValueChange={val => setSelectedElectrolyzer({ ...selectedElectrolyzer, stack_lifetime_hours: val })}
                            nullBlocker
                        />
                    </DetailSection>
                )}
            </Paper>
        </Card>
    );
}

export default memo(ElectrolyzerSetup);