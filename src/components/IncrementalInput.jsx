import { NumberInput, ActionIcon, Group } from '@mantine/core';
import { IconMinus, IconPlus } from '@tabler/icons-react';



export default function IncrementalInput({ label, value, onValueChange, step, min, unit = "" }) {
    
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
            readOnly 
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