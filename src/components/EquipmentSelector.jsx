import { Select, Checkbox, Stack } from '@mantine/core';
import SliderInput from './SliderInput';



export default function EquipmentSelector({ label, itemsList, selectedItem, onItemChange, quantityOwned, onOwnedChange, ownedLabel, max }) {

    const selectData = itemsList.map((item, index) => ({
        value: index.toString(),
        label: item.name
    }));

    const selectedIndex = itemsList.findIndex(item => item.id === selectedItem.id).toString();

    return (
        <Stack gap="sm" mb="md">
            <Select
                label={label}
                data={selectData}
                value={selectedIndex}
                onChange={onItemChange}
                allowDeselect={false}
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