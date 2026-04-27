import { useState, useEffect, useRef } from 'react';
import { Card, Group, Button, Text, ActionIcon, Box, Divider, Transition } from '@mantine/core';
import { IconChevronLeft, IconChevronRight, IconX } from '@tabler/icons-react';

import ContentDetails from './ContentDetails';

/**
 * Renders a floating, interactive tutorial card that visually targets and explains specific DOM elements.
 * It automatically calculates its position relative to the target element and handles auto-scrolling 
 * to ensure the highlighted input remains clearly visible to the user.
 * * @param {Object} props
 * @param {Array} props.helpData - Array of step objects containing the content to display and the target DOM id.
 * @param {Function} props.onClose - Callback triggered when the user dismisses or finishes the tutorial.
 * @param {Function} props.onStepChange - Callback triggered when navigating steps. Used by the parent to open hidden sections (e.g., closed accordions) before the card tries to position itself.
 */
export default function AdviceCards({ helpData = [], onClose, onStepChange }) {
    
    // --- STATE & CONSTANTS ---
    const [currentStep, setCurrentStep] = useState(0);
    // Tracks the absolute coordinates to position the floating card over the application
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 350, isMobile: false });
    const [opened, setOpened] = useState(false);
    const cardRef = useRef(null);
    
    const step = helpData[currentStep];

    // --- EFFECTS & DOM POSITIONING ---

    // Safety fallback: If the parent dynamically filters the helpData array (e.g., hiding compressor steps),
    // and the user was on a step index that no longer exists, we safely redirect them to a valid step.
    useEffect(() => {
        if (!helpData || helpData.length === 0) return;

        if (currentStep >= helpData.length) {
            const fallbackIndex = helpData.findIndex(s => s.id === 'step_compressor_selector'); 
            setCurrentStep(fallbackIndex !== -1 ? fallbackIndex : helpData.length - 1);
        }
    }, [helpData, currentStep]);

    // The core positioning engine: Fires every time the user navigates to a new tutorial step.
    useEffect(() => {
        if (!step) return; 

        // Briefly hide the card during transition to prevent visual teleportation glitches
        setOpened(false); 
        const targetId = step?.targetId || step?.id;

        // Notify parent so it can prepare the DOM (like expanding collapsed detail sections)
        if (onStepChange) {
            onStepChange(step);
        }

        if (targetId) {
            let retries = 0;

            // We use a recursive retry function because the target DOM element might be inside 
            // a Mantine Collapse/Accordion that takes a few milliseconds to render and get its physical height.
            function findAndPositionTarget() {
                const target = document.getElementById(targetId);

                if (target && target.getBoundingClientRect().height > 0) {
                    const isMobile = window.innerWidth <= 768;

                    // Small delay to ensure any parent scrolling/animation is completely finished
                    setTimeout(() => {
                        const currentTarget = document.getElementById(targetId);
                        if (!currentTarget) return;

                        // Auto-scroll logic: Keep the target element in the user's viewport
                        if (isMobile) {
                            const elementTop = currentTarget.getBoundingClientRect().top + window.scrollY;
                            // Scroll slightly above the element so the floating card doesn't cover it
                            window.scrollTo({ top: elementTop - 150, behavior: 'smooth' });
                        } else {
                            currentTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }

                        const rect = currentTarget.getBoundingClientRect();
                        const cardWidth = isMobile ? Math.min(window.innerWidth - 20, 380) : 350;
                        const spacing = 15;

                        let newTop, newLeft;
                        
                        // Positioning strategy: 
                        // On mobile, the card floats underneath the targeted input.
                        // On desktop, the card anchors to the right side of the targeted input.
                        if (isMobile) {
                            newLeft = (window.innerWidth - cardWidth) / 2;
                            newTop = rect.bottom + window.scrollY + spacing; 
                        } else {
                            newTop = rect.top + window.scrollY;
                            newLeft = rect.right + spacing;

                            // Edge case: If the card overflows the right side of the screen, flip it to the left side
                            if (newLeft + cardWidth > window.innerWidth - 30) {
                                newLeft = rect.left - cardWidth - spacing;
                            }
                        }

                        newLeft = Math.max(10, newLeft); // Prevent bleeding off the left screen edge
                        setCoords({ top: newTop, left: newLeft, width: cardWidth, isMobile });
                        setOpened(true); 
                        
                        // Highlight the targeted DOM element to draw the user's attention
                        currentTarget.style.outline = '3px solid var(--mantine-color-green-5)';
                        currentTarget.style.outlineOffset = '4px';
                    }, 150);
                } else if (retries < 15) {
                    // Retry up to 15 times (750ms total) waiting for the element to physically mount in the DOM
                    retries++;
                    setTimeout(findAndPositionTarget, 50);
                } else {
                    console.warn(`${targetId} can not be found in the DOM.`);
                }
            };

            findAndPositionTarget();

            // Cleanup function: Remove the green highlight from the previous element when moving to the next step
            return () => {
                const target = document.getElementById(targetId);
                if (target) target.style.outline = 'none';
            };
        }
    }, [currentStep, step, onStepChange]);

    // --- EVENT HANDLERS ---

    function handleNext() {
        if (currentStep < helpData.length - 1) setCurrentStep(prev => prev + 1);
    };

    function handlePrev() {
        if (currentStep > 0) setCurrentStep(prev => prev - 1);
    };

    // Hover effects for the progress bar: Pre-highlights the future target element in dashed gray
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

    // --- RENDER ---

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
                        // Smoothly animate the card flying across the screen between steps
                        transition: 'top 0.4s ease-in-out, left 0.4s ease-in-out, width 0.4s ease'
                    }}
                >
                    <Group justify="space-between" mb="sm" wrap="nowrap">
                        <Group gap="sm" wrap="nowrap" style={{ flex: 1 }}>
                            <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ whiteSpace: 'nowrap' }}>
                                Step {currentStep + 1} / {helpData.length}
                            </Text>
                            
                            {/* Custom interactive progress bar */}
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