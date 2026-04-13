import { useState, useEffect, useRef } from 'react';
import { Card, Group, Button, Text, ActionIcon, Box, Divider, Transition } from '@mantine/core';
import { IconChevronLeft, IconChevronRight, IconX } from '@tabler/icons-react';
import ContentDetails from './ContentDetails';

export default function AdviceCards({ helpData = [], onClose }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const [opened, setOpened] = useState(false);
    const cardRef = useRef(null);
    
    const step = helpData[currentStep];

    useEffect(() => {
        setOpened(true);
        
        if (step?.id) {
            const target = document.getElementById(step.id);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });

                setTimeout(() => {
                    const rect = target.getBoundingClientRect();
                    const cardWidth = 350;
                    const spacing = 15;

                    let top = rect.top + window.scrollY;
                    let left = rect.right + spacing;

                    if (left + cardWidth > window.innerWidth) {
                        left = rect.left - cardWidth - spacing;
                    }

                    if (left < 0) {
                        left = Math.max(10, (window.innerWidth - cardWidth) / 2);
                        top = rect.top + window.scrollY - 200; 
                    }

                    const viewportHeight = window.innerHeight;
                    if (top + 250 > window.scrollY + viewportHeight) {
                        top = window.scrollY + viewportHeight - 300;
                    }

                    setCoords({ top, left });
                    
                    target.style.outline = '3px solid var(--mantine-color-green-5)';
                    target.style.outlineOffset = '4px';
                }, 100);

                return () => {
                    target.style.outline = 'none';
                };
            }
        }
    }, [currentStep, step]);

    const handleNext = () => {
        if (currentStep < helpData.length - 1) setCurrentStep(prev => prev + 1);
    };

    const handlePrev = () => {
        if (currentStep > 0) setCurrentStep(prev => prev - 1);
    };

    if (!helpData || helpData.length === 0) return null;

    return (
        <Transition mounted={opened} transition="fade" duration={400}>
            {(transitionStyles) => (
                <Card 
                    ref={cardRef}
                    withBorder 
                    shadow="xl" 
                    radius="md" 
                    p="md" 
                    style={{ 
                        ...transitionStyles,
                        position: 'absolute', 
                        top: coords.top,
                        left: coords.left,
                        width: 350, 
                        zIndex: 10000,
                        backgroundColor: 'var(--mantine-color-body)',
                        pointerEvents: 'all'
                    }}
                >
                    <Group justify="space-between" mb="xs">
                        <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                            Help Step {currentStep + 1} / {helpData.length}
                        </Text>
                        <ActionIcon variant="subtle" color="gray" onClick={onClose}>
                            <IconX size={16} />
                        </ActionIcon>
                    </Group>

                    <Box mb="md" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                        <ContentDetails item={step} />
                    </Box>

                    <Divider my="sm" />

                    <Group justify="space-between">
                        <Button 
                            variant="subtle" 
                            leftSection={<IconChevronLeft size={16} />} 
                            onClick={handlePrev}
                            disabled={currentStep === 0}
                            size="xs"
                        >
                            Previous
                        </Button>

                        {currentStep === helpData.length - 1 ? (
                            <Button variant="light" color="green" size="xs" onClick={onClose}>
                                Finish
                            </Button>
                        ) : (
                            <Button 
                                variant="light" 
                                rightSection={<IconChevronRight size={16} />} 
                                onClick={handleNext}
                                size="xs"
                            >
                                Next
                            </Button>
                        )}
                    </Group>
                </Card>
            )}
        </Transition>
    );
}