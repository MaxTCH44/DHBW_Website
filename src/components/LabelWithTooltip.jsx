import { useState } from 'react';
import { Group, Tooltip, ActionIcon } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useMediaQuery } from '@mantine/hooks';

export default function LabelWithTooltip({ label, tooltip }) {
    const [opened, setOpened] = useState(false);
    const isMobile = useMediaQuery('(max-width: 768px)');

    return (
        <Group gap="xs" style={{ display: 'inline-flex' }}>
            <span>{label}</span>
            <Tooltip 
                label={tooltip} 
                withArrow 
                multiline 
                w={250} 
                position="top"
                opened={opened}
            >
                <ActionIcon 
                    variant="transparent" 
                    color="gray" 
                    size="xs"
                    onMouseEnter={() => !isMobile && setOpened(true)}
                    onMouseLeave={() => !isMobile && setOpened(false)}
                    onClick={() => {
                        if (isMobile) {
                            setOpened((o) => !o);
                        }
                    }}
                    onBlur={() => setOpened(false)}
                >
                    <IconInfoCircle size={16} />
                </ActionIcon>
            </Tooltip>
        </Group>
    );
}