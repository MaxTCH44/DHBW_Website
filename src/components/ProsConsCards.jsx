import { useState, useRef, useEffect} from 'react';
import { Card, Title, List, Collapse, Group  } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';



function HoverCard({ title, items, bgColor, borderColor }) {
    const [isOpen, setIsOpen] = useState(false);
    const isMobile = useMediaQuery('(max-width: 768px)');
    const timeoutRef = useRef(null);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    function handleClick() {
        if (isMobile) {
            setIsOpen(prev => !prev);
        }
    }

    function handlePointerEnter(e) {
        if (e.pointerType === 'mouse') {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            setIsOpen(true);
        }
    }

    function handlePointerLeave(e) {
        if (e.pointerType === 'mouse') {
            timeoutRef.current = setTimeout(() => {
                setIsOpen(false);
            }, 1000);
        }
    }

    return (
        <Card
            w={{ base: '100%', sm: '45%', md: '40%' }}
            withBorder
            bg={bgColor}
            style={{
                borderColor: borderColor,
                borderWidth: "3px",
                cursor: 'pointer',
                transition: 'all 0.3s ease'
            }}
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
            onClick={handleClick}
        >
            <Title size="md" ta="center" mb={isOpen ? "sm" : 0} style={{ transition: 'margin 0.3s ease' }}>
                {title}
            </Title>

            <Collapse in={isOpen}>
                <List>
                    {items.map((listItem, index) => (
                        <List.Item key={index}>{listItem}</List.Item>
                    ))}
                </List>
            </Collapse>
        </Card>
    );
}

export default function ProsConsCards({ item }) {
    if (!item) return null;

    return (
        <Group justify="center" mt="lg" align="flex-start" gap="xl">
            <HoverCard
                title="Advantages"
                items={item.advantages}
                bgColor="#1bc73285"
                borderColor="green"
            />
            
            <HoverCard
                title="Disadvantages"
                items={item.disadvantages}
                bgColor="#ec3e3ea4"
                borderColor="red"
            />
        </Group>
    );
}