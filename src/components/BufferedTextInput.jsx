import { useState, useEffect } from 'react';
import { TextInput } from '@mantine/core';

export default function BufferedTextInput({ value, onValueChange, ...others }) {
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    return (
        <TextInput
            value={localValue}
            onChange={(e) => setLocalValue(e.currentTarget.value)}
            onBlur={() => onValueChange(localValue)}
            onKeyDown={(e) => {
                if (e.key === 'Enter') e.target.blur();
            }}
            {...others}
        />
    );
}