import { NumberInput, NativeSelect, Text } from '@mantine/core';

export default function ValueEntry({ label, value, units, currentUnit, onValueChange, onUnitChange }) {
  const isArray = Array.isArray(units);
  const hasMultipleUnits = isArray && units.length > 1;

  const selectData = isArray 
    ? units.map((u) => ({ value: u.label, label: u.label }))
    : [];

  const handleSelectChange = (e) => {
    const selectedName = e.currentTarget.value;
    const selectedUnit = units.find(u => u.label === selectedName);
    if (onUnitChange && selectedUnit) {
      onUnitChange(selectedUnit);
    }
  };

  const rightSection = hasMultipleUnits ? (
    <NativeSelect
      data={selectData}
      value={currentUnit?.label}
      onChange={handleSelectChange}
      rightSectionWidth={28}
      styles={{
        input: {
          fontWeight: 500,
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
          width: "auto",
          marginRight: -2,
          border: 'none',
          backgroundColor: 'transparent',
          textAlign: 'right',
        },
      }}
    />
  ) : (
    <Text size="sm" fw={500} c="dimmed" pr="md">
      {isArray ? units[0].label : units}
    </Text>
  );

  return (
    <NumberInput
      label={label}
      value={value}
      onChange={onValueChange}
      min={0}
      hideControls
      rightSection={rightSection}
      rightSectionWidth={"auto"}
      styles={{
        input: {
          paddingRight: '100px',
        }
      }}
      mb="sm"
    />
  );
}
