import { Group, Tooltip, ActionIcon } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';



export default function LabelWithTooltip({ label, tooltip }) {
    return (
        <Group gap="xs" style={{ display: 'inline-flex' }}>
            <span>{label}</span>
            <Tooltip label={tooltip} withArrow multiline w={250} position="top">
                <ActionIcon variant="transparent" color="gray" size="xs">
                    <IconInfoCircle size={16} />
                </ActionIcon>
            </Tooltip>
        </Group>
    );
}