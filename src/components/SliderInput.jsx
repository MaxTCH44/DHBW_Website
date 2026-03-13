import { NumberInput, Slider, Box, Text } from '@mantine/core';

export default function SliderInput({ label, value, units, onValueChange, min, max }) {
  return (
    <Box pos="relative">
      <NumberInput
        value={value}
        onChange={onValueChange}
        label={label}
        min={min}
        max={max}
        hideControls
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
        label={null}
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