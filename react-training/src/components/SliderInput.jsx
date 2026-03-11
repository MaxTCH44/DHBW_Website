import { NumberInput, Slider } from '@mantine/core';
import classes from './SliderInput.module.css';

export default function SliderInput({ label, value, units, onValueChange, min, max }) {
  return (
    <div className={classes.wrapper}>
      <NumberInput
        value={value}
        onChange={onValueChange}
        label={label + ' (' + units + ')'}
        min={min}
        max={max}
        hideControls
        classNames={{ input: classes.input, label: classes.label }}
      />
      <Slider
        max={max}
        min={min}
        label={null}
        value={typeof value === 'string' ? 0 : value}
        onChange={onValueChange}
        size={3 }
        className={classes.slider}
        classNames={classes}
        thumbLabel={label}
      />
    </div>
  );
}
