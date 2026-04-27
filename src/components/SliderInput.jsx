import { NumberInput, Slider, Box, Text } from '@mantine/core';
import { useEffect } from 'react';

/**
 * A composite input component blending a precise NumberInput with a visual Slider.
 * The slider is seamlessly attached to the bottom of the input field, providing both 
 * exact numerical control and an intuitive visual gauge of the value relative to its limits.
 * * @param {Object} props
 * @param {string|React.ReactNode} props.label - The descriptive label shown above the input.
 * @param {number} props.value - The current controlled numerical value.
 * @param {string} props.units - The physical unit appended to the right side of the input (e.g., "%", "kg").
 * @param {Function} props.onValueChange - Callback triggered whenever the number or slider changes.
 * @param {number} props.min - The absolute minimum limit allowed for the value.
 * @param {number} [props.max] - The dynamic maximum limit. Essential for preventing impossible physics (e.g., compressing more H2 than what was produced).
 * @param {number} [props.step=1] - The increment step for both the input and slider.
 * @param {string} [props.id=null] - Optional HTML id, primarily used by the interactive tutorial (AdviceCards) to target this specific element.
 */
export default function SliderInput({ label, value, units, onValueChange, min, max, step = 1, id = null }) {

  // Automatically clamps the value down if the parent component dynamically reduces the maximum limit
  // (For example, if the user lowers the total hydrogen production, the mass to compress must lower accordingly)
  useEffect(() => {
    if (max !== undefined && max !== null && value > max) {
      onValueChange(max);
    }
  }, [max, value]);

  // Ensures that leaving the input entirely empty gracefully falls back to zero instead of crashing
  function handleBlur() {
    if (value === '' || value === null){
      onValueChange(0);
    }
  }

  return (
    <Box pos="relative">
      <NumberInput
        id={id}
        value={value}
        onChange={onValueChange}
        onBlur={handleBlur}
        label={label}
        min={min}
        max={max}
        hideControls // Hide the default +/- buttons to keep the UI clean (the slider replaces their function)
        rightSection={<Text pr='sm'>{units}</Text>}
        rightSectionWidth="auto"
        styles={{
          input: {
            height: 'auto',
            paddingBottom: '3px',
            borderBottomRightRadius: 0,
            borderBottomLeftRadius: 0,
          },
        }}
      />
      <Slider
        max={max}
        min={min}
        // Auto-calculates a smooth stepping scale if no strict step is provided, ensuring fluid slider movement
        step={Number.isInteger(max) || step !== 1 ? step : Number((max/10).toFixed(3))}
        label={null} // Tooltip is disabled as the NumberInput directly above already shows the exact value
        value={typeof value === 'string' ? 0 : value}
        onChange={onValueChange}
        size={3}
        aria-label={label}
        styles={{
          root: {
            position: 'absolute',
            width: '100%',
            bottom: '-1px',
          },
          thumb: {
            width: '16px',
            height: '16px',
          },
          bar: {
            borderRadius: 0,
          }
        }}
      />
    </Box>
  );
}