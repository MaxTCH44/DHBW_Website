import { Select, Checkbox, Stack, Tooltip, Box, Text } from '@mantine/core';
import { useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import SliderInput from '../SliderInput';

// --- CONFIGURATION MAPS ---
// This dictionary maps the technical properties of JSON objects to human-readable labels and units.
// It is used to dynamically build the information tooltips when hovering over equipment options.
const EQUIPMENT_MAPS = {
    electrolyzer: {
        type: { label: "equipment.electrolyzer.type", unit: "" },
        price: { label: "equipment.electrolyzer.price", unit: "€" },
        power: { label: "equipment.electrolyzer.power", unit: "kW" },

        stack_price: { label: "equipment.electrolyzer.stack_price", unit: "€" },
        stack_power: { label: "equipment.electrolyzer.stack_power", unit: "kW" },
        max_stacks: { label: "equipment.electrolyzer.max_stacks", unit: "" },

        energy_consumption_kwh_per_kg: {
            label: "equipment.electrolyzer.energy_consumption_kwh_per_kg",
            unit: "kWh/kg"
        },

        total_auxiliary_consumption: {
            label: "equipment.electrolyzer.total_auxiliary_consumption",
            unit: "kW"
        },

        water_consumption_l_per_h: {
            label: "equipment.electrolyzer.water_consumption_l_per_h",
            unit: "L/h"
        },

        maintenance_percent_capex: {
            label: "equipment.electrolyzer.maintenance_percent_capex",
            unit: "equipment.electrolyzer.maintenanceUnit"

        },

        stack_lifetime_hours: {
            label: "equipment.electrolyzer.stack_lifetime_hours",
            unit: "h"
        }
    },

    compressor: {
        type: { label: "equipment.compressor.type", unit: "" },
        compression_rate: { label: "equipment.compressor.compression_rate", unit: "" },
        price: { label: "equipment.compressor.price", unit: "€" },

        cell_stack_price: { label: "equipment.compressor.cell_stack_price", unit: "€" },
        max_cells: { label: "equipment.compressor.max_cells", unit: "" },
        cells_per_stack: { label: "equipment.compressor.cells_per_stack", unit: "" },

        unitary_flowrate_kg_per_day: {
            label: (item) =>
                item.type === "Mechanical"
                    ? "equipment.compressor.unitary_flowrate_kg_per_day"
                    : "equipment.compressor.unitary_flowrate_kg_per_day_per_cell",
            unit: "equipment.compressor.flowrate_unit"
        },

        energy_consumption_kwh_per_kg: {
            label: "equipment.compressor.energy_consumption_kwh_per_kg",
            unit: "kWh/kg"
        },

        maintenance_percent_capex: {
            label: "equipment.compressor.maintenance_percent_capex",
            unit: "equipment.compressor.maintenanceUnit"
        },

        stack_lifetime_hours: {
            label: "equipment.compressor.stack_lifetime_hours",
            unit: "h"
        }
    }
};

/**
 * Renders a specialized dropdown selector for industrial equipment (electrolyzers, compressors) 
 * alongside an inventory management control (owned units). It dynamically builds 
 * informative tooltips displaying critical technical specifications based on the selected hardware.
 * * @param {Object} props
 * @param {string|React.ReactNode} props.label - The label displayed above the select input.
 * @param {Object} props.itemsList - The JSON list containing available equipment models and their core type.
 * @param {Object} props.selectedItem - The currently active equipment object selected by the user.
 * @param {Function} props.onItemChange - Callback triggered when the user selects a different equipment model.
 * @param {number} props.quantityOwned - The number of units of this equipment the user already possesses.
 * @param {Function} props.onOwnedChange - Callback to update the number of owned units.
 * @param {string} props.ownedLabel - The label describing the ownership input field.
 * @param {number} props.max - The calculated maximum number of units required for the current project sizing.
 * @param {boolean} [props.isAdvancedMode=true] - Toggles the visibility of advanced inventory features.
 * @param {string} [props.id=null] - Optional HTML id for DOM targeting and tutorial steps.
 */
export default function EquipmentSelector({ 
    label, 
    itemsList, 
    selectedItem, 
    onItemChange, 
    quantityOwned, 
    onOwnedChange, 
    ownedLabel, 
    max, 
    isAdvancedMode = true, 
    id = null 
}) {

    const { t } = useTranslation("calculator");
    
    // Prevents the user from owning more units than what the current physical plant sizing actually requires
    useEffect(() => {
        if (max !== null && max !== undefined && quantityOwned > max) {
            onOwnedChange(max);
        }
    }, [max, quantityOwned, onOwnedChange]);

    const selectData = useMemo(() => {
        return itemsList.list.map((item, index) => ({
            value: index.toString(),
            label: t(item.name),
            ...item 
        }));
    }, [itemsList.list, t]);

    const selectedIndex = itemsList.list.findIndex(item => item.id === selectedItem.id).toString();

    // Dynamically builds the tooltip content based on the EQUIPMENT_MAPS configuration
    const renderTooltipContent = useCallback((item) => {
        const map = EQUIPMENT_MAPS[itemsList.type];
        if (!map) return null;

        return (
            <Box w={220}>
                {Object.entries(map).map(([key, config]) => {
                    if (item[key] !== undefined && item[key] !== null) {
                        
                        const labelToDisplay = typeof config.label === 'function' 
                            ? t(config.label(item)) 
                            : t(config.label);

                        // European number formatting (e.g. 1.000,50)
                        const valueToDisplay = typeof item[key] === 'number'
                            ? item[key].toLocaleString('de-DE')
                            : t(item[key]);

                        return (
                            <Box key={key} display="flex" style={{ justifyContent: 'space-between' }}>
                                <Text size="xs" fw={700} c="gray.4">{t(labelToDisplay)}:</Text>
                                <Text size="xs" fw={500} c="white">
                                    {valueToDisplay} {t(config.unit)}
                                </Text>
                            </Box>
                        );
                    }
                    return null;
                })}
            </Box>
        );
    }, [itemsList.type]);

    // Custom render for the dropdown options. Injects the tooltip on hover.
    const renderOption = useCallback(({ option }) => {
        // ID 0 represents the 'Custom' option. We highlight it and remove the tooltip since it has no predefined specs.
        if (option.id === 0) return (
            <div style={{ width: '100%', padding: '4px 0', fontWeight: 'bold', color: 'yellowgreen' }}>
                {option.label}
            </div>
        );
        return(
            <Tooltip
                label={renderTooltipContent(option)}
                position="right"
                withArrow
                multiline
                openDelay={300} 
                style={{ pointerEvents: 'none' }}
            >
                <div style={{ width: '100%', padding: '4px 0' }}>
                    {option.label}
                </div>
            </Tooltip>
        );
    }, [renderTooltipContent]);

    return (
        <Stack gap="sm" mb="md" id={id}>
            <Select
                label={label}
                data={selectData}
                value={selectedIndex}
                onChange={onItemChange}
                allowDeselect={false}
                renderOption={renderOption}
            />
            
            {/* --- INVENTORY CONTROLS --- */}
            {/* If only 1 total unit is required, a simple Checkbox is sufficient. 
                For multiple required units, a Slider gives finer control over the owned quantity. */}
            {isAdvancedMode && (
                max <= 1 ?
                <Checkbox
                    label={ownedLabel}
                    checked={quantityOwned === 1}
                    onChange={(e) => onOwnedChange(e.currentTarget.checked ? 1 : 0)}
                    mt="xs"
                />
                :
                <SliderInput
                    label={ownedLabel}
                    value={quantityOwned}
                    units=""
                    onValueChange={onOwnedChange}
                    min={0}
                    max={max}
                />
            )}
        </Stack>
    );
}