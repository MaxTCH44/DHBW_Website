import { useState, useEffect, useRef } from 'react';
import { Card, Group, Button, Text, ActionIcon, Box, Divider, Transition } from '@mantine/core';
import { IconChevronLeft, IconChevronRight, IconX } from '@tabler/icons-react';

import ContentDetails from './ContentDetails';



export default function AdviceCards({ helpData = [], onClose }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 350, isMobile: false });
    const [opened, setOpened] = useState(false);
    const cardRef = useRef(null);
    
    const step = helpData[currentStep];

    useEffect(() => {
        
        const targetId = step?.targetId || step?.id;

        if (targetId) {
            const target = document.getElementById(targetId);
            if (target) {
                const isMobile = window.innerWidth <= 768;

                if (isMobile) {
                    const elementTop = target.getBoundingClientRect().top + window.scrollY;
                    window.scrollTo({ top: elementTop - 150, behavior: 'smooth' });
                } else {
                    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }

                setTimeout(() => {
                    const rect = target.getBoundingClientRect();
                    const cardWidth = isMobile ? Math.min(window.innerWidth - 20, 380) : 350;
                    const spacing = 15;

                    let newTop, newLeft;

                    if (isMobile) {
                        newLeft = (window.innerWidth - cardWidth) / 2;
                        newTop = rect.bottom + window.scrollY + spacing; 
                    } else {
                        newTop = rect.top + window.scrollY;
                        newLeft = rect.right + spacing;

                        if (newLeft + cardWidth > window.innerWidth) {
                            newLeft = rect.left - cardWidth - spacing;
                        }
                    }

                    newLeft = Math.max(10, newLeft);
                    
                    setCoords({ 
                        top: newTop, 
                        left: newLeft, 
                        width: cardWidth,
                        isMobile 
                    });
                    
                    setOpened(true); 
                    
                    target.style.outline = '3px solid var(--mantine-color-green-5)';
                    target.style.outlineOffset = '4px';
                }, 150);

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
                        width: coords.width,
                        zIndex: 10000,
                        backgroundColor: 'var(--mantine-color-body)',
                        transition: 'top 0.4s ease-in-out, left 0.4s ease-in-out, width 0.4s ease'
                    }}
                >
                    <Group justify="space-between" mb="xs">
                        <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                            Step {currentStep + 1} / {helpData.length}
                        </Text>
                        <ActionIcon variant="subtle" color="gray" onClick={onClose}>
                            <IconX size={16} />
                        </ActionIcon>
                    </Group>

                    <Box mb="md" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                        {step && <ContentDetails item={step} />}
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