import { Select, Checkbox, Stack, Tooltip, Box, Text } from '@mantine/core';
import { useEffect, useCallback } from 'react';

import SliderInput from '../SliderInput';

// --- CONFIGURATION MAPS ---
// This dictionary maps the technical properties of JSON objects to human-readable labels and units.
// It is used to dynamically build the information tooltips when hovering over equipment options.
const EQUIPMENT_MAPS = {
    electrolyzer: {
        type: { label: "Type", unit: "" },
        price: { label: "Price", unit: " €" },
        power: { label: "System power", unit: " kW" },
        stack_price : {label : "Stack price", unit : " €" },
        stack_power : {label : "Stack power", unit : " kW" },
        max_stacks : {label : "Max stacks per electrolyzer", unit : "" },
        energy_consumption_kwh_per_kg: { label : "Energy consumption", unit: " kWh/kg" },
        total_auxiliary_consumption : {label : "Total auxiliary consumption", unit : " kW" },
        water_consumption_l_per_h : {label : "Water consumption", unit : " L/h" },
        maintenance_percent_capex: { label: "Maintenance", unit: " %/year" },
        stack_lifetime_hours: { label: "Stack lifetime", unit: " h" }
    },
    compressor: {
        type: { label: "Type", unit: "" },
        compression_rate: {label: "Compression rate", unit: "" } ,
        price: { label: "Price", unit: " €" },
        cell_stack_price: { label: "Cell stack price", unit: " €" },
        max_cells: { label: "Maximum number of cells", unit: "" },
        cells_per_stack: { label: "Number of cells per stack", unit: "" },
        unitary_flowrate_kg_per_day: { 
            // Mechanical compressors scale by full units, whereas EHCs scale by individual cells
            label: (item) => item.type === "Mechanical" ? "Flowrate" : "Flowrate per cell", 
            unit: " kg/day" 
        },
        energy_consumption_kwh_per_kg: { label: "Energy consumption", unit: " kWh/kg" },
        maintenance_percent_capex: { label: "Maintenance", unit: " %/year" },
        stack_lifetime_hours: { label: "Stack lifetime", unit: " h" }
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

    // Prevents the user from owning more units than what the current physical plant sizing actually requires
    useEffect(() => {
        if (max !== null && max !== undefined && quantityOwned > max) {
            onOwnedChange(max);
        }
    }, [max, quantityOwned, onOwnedChange]);

    const selectData = itemsList.list.map((item, index) => ({
        value: index.toString(),
        label: item.name,
        ...item 
    }));

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
                            ? config.label(item) 
                            : config.label;

                        // European number formatting (e.g. 1.000,50)
                        const valueToDisplay = typeof item[key] === 'number'
                            ? item[key].toLocaleString('de-DE')
                            : item[key];

                        return (
                            <Box key={key} display="flex" style={{ justifyContent: 'space-between' }}>
                                <Text size="xs" fw={700} c="gray.4">{labelToDisplay}:</Text>
                                <Text size="xs" fw={500} c="white">
                                    {valueToDisplay} {config.unit}
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