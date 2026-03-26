import { Box, HoverCard, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

import './AlkalineElectrolyzer.css';



export default function AlkalineElectrolyzer() {
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
                            <rect x="183" y="116" width="40" height="320" fill="#7F8299"/>
                            <path d="M196.219 329.279L183.005 316.032L183.005 302.657L209.56 329.28L196.219 329.279ZM223.026 329.28L222.901 329.28L183.005 289.281L183.006 275.906L223.027 316.031L223.026 329.28ZM223.027 302.657L196.345 275.906L209.685 275.906L223.027 289.282L223.027 302.657Z" fill="#A0E8D9"/>
                            <path d="M196.219 382.561L183.005 369.313L183.005 355.938L209.56 382.561L196.219 382.561ZM223.026 382.561L222.901 382.561L183.005 342.563L183.006 329.188L223.027 369.313L223.026 382.561ZM223.027 355.938L196.345 329.188L209.685 329.188L223.027 342.563L223.027 355.938Z" fill="#A0E8D9"/>
                            <path d="M196.219 435.842L183.005 422.595L183.005 409.22L209.56 435.843L196.219 435.842ZM223.026 435.843L222.901 435.843L183.005 395.844L183.006 382.469L223.027 422.594L223.026 435.843ZM223.027 409.22L196.345 382.469L209.685 382.469L223.027 395.845L223.027 409.22Z" fill="#A0E8D9"/>
                            <path d="M196.219 169.435L183.005 156.187L183.005 142.812L209.56 169.435L196.219 169.435ZM223.026 169.435L222.901 169.435L183.005 129.437L183.006 116.062L223.027 156.187L223.026 169.435ZM223.027 142.812L196.345 116.062L209.685 116.062L223.027 129.437L223.027 142.812Z" fill="#A0E8D9"/>
                            <path d="M196.219 222.716L183.005 209.469L183.005 196.094L209.56 222.717L196.219 222.716ZM223.026 222.717L222.901 222.717L183.005 182.718L183.006 169.343L223.027 209.468L223.026 222.717ZM223.027 196.094L196.345 169.343L209.685 169.343L223.027 182.719L223.027 196.094Z" fill="#A0E8D9"/>
                            <path d="M196.219 275.998L183.005 262.75L183.005 249.375L209.56 275.998L196.219 275.998ZM223.026 275.998L222.901 275.998L183.005 236L183.006 222.625L223.027 262.75L223.026 275.998ZM223.027 249.375L196.345 222.625L209.685 222.625L223.027 236L223.027 249.375Z" fill="#A0E8D9"/>
                            <path d="M196.219 329.279L183.005 316.032L183.005 302.657L209.56 329.28L196.219 329.279ZM223.026 329.28L222.901 329.28L183.005 289.281L183.006 275.906L223.027 316.031L223.026 329.28ZM223.027 302.657L196.345 275.906L209.685 275.906L223.027 289.282L223.027 302.657Z" fill="#A0E8D9"/>
                            <path d="M196.219 382.561L183.005 369.313L183.005 355.938L209.56 382.561L196.219 382.561ZM223.026 382.561L222.901 382.561L183.005 342.563L183.006 329.188L223.027 369.313L223.026 382.561ZM223.027 355.938L196.345 329.188L209.685 329.188L223.027 342.563L223.027 355.938Z" fill="#A0E8D9"/>
                            <path d="M196.219 435.842L183.005 422.595L183.005 409.22L209.56 435.843L196.219 435.842ZM223.026 435.843L222.901 435.843L183.005 395.844L183.006 382.469L223.027 422.594L223.026 435.843ZM223.027 409.22L196.345 382.469L209.685 382.469L223.027 395.845L223.027 409.22Z" fill="#A0E8D9"/>
                            <text x="203" y="456" fontSize="14" fill="black" fontWeight="bold" textAnchor="middle" style={{ pointerEvents: 'none' }}>Diaphragm</text>
                        </g>
                    </HoverCard.Target>
                    <HoverCard.Dropdown bg="#A0E8D9" c="black" style={{ pointerEvents: 'none' }}>
                        <Text size="sm"><b>Porous Diaphragm & Electrolyte</b><br/>A porous separator submerged in an alkaline liquid electrolyte (usually 20-30% KOH or NaOH). It keeps H₂ and O₂ gases separated while allowing Hydroxide ions (OH⁻) to pass through.</Text>
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
                            <Text size="sm"><b>Cathode (Nickel-based)</b><br/>Water (H₂O) and electrons (e⁻) from the external circuit react here to form pure Hydrogen gas (H₂) and Hydroxide ions (OH⁻). Water enters the system from this side.</Text>
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
                            <Text size="sm"><b>Anode (Nickel-based / Steel)</b><br/>Hydroxide ions (OH⁻) arriving from the electrolyte are oxidized here. They release Oxygen gas (O₂), water, and electrons (e⁻) that flow into the external circuit.</Text>
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