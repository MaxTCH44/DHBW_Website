import { useState, useEffect, useRef } from 'react';
import { Card, Group, Button, Text, ActionIcon, Box, Divider, Transition } from '@mantine/core';
import { IconChevronLeft, IconChevronRight, IconX } from '@tabler/icons-react';
import ContentDetails from './ContentDetails';



export default function AdviceCards({ helpData = [], onClose, onStepChange }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 350, isMobile: false });
    const [opened, setOpened] = useState(false);
    const cardRef = useRef(null);
    
    const step = helpData[currentStep];

    useEffect(() => {
        if (!helpData || helpData.length === 0) return;

        if (currentStep >= helpData.length) {
            const fallbackIndex = helpData.findIndex(s => s.id === 'step_compressor_selector'); 
            setCurrentStep(fallbackIndex !== -1 ? fallbackIndex : helpData.length - 1);
        }
    }, [helpData, currentStep]);

    useEffect(() => {
        if (!step) return; 

        setOpened(false); 
        const targetId = step?.targetId || step?.id;

        if (onStepChange) {
            onStepChange(step);
        }

        if (targetId) {
            let retries = 0;

            function findAndPositionTarget() {
                const target = document.getElementById(targetId);

                if (target && target.getBoundingClientRect().height > 0) {
                    const isMobile = window.innerWidth <= 768;

                    setTimeout(() => {
                        const currentTarget = document.getElementById(targetId);
                        if (!currentTarget) return;

                        if (isMobile) {
                            const elementTop = currentTarget.getBoundingClientRect().top + window.scrollY;
                            window.scrollTo({ top: elementTop - 150, behavior: 'smooth' });
                        } else {
                            currentTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }

                        const rect = currentTarget.getBoundingClientRect();
                        const cardWidth = isMobile ? Math.min(window.innerWidth - 20, 380) : 350;
                        const spacing = 15;

                        let newTop, newLeft;

                        if (isMobile) {
                            newLeft = (window.innerWidth - cardWidth) / 2;
                            newTop = rect.bottom + window.scrollY + spacing; 
                        } else {
                            newTop = rect.top + window.scrollY;
                            newLeft = rect.right + spacing;

                            if (newLeft + cardWidth > window.innerWidth-30) {
                                newLeft = rect.left - cardWidth - spacing;
                            }
                        }

                        newLeft = Math.max(10, newLeft);
                        
                        setCoords({ top: newTop, left: newLeft, width: cardWidth, isMobile });
                        setOpened(true); 
                        
                        currentTarget.style.outline = '3px solid var(--mantine-color-green-5)';
                        currentTarget.style.outlineOffset = '4px';
                    }, 150); 

                } else if (retries < 15) {
                    retries++;
                    setTimeout(findAndPositionTarget, 50);
                } else {
                    console.warn(`${targetId} can not be found`);
                }
            };

            findAndPositionTarget();

            return () => {
                const target = document.getElementById(targetId);
                if (target) target.style.outline = 'none';
            };
        }
    }, [currentStep, step, onStepChange]);

    function handleNext() {
        if (currentStep < helpData.length - 1) setCurrentStep(prev => prev + 1);
    };

    function handlePrev() {
        if (currentStep > 0) setCurrentStep(prev => prev - 1);
    };

    function handleMouseEnterStep(index) {
        if (index === currentStep) return;
        const targetId = helpData[index]?.targetId || helpData[index]?.id;
        
        if (targetId) {
            const target = document.getElementById(targetId);
            if (target) {
                target.style.outline = '3px dashed var(--mantine-color-gray-5)'; 
                target.style.outlineOffset = '4px';
                target.style.transition = 'outline 0.2s ease';
            }
        }
    };

    function handleMouseLeaveStep(index) {
        if (index === currentStep) return;
        const targetId = helpData[index]?.targetId || helpData[index]?.id;
        
        if (targetId) {
            const target = document.getElementById(targetId);
            if (target) {
                target.style.outline = 'none';
            }
        }
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
                    <Group justify="space-between" mb="sm" wrap="nowrap">
                        <Group gap="sm" wrap="nowrap" style={{ flex: 1 }}>
                            <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ whiteSpace: 'nowrap' }}>
                                Step {currentStep + 1} / {helpData.length}
                            </Text>
                            
                            <Group gap={1} wrap="nowrap" style={{ flex: 1, height: '6px' }}>
                                {helpData.map((_, index) => (
                                    <Box
                                        key={index}
                                        onClick={() => setCurrentStep(index)}
                                        onMouseEnter={() => handleMouseEnterStep(index)}
                                        onMouseLeave={() => handleMouseLeaveStep(index)}
                                        style={{
                                            flex: 1, 
                                            height: '100%',
                                            backgroundColor: index === currentStep 
                                                ? 'var(--mantine-color-green-5)' 
                                                : index < currentStep 
                                                    ? 'var(--mantine-color-green-2)' 
                                                    : 'var(--mantine-color-gray-2)', 
                                            borderRadius: '2px',
                                            cursor: 'pointer',
                                            transition: 'transform 0.1s ease, background-color 0.2s ease',
                                        }}
                                        onMouseOver={(e) => e.target.style.transform = 'scaleY(1.5)'}
                                        onMouseOut={(e) => e.target.style.transform = 'scaleY(1)'}
                                    />
                                ))}
                            </Group>
                        </Group>

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