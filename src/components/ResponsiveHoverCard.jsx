import { HoverCard, Popover } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

export default function ResponsiveHoverCard({ 
    target, 
    dropdown, 
    dropdownProps, 
    openDelay,
    closeDelay,
    ...others 
}) {
    
    const isTouch = useMediaQuery('(hover: none) and (pointer: coarse)');

    if (isTouch) {
        return (
            <Popover {...others}>
                <Popover.Target>{target}</Popover.Target>
                <Popover.Dropdown {...dropdownProps}>{dropdown}</Popover.Dropdown>
            </Popover>
        );
    }

    return (
        <HoverCard openDelay={openDelay} closeDelay={closeDelay} {...others}>
            <HoverCard.Target>{target}</HoverCard.Target>
            <HoverCard.Dropdown {...dropdownProps}>{dropdown}</HoverCard.Dropdown>
        </HoverCard>
    );
}