import { Box, HoverCard, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

import './PemFuelCell.css';



export default function PemFuelCell() {
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
                    <rect x="200" y="46" width="6" height="23" fill="#5B5959"/>
                    <text x="203" y="32" fontSize="12" fill="white" fontWeight="bold" textAnchor="middle" style={{ pointerEvents: 'none' }}>Electric motor</text>
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

                <g className="rotor">
                    <path d="M207.152 69.4802C205.789 77.0001 203.866 85.7784 197.2 86.7179C190.534 87.6574 170.918 79.2055 180.242 76.9271C189.565 74.6488 193.854 70.7783 200.086 65.4007L207.152 69.4802Z" fill="#D9D9D9"/>
                    <path d="M204 63.0396C211.194 60.4601 219.758 57.7363 223.904 63.0396C228.051 68.343 230.539 89.5564 223.904 82.6212C217.27 75.6861 211.773 73.907 204 71.1986V63.0396Z" fill="#D9D9D9"/>
                    <path d="M199.632 69.2648C193.801 64.3244 187.161 58.2699 189.68 52.027C192.2 45.7842 209.327 33.0228 206.638 42.2362C203.95 51.4497 205.157 57.0994 206.698 65.1853L199.632 69.2648Z" fill="#D9D9D9"/>
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
                            <rect x="183" y="116" width="40" height="320" fill="#EDD2B8"/>
                            <text x="203" y="456" fontSize="14" fill="black" fontWeight="bold" textAnchor="middle" style={{ pointerEvents: 'none' }}>Membrane</text>
                        </g>
                    </HoverCard.Target>
                    <HoverCard.Dropdown bg="#EDD2B8" c="black" style={{ pointerEvents: 'none' }}>
                        <Text size="sm"><b>Proton Exchange Membrane (PEM)</b><br/>A solid polymer membrane that acts as an electrolyte. It allows only the positively charged protons (H⁺) to pass through to the cathode, forcing the electrons to travel through the external circuit.</Text>
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
                                <text x="138" y="432" fontSize="14" fill="black" fontWeight="bold" textAnchor="middle" style={{ pointerEvents: 'none' }}>Cathode (+)</text>
                            </g>
                        </HoverCard.Target>
                        <HoverCard.Dropdown bg="#6E8BFD" c="white" style={{ pointerEvents: 'none' }}>
                            <Text size="sm"><b>Cathode (+)</b><br/>Oxygen (O₂) from the air enters here. It combines with the protons (H⁺) crossing the membrane and electrons (e⁻) arriving from the motor to form pure water (H₂O).</Text>
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
                                <text x="263" y="432" fontSize="14" fill="black" fontWeight="bold" textAnchor="middle" style={{ pointerEvents: 'none' }}>Anode (-)</text>
                            </g>
                        </HoverCard.Target>
                        <HoverCard.Dropdown bg="#FD6E6E" c="white" style={{ pointerEvents: 'none' }}>
                           <Text size="sm"><b>Anode (-)</b><br/>Compressed Hydrogen (H₂) enters here. The catalyst splits the H₂ molecules into protons (H⁺) and electrons (e⁻). The electrons flow through the external circuit to power the motor.</Text>
                        </HoverCard.Dropdown>
                    </HoverCard>
                </g>
                
                <g className="decorations" style={{ pointerEvents: 'none' }}>
                    <path d="M131.703 44.0767V34.4744H133.614V44.0767H131.703ZM127.861 40.2273V38.3168H137.463V40.2273H127.861Z" fill="black"/>
                    <path d="M275.855 38.9332V40.7727H269.406V38.9332H275.855Z" fill="black"/>                    
                    
                    <path d="M12 360.5L75 323.694V397.306L12 360.5Z" fill="#D9D9D9"/>
                    <rect x="73" y="339" width="60" height="43" fill="#D9D9D9"/>
                    <text x="82" y="368" fontSize="24" fill="black" fontWeight="bold" textAnchor="middle" style={{ pointerEvents: 'none' }}>H₂O</text>
                    
                    <path d="M273 299.5L336 336.306V262.694L273 299.5Z" fill="#D9D9D9"/>
                    <rect width="60" height="43" transform="matrix(1 0 0 -1 334 321)" fill="#D9D9D9"/>
                    <text x="340" y="308" fontSize="24" fill="black" fontWeight="bold" textAnchor="middle" style={{ pointerEvents: 'none' }}>H₂</text>
                    
                    <path d="M133 257.5L70 294.306L70 220.694L133 257.5Z" fill="#D9D9D9"/>
                    <rect x="72" y="279" width="60" height="43" transform="rotate(-180 72 279)" fill="#D9D9D9"/>
                    <text x="70" y="265" fontSize="24" fill="black" fontWeight="bold" textAnchor="middle" style={{ pointerEvents: 'none' }}>O₂</text>
                </g>
                <g className="protons" style={{ pointerEvents: 'none' }}>
                    
                    <g className="proton proton-1">
                        <circle cx="230" cy="220" r="10" fill="#baff3b" />
                        <text x="230" y="224" fontSize="12" fill="black" textAnchor="middle" fontWeight="bold">H⁺</text>
                    </g>

                    <g className="proton proton-2">
                        <circle cx="230" cy="280" r="10" fill="#baff3b" />
                        <text x="230" y="284" fontSize="12" fill="black" textAnchor="middle" fontWeight="bold">H⁺</text>
                    </g>

                    <g className="proton proton-3">
                        <circle cx="230" cy="340" r="10" fill="#baff3b" />
                        <text x="230" y="344" fontSize="12" fill="black" textAnchor="middle" fontWeight="bold">H⁺</text>
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