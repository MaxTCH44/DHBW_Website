import { Box, HoverCard, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

import './AlkalineElectrolyzer.css';



export default function AemElectrolyzer() {
    const isMobile = useMediaQuery('(max-width: 768px)');

    const handleSvgClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    return (
        <Box w={{ base: '100%', sm: '50%' }} mx="auto" ta="center" p="xl" style={{ overflow: 'hidden' }}>
            <svg width="100%" viewBox="0 0 406 470" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ maxWidth: 800, margin: 'auto', display: 'block' }}>
                
                <rect width="406" height="407" fill="white" rx="16"/>

                <g className="circuit">
                    <rect x="145" y="7" width="116" height="39" fill="black"/>
                    <text x="203" y="32" fontSize="14" fill="white" fontWeight="bold" textAnchor="middle" style={{ pointerEvents: 'none' }}>POWER SUPPLY</text>
                    <rect x="15" y="183" width="118" height="6" fill="black"/>
                    <rect x="17" y="185" width="116" height="2" fill="#FFFF00"/>
                    <rect x="15" y="23" width="6" height="160" fill="black"/>
                    <rect x="17" y="25" width="2" height="160" fill="#FFFF00"/>
                    <rect x="21" y="23" width="124" height="6" fill="black"/>
                    <rect x="19" y="25" width="126" height="2" fill="#FFFF00"/>
                    <rect width="118" height="6" transform="matrix(-1 0 0 1 391 183)" fill="black"/>
                    <rect width="116" height="2" transform="matrix(-1 0 0 1 389 185)" fill="#FFFF00"/>
                    <rect width="6" height="160" transform="matrix(-1 0 0 1 391 23)" fill="black"/>
                    <rect width="2" height="160" transform="matrix(-1 0 0 1 389 25)" fill="#FFFF00"/>
                    <rect width="124" height="6" transform="matrix(-1 0 0 1 385 23)" fill="black"/>
                    <rect width="126" height="2" transform="matrix(-1 0 0 1 387 25)" fill="#FFFF00"/>
                </g>

                <HoverCard 
                    position={isMobile ? "bottom" : "top"} 
                    withArrow 
                    shadow="md" 
                    bg='green.4'
                    width={isMobile ? "90vw" : 300}
                    openDelay={50} 
                    closeDelay={100} 
                    withinPortal={true}
                >
                    <HoverCard.Target>
                        <g className="interactive-element" onClick={handleSvgClick}>
                            <rect x="183" y="116" width="40" height="320" fill="#b768ca"/>
                            <text x="203" y="456" fontSize="14" fill="black" fontWeight="bold" textAnchor="middle" style={{ pointerEvents: 'none' }}>Membrane</text>
                        </g>
                    </HoverCard.Target>
                    <HoverCard.Dropdown bg="#b768ca" c="white" style={{ pointerEvents: 'none' }}>
                        <Text size="sm"><b>Anion Exchange Membrane (AEM)</b><br/>A solid polymer membrane that conducts negative Hydroxide ions (OH⁻) from the cathode to the anode. It provides the compact design of a PEM but operates in a slightly alkaline environment.</Text>
                    </HoverCard.Dropdown>
                </HoverCard>

                <g>
                    <HoverCard 
                        position={isMobile ? "bottom" : "left"} 
                        withArrow 
                        shadow="md" 
                        width={isMobile ? "90vw" : 250}
                        openDelay={50} 
                        closeDelay={100} 
                        withinPortal={true}
                    >
                        <HoverCard.Target>
                            <g className="interactive-element" onClick={handleSvgClick}>
                                <rect x="133" y="141" width="50" height="270" fill="#6E8BFD"/>
                                <text x="138" y="432" fontSize="14" fill="black" fontWeight="bold" textAnchor="middle" style={{ pointerEvents: 'none' }}>Cathode (-)</text>
                            </g>
                        </HoverCard.Target>
                        <HoverCard.Dropdown bg="#6E8BFD" c="white" style={{ pointerEvents: 'none' }}>
                            <Text size="sm"><b>Cathode (Non-PGM / Nickel-based)</b><br/>Water (H₂O) and electrons (e⁻) react here to form Hydrogen gas (H₂) and OH⁻ ions. Because AEM is not highly acidic, cheaper transition metals can be used instead of Platinum.</Text>
                        </HoverCard.Dropdown>
                    </HoverCard>
                </g>

                <g>
                    <HoverCard 
                        position={isMobile ? "bottom" : "right"} 
                        withArrow 
                        shadow="md" 
                        width={isMobile ? "90vw" : 250}
                        openDelay={50} 
                        closeDelay={100} 
                        withinPortal={true}
                    >
                        <HoverCard.Target>
                            <g className="interactive-element">
                                <rect x="223" y="141" width="50" height="270" fill="#FD6E6E"/>
                                <text x="263" y="432" fontSize="14" fill="black" fontWeight="bold" textAnchor="middle" style={{ pointerEvents: 'none' }}>Anode (+)</text>
                            </g>
                        </HoverCard.Target>
                        <HoverCard.Dropdown bg="#FD6E6E" c="white" style={{ pointerEvents: 'none' }}>
                            <Text size="sm"><b>Anode (Non-PGM / Nickel or Iron)</b><br/>The OH⁻ ions that crossed the membrane are oxidized here, releasing Oxygen gas (O₂), water, and electrons (e⁻). No expensive Iridium is required.</Text>
                        </HoverCard.Dropdown>
                    </HoverCard>
                </g>
                
                <g className="decorations" style={{ pointerEvents: 'none' }}>
                    <path d="M271.703 44.0767V34.4744H273.614V44.0767H271.703ZM267.861 40.2273V38.3168H277.463V40.2273H267.861Z" fill="black"/>
                    <path d="M135.855 36.9332V38.7727H129.406V36.9332H135.855Z" fill="black"/>
                    
                    <path d="M133 248.5L70 285.306L70 211.694L133 248.5Z" fill="#D9D9D9"/>
                    <rect x="72" y="270" width="60" height="43" transform="rotate(-180 72 270)" fill="#D9D9D9"/>
                    <text x="67" y="257" fontSize="24" fill="black" fontWeight="bold" textAnchor="middle" style={{ pointerEvents: 'none' }}>2 H₂O</text>
                    
                    <path d="M12 354.5L75 317.694V391.306L12 354.5Z" fill="#D9D9D9"/>
                    <rect x="73" y="333" width="60" height="43" fill="#D9D9D9"/>
                    <text x="80" y="363" fontSize="24" fill="black" fontWeight="bold" textAnchor="middle" style={{ pointerEvents: 'none' }}>H₂</text>

                    <path d="M394 248.5L331 285.306V211.694L394 248.5Z" fill="#D9D9D9"/>
                    <rect x="333" y="270" width="60" height="43" transform="rotate(-180 333 270)" fill="#D9D9D9"/>
                    <text x="330" y="257" fontSize="24" fill="black" fontWeight="bold" textAnchor="middle" style={{ pointerEvents: 'none' }}>H₂O</text>

                    <path d="M394 354.5L331 391.306V317.694L394 354.5Z" fill="#D9D9D9"/>
                    <rect x="333" y="376" width="60" height="43" transform="rotate(-180 333 376)" fill="#D9D9D9"/>
                    <text x="330" y="363" fontSize="24" fill="black" fontWeight="bold" textAnchor="middle" style={{ pointerEvents: 'none' }}>½O₂</text>
                </g>
                <g className="protons" style={{ pointerEvents: 'none' }}>
                    
                    <g className="ions ion-1">
                        <circle cx="230" cy="220" r="14" fill="#baff3b" />
                        <text x="230" y="224" fontSize="12" fill="black" textAnchor="middle" fontWeight="bold">OH⁻</text>
                    </g>

                    <g className="ions ion-2">
                        <circle cx="230" cy="280" r="14" fill="#baff3b" />
                        <text x="230" y="284" fontSize="12" fill="black" textAnchor="middle" fontWeight="bold">OH⁻</text>
                    </g>

                    <g className="ions ion-3">
                        <circle cx="230" cy="340" r="14" fill="#baff3b" />
                        <text x="230" y="344" fontSize="12" fill="black" textAnchor="middle" fontWeight="bold">OH⁻</text>
                    </g>

                </g>
                <g className="electrons" style={{ pointerEvents: 'none' }}>
                    
                    <g className="electron electron-1">
                        <circle cx="260" cy="185" r="10" fill="#ffee00" />
                        <text x="260" y="189" fontSize="10" fill="black" textAnchor="middle" fontWeight="bold">e⁻</text>
                    </g>

                    <g className="electron electron-2">
                        <circle cx="260" cy="185" r="10" fill="#ffee00" />
                        <text x="260" y="189" fontSize="10" fill="black" textAnchor="middle" fontWeight="bold">e⁻</text>
                    </g>

                    <g className="electron electron-3">
                        <circle cx="260" cy="185" r="10" fill="#ffee00" />
                        <text x="260" y="189" fontSize="10" fill="black" textAnchor="middle" fontWeight="bold">e⁻</text>
                    </g>

                </g>
            </svg>
        </Box>
    );
}