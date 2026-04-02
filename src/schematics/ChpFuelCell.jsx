import { useState, useEffect } from 'react';
import { Box, Stack, Text, HoverCard, Group, Badge } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import PemFuelCell from './PemFuelCell'; 

import './ChpFuelCell.css';

export default function ChpFuelCell() {
    const isMobile = useMediaQuery('(max-width: 768px)');
    const [isZoomed, setIsZoomed] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsZoomed((prev) => !prev);
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const windowRows = [98, 157, 216, 275];
    const windowsPerRow = [90, 145, 200, 255];

    return (
        <Box w={{ base: '100%', sm: '80%', md: '60%', lg: '40%' }} mx="auto" ta="center" p="xl" style={{ overflow: 'hidden' }}>
            <svg width="100%" viewBox="0 0 406 470" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ maxWidth: 450, margin: 'auto', display: 'block' }}>
                
                <defs>
                    <radialGradient id="heatGradientChp" cx="190" cy="369" r="120" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#FD6E6E" stopOpacity="0.85"/>
                        <stop offset="40%" stopColor="#FD6E6E" stopOpacity="0.4"/>
                        <stop offset="100%" stopColor="#FD6E6E" stopOpacity="0"/>
                    </radialGradient>
                </defs>

                <g className={`building-layer ${!isZoomed ? 'visible' : ''}`} transform="translate(13, 9.5)">
                    <rect width="380" height="451" fill="white"/>
                    <rect x="74" y="63" width="233" height="325" fill="#D9D9D9"/>
                    
                    {windowRows.map((y, rowIndex) => (
                        <g key={y}>
                            {windowsPerRow.map((x, colIndex) => {
                                const sequentialId = rowIndex * windowsPerRow.length + colIndex;
                                return (
                                    <rect 
                                        key={x} 
                                        x={x} y={y} 
                                        width="35" height="48" 
                                        fill="white" 
                                        className={`window-pane w${sequentialId}`}
                                    />
                                );
                            })}
                        </g>
                    ))}
                    <rect x="174" y="350" width="32" height="38" fill="#f0f0f0" stroke="#ccc"/>
                </g>


                <HoverCard width={320} shadow="md" disabled={isZoomed} openDelay={100}>
                    <HoverCard.Target>
                        <g 
                            className={`fuel-cell-layer ${!isZoomed ? 'miniaturized' : ''}`}
                            style={{ cursor: "pointer" }}
                        >
                            <PemFuelCell asGroup={true} />
                            {!isZoomed && <rect width="406" height="407" fill="transparent" style={{ pointerEvents: 'auto' }} />}
                        </g>
                    </HoverCard.Target>
                    <HoverCard.Dropdown bg="#f1f3f5">
                        <Stack gap="xs">
                            <Group gap="xs">
                                <Badge color="green" variant="filled">Combined Heat & Power (CHP)</Badge>
                            </Group>
                            <Text size="sm">
                                This Fuel Cell unit electrochemically converts green hydrogen into <b>electricity</b> and useful <b>heat</b>. By recovering the waste heat, the system achieves over <b>85% total efficiency</b> to warm and power the building.
                            </Text>
                        </Stack>
                    </HoverCard.Dropdown>
                </HoverCard>

                {!isZoomed && (
                    <g className="energy-outputs" transform="translate(13, 9.5)" style={{ pointerEvents: 'none' }}>
                        <circle 
                            cx="190" cy="369" r="100" 
                            fill="url(#heatGradientChp)" 
                            className="heat-ripple-gradient"
                        />
                        
                        <path 
                            d="M190 350 V90 H110" 
                            className="electric-path" 
                            stroke="#ffee00" 
                            strokeWidth="4" 
                            fill="none" 
                        />
                    </g>
                )}
            </svg>
        </Box>
    );
}