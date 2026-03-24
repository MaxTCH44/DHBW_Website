import { Select, Checkbox, Stack, Tooltip, Box, Text } from '@mantine/core';
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
        energy_consumption_kwh_per_kg: { label: "Energy consumption", unit: " kWh/kg" },
        maintenance_percent_capex: { label: "Maintenance", unit: " %/year" }
    }
};

export default function EquipmentSelector({ label, itemsList, selectedItem, onItemChange, quantityOwned, onOwnedChange, ownedLabel, max }) {

    const selectData = itemsList.list.map((item, index) => ({
        value: index.toString(),
        label: item.name,
        ...item 
    }));

    const selectedIndex = itemsList.list.findIndex(item => item.id === selectedItem.id).toString();
    const currentMap = EQUIPMENT_MAPS[itemsList.type];

    function renderTooltipContent (itemData) {
        return (
            <Box>
                {Object.keys(currentMap).map((key) => {
                    if (itemData[key] !== undefined) {
                        return (
                            <Text key={key} size="sm">
                                <span style={{ opacity: 0.7 }}>{currentMap[key].label} : </span> 
                                <b>{itemData[key]}{currentMap[key].unit}</b>
                            </Text>
                        );
                    }
                    return null;
                })}
            </Box>
        );
    };

    function renderOption ({ option }) {
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
            {max <= 1 ?
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
            }
        </Stack>
    );
}