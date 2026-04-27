import { NumberInput, ActionIcon, Group } from '@mantine/core';
import { IconMinus, IconPlus } from '@tabler/icons-react';

/**
 * A strict incremental input field controlled solely by "+" and "-" buttons.
 * Used when values must respect specific physical constraints (e.g., equipment can only 
 * be sized in discrete modular steps, you can't buy 1.5 electrolyzers). 
 * Manual typing is disabled to prevent user entry errors.
 * * @param {Object} props
 * @param {string|React.ReactNode} props.label - The label displayed above the input.
 * @param {number} props.value - The current numerical value of the input.
 * @param {Function} props.onValueChange - Callback triggered when the value is incremented or decremented.
 * @param {number} props.step - The strict interval by which the value increases or decreases.
 * @param {number} props.min - The absolute minimum allowed value.
 * @param {string|Object} [props.unit=""] - The physical unit appended to the value (e.g., "kW", "stacks").
 */
export default function IncrementalInput({ label, value, onValueChange, step, min, unit = "" }) {
    
    // Note: Math.round((...)*100)/100 is used to prevent the infamous JavaScript floating-point 
    // precision bugs (e.g., 0.1 + 0.2 resulting in 0.30000000000000004).
    const handleIncrement = () => {
        const newValue = Math.round((value + step) * 100) / 100;
        onValueChange(newValue);
    };

    const handleDecrement = () => {
        const newValue = Math.round((value - step) * 100) / 100;
        if (newValue >= min) {
            onValueChange(newValue);
        }
    };

    const displayUnit = typeof unit === 'object' ? unit.label : unit;

    const controls = (
        <Group gap={2} mr={5}>
            <ActionIcon 
                size="sm" 
                variant="subtle" 
                color="gray" 
                onClick={handleDecrement}
                disabled={value <= min}
            >
                <IconMinus size={14} />
            </ActionIcon>
            <ActionIcon 
                size="sm" 
                variant="subtle" 
                color="green" 
                onClick={handleIncrement}
            >
                <IconPlus size={14} />
            </ActionIcon>
        </Group>
    );

    return (
        <NumberInput
            label={label}
            value={value}
            suffix={` ${displayUnit}`} 
            readOnly // Prevents free-form text entry to strictly enforce the step intervals
            rightSection={controls}
            rightSectionWidth={60} 
            mb="md"
            styles={{
                input: {
                    cursor: 'default',
                    fontWeight: 500
                }
            }}
        />
    );
}