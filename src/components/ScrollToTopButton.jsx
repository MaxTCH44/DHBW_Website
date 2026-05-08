import { IconChevronUp } from '@tabler/icons-react';
import { ActionIcon } from '@mantine/core';

import { useMediaQuery, useWindowScroll } from '@mantine/hooks';

export default function ScrollToTopButton() {
    const isMobile = useMediaQuery('(max-width: 768px)');
    const [scroll] = useWindowScroll();

    if (scroll.y < 100) return null; 

    return (
        <ActionIcon
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
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