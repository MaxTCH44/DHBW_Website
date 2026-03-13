import { NumberInput, Select, Text } from '@mantine/core';



export default function ValueEntry({ label, value, units, currentUnit, onValueChange, onUnitChange }) {
  const isArray = Array.isArray(units);
  const hasMultipleUnits = isArray && units.length > 1;

  const selectData = isArray
    ? units.map((u) => ({ value: u.label, label: u.label }))
    : [];

  function handleSelectChange(selectedValue) {
    const selectedUnit = units.find(u => u.label === selectedValue);
    if (onUnitChange && selectedUnit) {
      onUnitChange(selectedUnit);
    }
  }

  const rightSection = hasMultipleUnits ? (
    <Select
      data={selectData}
      value={currentUnit?.label}
      onChange={handleSelectChange}
      allowDeselect={false}
      withCheckIcon={false}
      rightSectionWidth={28}
      variant="transparent"
      styles={{
        input: {
          fontWeight: 500,
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
          width: '108px',
          marginRight: '-2px',
          border: 'none',
          backgroundColor: 'transparent',
          textAlign: 'right',
          cursor: 'pointer'
        },
        dropdown: {
          textAlign: 'left',
          borderRadius: 'var(--mantine-radius-md)',
          boxShadow: 'var(--mantine-shadow-sm)'
        },
        option: {
          fontWeight: 500,
          justifyContent: 'center',
          fontSize: 'var(--mantine-font-size-sm)'
        }
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
      rightSectionWidth="auto"
      styles={{
        input: { paddingRight: '90px' }
      }}
      mb="sm"
    />
  );
}