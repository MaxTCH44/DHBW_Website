import { Box, HoverCard, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

import './SoecElectrolyzer.css';



export default function SoecElectrolyzer() {
    const isMobile = useMediaQuery('(max-width: 768px)');

    const handleSvgClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    return (
        <Box w={{ base: '100%', sm: '50%' }} mx="auto" ta="center" p="xl" style={{ overflow: 'hidden' }}>
            <svg width="100%" viewBox="0 0 406 470" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ maxWidth: 800, margin: 'auto', display: 'block' }}>
                
                <rect width="406" height="407" fill="white" rx="16"/>
                <circle cx="203" cy="283" r="187" fill="url(#paint0_radial_20_2)"/>

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
                        <rect x="183" y="116" width="40" height="320" fill="#FEEA14"/>
                        <text x="203" y="456" fontSize="14" fill="black" fontWeight="bold" textAnchor="middle" style={{ pointerEvents: 'none' }}>Ceramic</text>
                        </g>
                    </HoverCard.Target>
                    <HoverCard.Dropdown bg="#FEEA14" c="black" style={{ pointerEvents: 'none' }}>
                        <Text size="sm"><b>Solid Oxide Electrolyte (Ceramic)</b><br/>A dense ceramic material (like YSZ) operating at ultra-high temperatures (700-1000°C). It conducts negative Oxide ions (O²⁻) while blocking electrons and gases.</Text>
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
                            <Text size="sm"><b>Cathode (Fuel Electrode)</b><br/>Steam (H₂O vapor) enters here. High heat and electrons split the steam into Hydrogen gas (H₂) and Oxide ions (O²⁻). Using steam dramatically reduces the electricity required.</Text>
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
                            <Text size="sm"><b>Anode (Air/Oxygen Electrode)</b><br/>The Oxide ions (O²⁻) traveling through the ceramic arrive here, where they release electrons (e⁻) and combine to form pure Oxygen gas (O₂).</Text>
                        </HoverCard.Dropdown>
                    </HoverCard>
                </g>
                
                <g className="decorations" style={{ pointerEvents: 'none' }}>
                    <path d="M271.703 44.0767V34.4744H273.614V44.0767H271.703ZM267.861 40.2273V38.3168H277.463V40.2273H267.861Z" fill="black"/>
                    <path d="M135.855 36.9332V38.7727H129.406V36.9332H135.855Z" fill="black"/>
                    
                    <path d="M133 252L82.75 290.105L82.75 213.895L133 252Z" fill="#948A8A"/>
                    <path d="M84.5584 228.205C52.5387 203.747 48.8908 276.095 12 228.248L12 283.887C49.5173 315.588 65.2504 241.187 84.6141 283.887C85.903 286.729 83.4567 228.265 84.5584 228.205Z" fill="#948A8A"/>
                    <path d="M84.5584 228.205C84.5769 228.219 84.5955 228.233 84.6141 228.248C84.5946 228.218 84.576 228.204 84.5584 228.205Z" fill="#948A8A"/>
                    <text x="85" y="260" fontSize="24" fill="white" fontWeight="bold" textAnchor="middle" style={{ pointerEvents: 'none' }}>H₂O</text>
                    
                    <path d="M12 354.5L75 317.694V391.306L12 354.5Z" fill="#948A8A"/>
                    <rect x="73" y="333" width="60" height="43" fill="#948A8A"/>
                    <text x="80" y="363" fontSize="24" fill="white" fontWeight="bold" textAnchor="middle" style={{ pointerEvents: 'none' }}>H₂</text>

                    <path d="M394 299.5L331 336.306V262.694L394 299.5Z" fill="#948A8A"/>
                    <rect x="333" y="321" width="60" height="43" transform="rotate(-180 333 321)" fill="#948A8A"/>
                    <text x="330" y="308" fontSize="24" fill="white" fontWeight="bold" textAnchor="middle" style={{ pointerEvents: 'none' }}>½O₂</text>
                </g>
                <g className="protons" style={{ pointerEvents: 'none' }}>
                    
                    <g className="ions ion-1">
                        <circle cx="230" cy="220" r="14" fill="#ff0000" />
                        <text x="230" y="224" fontSize="12" fill="black" textAnchor="middle" fontWeight="bold">O²⁻</text>
                    </g>

                    <g className="ions ion-2">
                        <circle cx="230" cy="280" r="14" fill="#ff0000" />
                        <text x="230" y="284" fontSize="12" fill="black" textAnchor="middle" fontWeight="bold">O²⁻</text>
                    </g>

                    <g className="ions ion-3">
                        <circle cx="230" cy="340" r="14" fill="#ff0000" />
                        <text x="230" y="344" fontSize="12" fill="black" textAnchor="middle" fontWeight="bold">O²⁻</text>
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
                <defs>
                    <radialGradient id="paint0_radial_20_2" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(203 283) rotate(90) scale(187)">
                        <stop stopColor="#FE7F25"/>
                        <stop offset="0.572115" stopColor="#FEC8A2"/>
                        <stop offset="1" stopColor="white"/>
                    </radialGradient>
                </defs>
            </svg>
        </Box>
    );
}