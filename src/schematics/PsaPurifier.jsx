import { Box, HoverCard, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import './PsaPurifier.css';

export default function PsaPurifier() {
    const isMobile = useMediaQuery('(max-width: 768px)');

    const handleSvgClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    return (
        <Box w={{ base: '100%', sm: '80%', md: '60%', lg: '50%' }} mx="auto" ta="center" p="xl" style={{ overflow: 'hidden' }}>
            <svg width="100%" viewBox="0 0 396 475" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', margin: 'auto' }}>
                <rect width="396" height="475" fill="white"/>
                
                <HoverCard position={isMobile ? "bottom" : "top"} withArrow shadow="md" width={isMobile ? "90vw" : 320} openDelay={50} closeDelay={100} withinPortal={true}>
                    <HoverCard.Target>
                        <g className="interactive-element" onClick={handleSvgClick} style={{ outline: 'none' }}>
                            <g className="tank-group-left">
                                <rect x="112" y="155" width="73" height="145" fill="#B5E2ED" stroke="#5B5959" strokeWidth="4"/>
                                <g className="pipe-pair-top-left">
                                    <rect x="140" y="113" width="17" height="40" fill="#5B5959"/>
                                    <rect x="143" y="116" width="11" height="41" fill="#F5F5F5"/>
                                </g>
                                <g className="pipe-pair-bottom-left">
                                    <rect x="140" y="302" width="17" height="40" fill="#5B5959"/>
                                    <rect x="143" y="298" width="11" height="41" fill="#F5F5F5"/>
                                </g>
                                <g className="absorbents">
                                    <rect x="125" y="180" width="14" height="14" fill="black"/>
                                    <rect x="155" y="250" width="14" height="14" fill="black"/>
                                </g>
                                <g className="gas-particles">
                                    <circle cx="130" cy="220" r="8" fill="red"/>
                                    <circle cx="165" cy="190" r="8" fill="red"/>
                                    <circle cx="150" cy="215" r="4" fill="white"/>
                                    <circle cx="135" cy="265" r="4" fill="white"/>
                                </g>
                            </g>

                            <g className="tank-group-right">
                                <rect x="-2" y="2" width="73" height="145" transform="matrix(-1 0 0 1 282 153)" fill="#B5E2ED" stroke="#5B5959" strokeWidth="4"/>
                                <g className="pipe-pair-top-right">
                                    <rect width="17" height="40" transform="matrix(-1 0 0 1 256 113)" fill="#5B5959"/>
                                    <rect width="11" height="41" transform="matrix(-1 0 0 1 253 116)" fill="#F5F5F5"/>
                                </g>
                                <g className="pipe-pair-bottom-right">
                                    <rect width="17" height="40" transform="matrix(-1 0 0 1 256 302)" fill="#5B5959"/>
                                    <rect width="11" height="41" transform="matrix(-1 0 0 1 253 298)" fill="#F5F5F5"/>
                                </g>
                                <g className="absorbents">
                                    <rect x="225" y="180" width="14" height="14" fill="black"/>
                                    <rect x="255" y="250" width="14" height="14" fill="black"/>
                                </g>
                                <g className="gas-particles">
                                    <circle cx="230" cy="220" r="8" fill="red"/>
                                    <circle cx="265" cy="190" r="8" fill="red"/>
                                    <circle cx="250" cy="215" r="4" fill="white"/>
                                    <circle cx="235" cy="265" r="4" fill="white"/>
                                </g>
                            </g>
                        </g>
                    </HoverCard.Target>
                    <HoverCard.Dropdown bg="blue.5" c="white" style={{ pointerEvents: 'none' }}>
                        <Text size="sm"><b>Adsorbent Beds (Pressure Swing)</b><br/>These beds contain active materials that trap impurities under high pressure. They alternate: while one filters to produce H₂, the other depressurizes to clean itself.</Text>
                    </HoverCard.Dropdown>
                </HoverCard>

                <HoverCard position={isMobile ? "bottom" : "left"} withArrow shadow="md" width={isMobile ? "90vw" : 250} openDelay={50} closeDelay={100} withinPortal={true}>
                    <HoverCard.Target>
                        <g className="interactive-element" onClick={handleSvgClick} style={{ outline: 'none' }}>
                            <path d="M12 268L52.6116 229.895L52.6116 306.105L12 268Z" fill="#FE7F25"/>
                            <rect x="51.3223" y="245.741" width="38.6777" height="44.5176" fill="#FE7F25"/>
                            <text x="58" y="225" fontSize="14" fill="black" fontWeight="bold" textAnchor="middle" style={{ pointerEvents: 'none' }}>Impurities</text>
                            
                            <path d="M384 268L343.388 229.895V306.105L384 268Z" fill="#FE7F25"/>
                            <rect width="38.6777" height="44.5176" transform="matrix(-1 0 0 1 344.678 245.741)" fill="#FE7F25"/>
                            <text x="340" y="225" fontSize="14" fill="black" fontWeight="bold" textAnchor="middle" style={{ pointerEvents: 'none' }}>Impurities</text>

                            <g className="pipe-pair-side-left">
                                <rect x="110" y="259" width="17" height="40" transform="rotate(90 110 259)" fill="#5B5959"/>
                                <rect x="114" y="262" width="11" height="44" transform="rotate(90 114 262)" fill="#F5F5F5"/>
                            </g>
                            <g className="pipe-pair-side-right">
                                <rect width="17" height="40" transform="matrix(0 1 1 0 286 259)" fill="#5B5959"/>
                                <rect width="11" height="44" transform="matrix(0 1 1 0 282 262)" fill="#F5F5F5"/>
                            </g>
                        </g>
                    </HoverCard.Target>
                    <HoverCard.Dropdown bg="orange.5" c="white" style={{ pointerEvents: 'none' }}>
                        <Text size="sm"><b>Exhaust (Impurities OUT)</b><br/>When a bed depressurizes to regenerate, the trapped impurities are released and vented out through this exhaust pipe.</Text>
                    </HoverCard.Dropdown>
                </HoverCard>

                <HoverCard position={isMobile ? "bottom" : "bottom"} withArrow shadow="md" width={isMobile ? "90vw" : 250} openDelay={50} closeDelay={100} withinPortal={true}>
                    <HoverCard.Target>
                        <g className="interactive-element" onClick={handleSvgClick} style={{ outline: 'none' }}>
                            <path d="M198 382L236.105 422.612H159.895L198 382Z" fill="#afb1be"/>
                            <rect x="220.259" y="421.322" width="38.6777" height="44.5176" transform="rotate(90 220.259 421.322)" fill="#afb1be"/>
                            <text x="198" y="420" fontSize="14" fill="black" fontWeight="bold" textAnchor="middle" style={{ pointerEvents: 'none' }}> Mixed </text>  
                            <text x="198" y="440" fontSize="14" fill="black" fontWeight="bold" textAnchor="middle" style={{ pointerEvents: 'none' }}> gas </text>                          

                            <g className="pipe-pair-bottom-center">
                                <rect width="17" height="40" transform="matrix(-1 0 0 1 206 343)" fill="#5B5959"/>
                                <rect width="11" height="40" transform="matrix(-1 0 0 1 203 343)" fill="#F5F5F5"/>
                                <rect width="17" height="86" transform="matrix(0 -1 -1 0 240 342)" fill="#5B5959"/>
                                <rect width="11" height="89" transform="matrix(0 -1 -1 0 243 339)" fill="#F5F5F5"/>
                                <rect width="17" height="40" transform="matrix(-1 0 0 1 206 342)" fill="#5B5959"/>
                                <rect width="11" height="43" transform="matrix(-1 0 0 1 203 339)" fill="#F5F5F5"/>
                            </g>
                        </g>
                    </HoverCard.Target>
                    <HoverCard.Dropdown bg="gray.6" c="white" style={{ pointerEvents: 'none' }}>
                        <Text size="sm"><b>Waste Gas Stream (Mixed IN)</b><br/>The unconsumed gas mixture containing hydrogen, oxygen, moisture, and hydrocarbons enters the system under high pressure.</Text>
                    </HoverCard.Dropdown>
                </HoverCard>

                <HoverCard position={isMobile ? "bottom" : "right"} withArrow shadow="md" width={isMobile ? "90vw" : 250} openDelay={50} closeDelay={100} withinPortal={true}>
                    <HoverCard.Target>
                        <g className="interactive-element" onClick={handleSvgClick} style={{ outline: 'none' }}>
                            <path d="M197 15L235.105 55.6116L158.895 55.6116L197 15Z" fill="#4DE32F"/>
                            <rect x="219.259" y="54.3223" width="38.6777" height="44.5176" transform="rotate(90 219.259 54.3223)" fill="#4DE32F"/>
                            <text x="198" y="60" fontSize="24" fill="black" fontWeight="bold" textAnchor="middle" style={{ pointerEvents: 'none' }}> H₂ </text>

                            <g className="pipe-pair-top-center">
                                <rect x="206" y="112" width="17" height="40" transform="rotate(-180 206 112)" fill="#5B5959"/>
                                <rect x="203" y="112" width="11" height="40" transform="rotate(-180 203 112)" fill="#F5F5F5"/>
                                <rect x="240" y="113" width="17" height="86" transform="rotate(90 240 113)" fill="#5B5959"/>
                                <rect x="243" y="116" width="11" height="89" transform="rotate(90 243 116)" fill="#F5F5F5"/>
                                <rect x="206" y="113" width="17" height="40" transform="rotate(-180 206 113)" fill="#5B5959"/>
                                <rect x="203" y="116" width="11" height="43" transform="rotate(-180 203 116)" fill="#F5F5F5"/>
                            </g>
                        </g>
                    </HoverCard.Target>
                    <HoverCard.Dropdown bg="#4DE32F" c="dark.9" style={{ pointerEvents: 'none' }}>
                        <Text size="sm"><b>Pure Hydrogen Output</b><br/>The filtered gas is restored with guaranteed 99.999% purity. It is now ready for direct reinjection into the production line, saving massive amounts of energy and resources.</Text>
                    </HoverCard.Dropdown>
                </HoverCard>

            </svg>
        </Box>
    );
}