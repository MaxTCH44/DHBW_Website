import { useState } from 'react';
import { Group, Tooltip, ActionIcon, Box } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useMediaQuery } from '@mantine/hooks';

/**
 * A standardized label wrapper that appends a small info icon.
 * Hovering or tapping the icon displays a tooltip. This is crucial for keeping 
 * the main UI clean while still providing definitions for complex technical terms 
 * (like CAPEX, Stack Power, LCOH).
 * * @param {Object} props
 * @param {string} props.label - The primary text to display next to the target input.
 * @param {string} props.tooltip - The explanatory text inside the popup bubble.
 */
export default function LabelWithTooltip({ label, tooltip }) {
    const [opened, setOpened] = useState(false);
    
    // Identifies if the user is on a touch device to gracefully handle tooltip interactions
    // since 'hover' states do not exist natively on smartphones.
    const isMobile = useMediaQuery('(max-width: 768px)');

    // Sépare le dernier mot du reste pour le coller à l'icône
    const words = label.split(' ');
    const lastWord = words.pop();
    const firstPart = words.join(' ');

    return (
        <span style={{ lineHeight: 1.4 }}>
            {firstPart && <>{firstPart} </>}
            <span style={{ whiteSpace: 'nowrap' }}>
                {lastWord}
                <Tooltip
                    label={tooltip}
                    withArrow
                    multiline
                    w={250}
                    position="top"
                    opened={opened}
                >
                    <ActionIcon
                        component="span"
                        variant="transparent"
                        color="gray"
                        size="xs"
                        style={{
                            display: 'inline-flex',
                            verticalAlign: 'middle',
                            marginLeft: 4,
                            marginBottom: 2,
                        }}
                        onMouseEnter={() => !isMobile && setOpened(true)}
                        onMouseLeave={() => !isMobile && setOpened(false)}
                        onClick={() => isMobile && setOpened((o) => !o)}
                        onBlur={() => setOpened(false)}
                    >
                        <IconInfoCircle size={16} />
                    </ActionIcon>
                </Tooltip>
            </span>
        </span>
    );
}