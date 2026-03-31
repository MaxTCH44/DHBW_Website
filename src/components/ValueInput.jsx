
import { useState, useEffect } from 'react';
import { NumberInput, Select, Text } from '@mantine/core';



export default function ValueInput({ label, value, units, currentUnit, onValueChange, onUnitChange = (() => {}), nullBlocker = false , max = null}) {
  const isArray = Array.isArray(units);
  const hasMultipleUnits = isArray && units.length > 1;

  const [localValue, setLocalValue] = useState(value);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    let timeout;
    if (errorMsg) {
      timeout = setTimeout(() => {
        setErrorMsg(null);
      }, 3000);
    }
    return () => clearTimeout(timeout);
  }, [errorMsg]);

  useEffect(() => {
    if (max !== null && value > max) {
      setErrorMsg("Value adjusted to maximum allowed (" + max + ")");
      setLocalValue(max);
      onValueChange(max); 
    }
  }, [max, value]);
  
  function handleChange(val) {
    setLocalValue(val);
  }

  function handleBlur() {
    if (nullBlocker && (localValue === 0 || localValue === '' || localValue === null || localValue === undefined)) {
      setErrorMsg("Value cannot be 0");
      setLocalValue(value);
      onValueChange(value);
    } else if (max && localValue > max) {
      setErrorMsg("Value cannot be more than " + max);
      onValueChange(max);
      setLocalValue(max);
    } else {
      setErrorMsg(null);
      onValueChange(localValue);
    }
  }

  const selectData = isArray ? units.map((u) => ({ value: u.label, label: u.label })) : [];

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
      value={localValue} 
      onChange={handleChange} 
      onBlur={handleBlur}
      min={0}
      allowNegative={false}
      rightSection={rightSection}
      rightSectionWidth="auto"
      hideControls
      error={errorMsg}
      styles={{ 
        input: { paddingRight: '90px' }
      }}
      mb="sm"
    />
  );
}