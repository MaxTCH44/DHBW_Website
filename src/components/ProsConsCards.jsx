import { useState } from 'react';
import { Card, Title, List, Collapse, Group, ThemeIcon, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconCheck, IconX, IconChevronDown, IconChevronUp } from '@tabler/icons-react';



function InfoCard({ title, items, type }) {
    const [isOpenMobile, setIsOpenMobile] = useState(false);
    const isMobile = useMediaQuery('(max-width: 768px)');

    const isAdvantages = type === 'advantages';
    const iconColor = isAdvantages ? 'green' : 'red';
    const topBorderColor = isAdvantages ? '#40c057' : '#fa5252';
    const bgColor = isAdvantages ? 'rgba(64, 192, 87, 0.05)' : 'rgba(250, 82, 82, 0.05)';
    
    const isOpen = isMobile === false ? true : isOpenMobile;

    function handleClick() {
        if (isMobile) {
            setIsOpenMobile((prev) => !prev);
        }
    }

    return (
        <Card
            w={{ base: '100%', sm: '45%', md: '40%' }}
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            ta="left"
            onClick={handleClick}
            style={{
                borderTop: `4px solid ${topBorderColor}`,
                cursor: isMobile ? 'pointer' : 'default',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                backgroundColor: bgColor
            }}
        >
            <Group justify="space-between" align="center" mx="auto" mb={isOpen ? "xs" : 0}>
                <Group gap="sm">
                    <ThemeIcon color={iconColor} variant="light" size="lg" radius="xl">
                        {isAdvantages ? <IconCheck size={20} /> : <IconX size={20} />}
                    </ThemeIcon>
                    <Title order={4}>
                        {title}
                    </Title>
                </Group>
                {isMobile && (
                    <ThemeIcon variant="subtle" color="gray">
                        {isOpen ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
                    </ThemeIcon>
                )}
            </Group>
            <Collapse in={isOpen}>
                <List
                    spacing="sm"
                    size="sm"
                    mt="md"
                    icon={
                        <ThemeIcon color={iconColor} size={20} radius="xl">
                            {isAdvantages ? <IconCheck size={14} stroke={3} /> : <IconX size={14} stroke={3} />}
                        </ThemeIcon>
                    }
                >
                    {items.map((listItem, index) => (
                        <List.Item key={index}>
                            <Text size="sm">{listItem}</Text>
                        </List.Item>
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
            <InfoCard
                title="Advantages"
                items={item.advantages}
                type="advantages"
            />
            
            <InfoCard
                title="Disadvantages"
                items={item.disadvantages}
                type="disadvantages"
            />
        </Group>
    );
}