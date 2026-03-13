import { Select, Checkbox, Stack } from '@mantine/core';



export default function EquipmentSelector({ label, itemsList, selectedItem, onItemChange, isOwned, onOwnedChange, ownedLabel }) {

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
            <Checkbox
                label={ownedLabel}
                checked={isOwned}
                onChange={(e) => onOwnedChange(e.currentTarget.checked)}
                mt="xs"
            />
        </Stack>
    );
}