import { useState } from 'react';

import { IconChevronUp } from '@tabler/icons-react';
import { ActionIcon } from '@mantine/core';

import { useMediaQuery, useWindowScroll } from '@mantine/hooks';


/**
 * A scroll-to-top button that appears after scrolling down 100px.
 * Smoothly scrolls the page back to the top when clicked, with a brief
 * disabled state to prevent multiple triggers during the animation.
 * Automatically resizes for mobile screens.
 */
export default function ScrollToTopButton() {
    const isMobile = useMediaQuery('(max-width: 768px)');
    const [scroll] = useWindowScroll();
    const [disabled, setDisabled] = useState(false);

    const handleClick = () => {
        if (disabled) return;

        setDisabled(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
            setDisabled(false);
        }, 1000);
    };

    if (scroll.y < 100) return null; 

    return (
        <ActionIcon
        onClick={handleClick}
        variant="filled"
        color= "green.3"
        size={isMobile ? 'md' : 'xl'}
        radius="xl"
        style={{
            position: 'fixed',
            bottom: isMobile ? '1rem' : '1.5rem',
            right: isMobile ? '1rem' : '1.5rem',
            zIndex: 1000,
        }}
        >
            <IconChevronUp size={isMobile ? 16 : 20} color="white" stroke={3} />
        </ActionIcon>
    );
}