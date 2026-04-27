import { Card, Text, Paper, Group, Badge, Stack, Anchor, Select } from '@mantine/core';
import { Link } from 'react-router-dom';

import ValueInput from '../ValueInput';
import IncrementalInput from '../IncrementalInput';
import LabelWithTooltip from '../LabelWithTooltip';
import DetailSection from '../DetailSection';
import EquipmentSelector from './EquipmentSelector';
import SliderInput from '../SliderInput';
import { POWER_UNITS, TIME_PER_YEAR_UNITS, MAINTENANCE_UNITS, H2_VOLUME_POWER_UNITS } from './calculatorConstants';

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
export default function ElectrolyzerSetup ({
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
    return(
        <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Text fw={700} size="xl" mb="md" pb="xs" style={{ borderBottom: '2px solid #f0f0f0' }}>
                Electrolyzer Setup
            </Text>

            {/* --- GENERAL SIZING --- */}
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
                // In simple mode, sizing is constrained to perfect multiples of the selected electrolyzer's base power
                <IncrementalInput
                    label={<LabelWithTooltip label="System size" tooltip="Total electrical power capacity of your electrolyzer setup." />}
                    value={systemSize.value}
                    step={selectedElectrolyzer.power}
                    min={selectedElectrolyzer.power}
                    unit="kW"
                    onValueChange={val => setSystemSize({ ...systemSize, value: val })}
                />
            )}

            {isAdvancedMode && (
                <DetailSection openedSections={openedSections.system} toggleSection={() => toggleSection('system')}>
                    {/* Self-produced power (e.g., from an onsite solar array) effectively dilutes the blended electricity rate, lowering the OPEX */}
                    <SliderInput 
                        label={<LabelWithTooltip label="Self-produced" tooltip="Percentage of the required electrical power generated on-site (e.g., via solar panels), reducing the energy drawn from the grid." />}
                        id="self_produced"
                        units={systemSize.unit.label}
                        value={systemSize.selfProduced}
                        onValueChange={v => setSystemSize({ ...systemSize, selfProduced: v })}
                        min={0}
                        max={systemSize.value}
                    />
                </DetailSection>
            )}

            {/* Operating time directly impacts how the CAPEX is amortized over the volume of H2 produced annually */}
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

            {/* --- EQUIPMENT SELECTION --- */}
            <Paper bg="gray.0" p="md" radius="md" withBorder mt="md">
                <EquipmentSelector
                    id="electrolyzer_selector"
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
                        
                        // When switching models in simple mode, we automatically adjust the system size 
                        // to the nearest valid multiple of the new model's power rating.
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

                        // ID 0 is reserved for 'Custom Electrolyzer'
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

                {/* Hardware needed summary: Shows the physical reality behind the kW sizing.
                    Frames dictate the base CAPEX, while Stacks dictate production capacity and maintenance OPEX. */}
                <Text size="sm" fw={600}>Hardware needed:</Text>
                <Group mt="sm" mb="sm">   
                    <Badge color="blue" variant="filled">{electrolyzerQuantity} Electrolyzer Setup(s)</Badge>
                    <Badge color="teal" variant="filled">{totalStacksNeeded} Stack(s)</Badge>
                </Group>

                {/* --- FINANCIAL & TECHNICAL DETAILS --- */}
                {isAdvancedMode && (
                    <DetailSection openedSections={openedSections.electrolyzer} toggleSection={() => toggleSection('electrolyzer')}>
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
                                label={<LabelWithTooltip label="Electrolyzer purchase price" tooltip="Total initial purchase cost (CAPEX) including the balance-of-plant. The first cell stack is already included in this base price." />}
                                id="electrolyzer_price"
                                units="€"
                                currentUnit="€"
                                value={selectedElectrolyzer.price}
                                onValueChange={val => setSelectedElectrolyzer({ ...selectedElectrolyzer, price: val })}
                            />
                        )}

                        <ValueInput
                            label={<LabelWithTooltip label="Stack power" tooltip="The rated electrical power input of a single electrolyzer stack. This determines its individual production capacity." />}
                            id="electrolyzer_power"
                            units="kW"
                            currentUnit="kW"
                            value={selectedElectrolyzer.stack_power}
                            onValueChange={val => setSelectedElectrolyzer({ ...selectedElectrolyzer, stack_power: val })}
                            nullBlocker
                        />

                        {/* Stacks that are already owned reduce the initial CAPEX but remain fully subjected to long-term replacement cycles in the OPEX. */}
                        {(totalStacksNeeded !== 1 || electrolyzerSettings.owned !== 1) && (
                            <SliderInput
                                label={<LabelWithTooltip label="Number of owned stacks" tooltip="The number of electrolyzer stacks you already own. These will be deducted from your initial upfront costs." />}
                                id="electrolyzer_owned_stacks"
                                units="units"
                                value={electrolyzerSettings.ownedStacks}
                                onValueChange={val => setElectrolyzerSettings({ ...electrolyzerSettings, ownedStacks: val })}
                                min={electrolyzerSettings.owned}
                                max={totalStacksNeeded}
                            />
                        )}

                        <ValueInput
                            label={<LabelWithTooltip label="Stack price" tooltip="The cost to purchase a replacement cell stack. This is essential for calculating long-term operational expenses." />}
                            id="electrolyzer_stack_price"
                            units="€"
                            currentUnit="€"
                            value={selectedElectrolyzer.stack_price}
                            onValueChange={val => setSelectedElectrolyzer({ ...selectedElectrolyzer, stack_price: val })}
                        />

                        <ValueInput
                            label={<LabelWithTooltip label="Max stacks per electrolyzer" tooltip="The physical limit of stacks a single electrolyzer frame can house before a new full unit is required." />}
                            id="max_stack_per_electrolyzer"
                            units="stacks"
                            currentUnit="stacks"
                            value={selectedElectrolyzer.max_stacks}
                            onValueChange={val => setSelectedElectrolyzer({ ...selectedElectrolyzer, max_stacks: val })}
                        />

                        <ValueInput
                            label={<LabelWithTooltip label="Electrolyzer energy consumption" tooltip="Specific energy consumption of the electrolyzer stack itself to produce one unit of hydrogen. This value excludes system-wide auxiliaries like cooling or drying." />}
                            id="electrolyzer_energy_consumption"
                            units={H2_VOLUME_POWER_UNITS}
                            currentUnit={electrolyzerSettings.cons_unit}
                            value={selectedElectrolyzer.energy_consumption_kwh_per_kg}
                            onValueChange={val => setSelectedElectrolyzer({ ...selectedElectrolyzer, energy_consumption_kwh_per_kg: val })}
                            onUnitChange={(u) => setElectrolyzerSettings({ ...electrolyzerSettings, cons_unit : u })}
                            nullBlocker
                        />

                        <ValueInput
                            label={<LabelWithTooltip label="Total auxiliary consumption (BoP)" tooltip="Fixed electrical power (kW) required by the entire system's supporting hardware (cooling, drying, electronics). This is a global value for the whole setup, regardless of the number of electrolyzer units." />}
                            id="auxiliary_energy_consumption"
                            units="kW"
                            currentUnit="kW"
                            value={selectedElectrolyzer.total_auxiliary_consumption}
                            onValueChange={val => setSelectedElectrolyzer({ ...selectedElectrolyzer, total_auxiliary_consumption: val })}
                        />

                        <ValueInput
                            label={<LabelWithTooltip label="Water consumption" tooltip="The amount of purified water required per hour by a single electrolyzer unit at its rated power." />}
                            id="water_consumption"
                            units="L/h"
                            currentUnit="L/h"
                            value={selectedElectrolyzer.water_consumption_l_per_h}
                            onValueChange={val => setSelectedElectrolyzer({ ...selectedElectrolyzer, water_consumption_l_per_h: val })}
                        />

                        <ValueInput
                            label={<LabelWithTooltip label="Maintenance costs" tooltip="Annual operation and maintenance (O&M) costs, generally estimated as a percentage of the initial equipment cost (CAPEX)." />}
                            id="electrolyzer_maintenance_costs"
                            units={MAINTENANCE_UNITS}
                            currentUnit={electrolyzerSettings.maint_unit}
                            value={selectedElectrolyzer.maintenance_percent_capex}
                            onValueChange={val => setSelectedElectrolyzer({ ...selectedElectrolyzer, maintenance_percent_capex: val })}
                            onUnitChange={(u) => setElectrolyzerSettings({ ...electrolyzerSettings, maint_unit : u })}
                        />

                        <ValueInput
                            label={<LabelWithTooltip label="Stack Lifetime" tooltip="The expected operational lifespan of the cell stack in hours before it degrades and requires replacement. This drives long-term maintenance calculations." />}
                            id="electrolyzer_stack_lifetime"
                            units="h"
                            currentUnit="h"
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