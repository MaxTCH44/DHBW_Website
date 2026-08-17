import { useState, useEffect, useMemo } from 'react';
import { NumberInput, Select, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';

/**
 * The core numerical input engine used throughout the calculators.
 * It manages local state buffering (to allow fluid typing without instant validation snapping),
 * handles multiple physical unit conversions (e.g., switching between "kW" and "MW"), 
 * and strictly enforces physical limits with auto-dismissing warning messages.
 * * @param {Object} props
 * @param {string|React.ReactNode} props.label - The input label, often wrapped in a LabelWithTooltip.
 * @param {number} props.value - The master controlled value coming from the parent state.
 * @param {string|Array<Object>} props.units - Either a fixed string unit ("€") or an array of unit objects [{label, factor}] to populate the dropdown.
 * @param {Object} [props.currentUnit] - The currently active unit object, required if `units` is an array.
 * @param {Function} props.onValueChange - Callback to push the validated number back to the parent state.
 * @param {Function} [props.onUnitChange] - Callback to push the newly selected unit conversion factor to the parent.
 * @param {boolean} [props.nullBlocker=false] - If true, forces the user to provide a non-zero value (crucial to prevent division-by-zero errors in LCOH formulas).
 * @param {number|null} [props.max=null] - An absolute upper limit. If exceeded, the value snaps back to this max.
 * @param {string|null} [props.id=null] - DOM ID for tutorial targeting (AdviceCards).
 */
export default function ValueInput({ label, value, units, currentUnit, onValueChange, namespace, onUnitChange = (() => {}), nullBlocker = false, max = null, id = null }) {
  
  const { t } = useTranslation(namespace);

  const isArray = Array.isArray(units);
  const hasMultipleUnits = isArray && units.length > 1;

  // Local state buffering: Allows the user to type freely (even temporarily invalid strings)
  // Validation and syncing with the parent only occur when the input loses focus (onBlur)
  const [localValue, setLocalValue] = useState(value);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Self-cleaning error messages: Warnings disappear automatically after 3 seconds 
  // to avoid permanently cluttering the user interface.
  useEffect(() => {
    let timeout;
    if (errorMsg) {
      timeout = setTimeout(() => {
        setErrorMsg(null);
      }, 3000);
    }
    return () => clearTimeout(timeout);
  }, [errorMsg]);

  // Force-clamps the value immediately if the parent dynamically lowers the max threshold
  useEffect(() => {
    if (max !== null && value > max) {
      setErrorMsg(t("valueInput.valueAdjusted", {max: max}));
      setLocalValue(max);
      onValueChange(max); 
    }
  }, [max, value]);

  function handleChange(val) {
    setLocalValue(val);
  }

  // Master validation checkpoint: Fires when the user clicks away from the input field
  function handleBlur() {
    let numericValue = Number(localValue);
    
    if (isNaN(numericValue)) {
        numericValue = 0;
    }
    if (nullBlocker && (localValue === 0 || localValue === '' || localValue === null || localValue === undefined)) {
      setErrorMsg(t("valueInput.error0NotAllowed"));
      setLocalValue(value); // Revert to previous valid state
      onValueChange(value);
    } else if (max && localValue > max) {
      setErrorMsg(t("valueInput.errorMax") + max);
      onValueChange(max);
      setLocalValue(max);
    } else if (localValue === '') {
      setErrorMsg(null);
      onValueChange(0);
      setLocalValue(0);
    } else {
      setErrorMsg(null);
      onValueChange(numericValue);
      setLocalValue(numericValue);
    }
  }

  const selectData = useMemo(() => {
    return isArray ? units.map((u) => ({ value: t(u.label), label: t(u.label) })) : [];
  }, [isArray, units, t]);

  function handleSelectChange(selectedValue) {
    const selectedUnit = units.find(u => t(u.label) === selectedValue);
    if (onUnitChange && selectedUnit) {
      onUnitChange(selectedUnit);
    }
  }

  // Dynamically renders either a static text label (if only 1 unit exists) 
  // or an interactive dropdown (if multiple units like kW / MW are provided)
  const rightSection = hasMultipleUnits ? (
    <Select
      data={selectData}
      value={t(currentUnit?.label)}
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
    <Text size="sm" fw={500} c="black" pr="md">
      {isArray ? t(units[0].label) : t(units)}
    </Text>
  );

  return (
    <NumberInput
      id={id}
      label={label}
      value={localValue} 
      onChange={handleChange} 
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.target.blur();
      }}
      onBlur={handleBlur}
      min={0}
      allowNegative={false} // Hydrogen physics rarely accept negative masses or power
      rightSection={rightSection}
      rightSectionWidth="auto"
      hideControls // Hide default arrows to keep the visual weight entirely on the unit selector
      error={errorMsg}
      styles={{ 
        input: { paddingRight: '90px' }
      }}
      mb="sm"
    />
  );
}