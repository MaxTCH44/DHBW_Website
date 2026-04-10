import { Select, Checkbox, Stack, Tooltip, Box, Text } from '@mantine/core';
import { useEffect } from 'react';

import SliderInput from './SliderInput';



const EQUIPMENT_MAPS = {
    electrolyzer: {
        type: { label: "Type", unit: "" },
        price: { label: "Price", unit: " €" },
        power: { label: "System power", unit: " kW" },
        energy_consumption_kwh_per_kg: { label: "Energy consumption", unit: " kWh/kg" },
        maintenance_percent_capex: { label: "Maintenance", unit: " %/year" },
        stack_lifetime_hours: { label: "Stack lifetime", unit: " h" }
    },
    compressor: {
        type: { label: "Type", unit: "" },
        price: { label: "Price", unit: " €" },
        cell_stack_price: { label: "Cell stack price", unit: " €" },
        max_cells: { label: "Maximum number of cells", unit: "" },
        cells_per_stack: { label: "Number of cells per stack", unit: "" },
        unitary_flowrate_kg_per_day: { 
            label: (item) => item.type === "mechanical" ? "Flowrate" : "Flowrate per cell", 
            unit: " kg/day" 
        },
        energy_consumption_kwh_per_kg: { label: "Energy consumption", unit: " kWh/kg" },
        maintenance_percent_capex: { label: "Maintenance", unit: " %/year" }
    }
};

export default function EquipmentSelector({ label, itemsList, selectedItem, onItemChange, quantityOwned, onOwnedChange, ownedLabel, max, isAdvancedMode = true }) {

    useEffect(() => {
        if (max !== null && max !== undefined && quantityOwned > max) {
            onOwnedChange(max);
        }
    }, [max, quantityOwned]);

    const selectData = itemsList.list.map((item, index) => ({
        value: index.toString(),
        label: item.name,
        ...item 
    }));

    const selectedIndex = itemsList.list.findIndex(item => item.id === selectedItem.id).toString();

    function renderTooltipContent(item) {
        const map = EQUIPMENT_MAPS[itemsList.type];
        if (!map) return null;

        return (
            <Box w={220}>
                {Object.entries(map).map(([key, config]) => {
                    if (item[key] !== undefined && item[key] !== null) {
                        
                        const labelToDisplay = typeof config.label === 'function' 
                            ? config.label(item) 
                            : config.label;

                        return (
                            <Box key={key} display="flex" style={{ justifyContent: 'space-between' }}>
                                <Text size="xs" fw={700} c="gray.4">{labelToDisplay}:</Text>
                                <Text size="xs" fw={500} c="white">
                                    {item[key]} {config.unit}
                                </Text>
                            </Box>
                        );
                    }
                    return null;
                })}
            </Box>
        );
    }

    function renderOption ({ option }) {
        if (option.id === 0) return (<div style={{ width: '100%', padding: '4px 0', fontWeight: 'bold', color: 'yellowgreen' }}>
                {option.label}
            </div>);
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
        </Tooltip>)
    };

    return (
        <Stack gap="sm" mb="md">
            <Select
                label={label}
                data={selectData}
                value={selectedIndex}
                onChange={onItemChange}
                allowDeselect={false}
                renderOption={renderOption}
            />
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