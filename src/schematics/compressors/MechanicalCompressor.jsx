import { Box, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import './MechanicalCompressor.css';
import { useTranslation } from 'react-i18next';

import ResponsiveHoverCard from '../../components/ResponsiveHoverCard';

export default function MechanicalCompressor() {
    const isMobile = useMediaQuery('(max-width: 768px)');

    const { t, i18n } = useTranslation("equipmentOverview");

    return (
        <Box 
            w={{ base: '100%', sm: '80%', md: '60%', lg: '50%' }} 
            mx="auto" 
            ta="center" 
            p="xl" 
            style={{ overflow: 'hidden' }}
        >
            <svg width="100%" viewBox="0 0 484 500" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', margin: 'auto' }}>
                
                <rect width="484" height="500" fill="white"/>
                <ResponsiveHoverCard 
                    position={isMobile ? "bottom" : "top"} 
                    withArrow 
                    shadow="md" 
                    width={isMobile ? "90vw" : 300} 
                    openDelay={50} 
                    closeDelay={100} 
                    withinPortal={true} 
                    zIndex={50}
                    dropdownProps={{
                        bg: "gray.7",
                        c: "white",
                        style: { pointerEvents: 'none' }
                    }}
                    target={
                        <g className="interactive-element" style={{ outline: 'none', cursor: 'pointer' }}>
                            <rect x="144.612" y="21" width="194.776" height="287.183" fill="#484040"/>
                            <rect x="158.045" y="33.9362" width="167.91" height="274.247" fill="#D9D9D9"/>
                            <g className="piston-assembly">
                                <rect x="158.045" y="102.498" width="167.91" height="95.7277" fill="#818080"/> 
                                <rect x="231.925" y="198.226" width="20.1493" height="126.774" fill="#5B5959"/> 
                            </g>
                        </g>
                    }
                    dropdown={
                        <Text size="sm"><b>{t("compressors.mechanical.schematic.chamber.title")}</b><br/>{t("compressors.mechanical.schematic.chamber.explanation")}</Text>
                    }
                />

                <ResponsiveHoverCard 
                    position={isMobile ? "bottom" : "left"} 
                    withArrow 
                    shadow="md" 
                    width={isMobile ? "90vw" : 250} 
                    openDelay={50} 
                    closeDelay={100} 
                    withinPortal={true} 
                    zIndex={50}
                    dropdownProps={{
                        bg: "blue.5",
                        c: "white",
                        style: { pointerEvents: 'none' }
                    }}
                    target={
                        <g className="interactive-element" style={{ outline: 'none', cursor: 'pointer' }}>
                            <rect x="17" y="33.9362" width="127.612" height="45.2766" fill="#484040"/>
                            <rect x="17" y="39.1106" width="141.045" height="34.9277" fill="#B5E2ED"/>
                            <g className="valve-inlet-container">
                                <rect className="valve-rect valve-inlet" x="147.299" y="33.9362" width="8.0597" height="45.2766" fill="#484040" rx="1"/>
                            </g>
                            <text x="81" y="60" fontSize={i18n.language === 'de' ? 11 : 12} fill="black" fontWeight="bold" textAnchor="middle" style={{ pointerEvents: 'none' }}>{t("compressors.mechanical.schematic.inlet.title")}</text>
                        </g>
                    }
                    dropdown={
                        <Text size="sm"><b>{t("compressors.mechanical.schematic.inlet.subtitle")}</b><br/>{t("compressors.mechanical.schematic.inlet.explanation")}</Text>
                    }
                />

                <ResponsiveHoverCard 
                    position={isMobile ? "bottom" : "right"} 
                    withArrow 
                    shadow="md" 
                    width={isMobile ? "90vw" : 250} 
                    openDelay={50} 
                    closeDelay={100} 
                    withinPortal={true} 
                    zIndex={50}
                    dropdownProps={{
                        bg: "red.5",
                        c: "white",
                        style: { pointerEvents: 'none' }
                    }}
                    target={
                        <g className="interactive-element" style={{ outline: 'none', cursor: 'pointer' }}>
                            <rect width="127.612" height="45.2766" transform="matrix(-1 0 0 1 467 33.9362)" fill="#484040"/>
                            <rect width="141.045" height="34.9277" transform="matrix(-1 0 0 1 467 39.1106)" fill="#F5A4AF"/>
                            <g className="valve-outlet-container">
                                <rect className="valve-rect valve-outlet" width="8.0597" height="45.2766" transform="matrix(-1 0 0 1 336.701 33.9362)" fill="#484040" rx="1"/>
                            </g>
                            <text x="403" y="60" fontSize={12} fill="black" fontWeight="bold" textAnchor="middle" style={{ pointerEvents: 'none' }}>{t("compressors.mechanical.schematic.outlet.title")}</text>
                        </g>
                    }
                    dropdown={
                        <Text size="sm"><b>{t("compressors.mechanical.schematic.outlet.subtitle")}</b><br/>{t("compressors.mechanical.schematic.outlet.explanation")}</Text>
                    }
                />
                            <g className="molecules" style={{ pointerEvents: 'none' }}>
                                <circle className="molecule molecule-1" cx="80" cy="56" r="12" fill="#1971C2"/>
                                <circle className="molecule molecule-2" cx="80" cy="56" r="12" fill="#1971C2"/>
                                <circle className="molecule molecule-3" cx="80" cy="56" r="12" fill="#1971C2"/>
                                <circle className="molecule molecule-4" cx="80" cy="56" r="12" fill="#1971C2"/>
                                <circle className="molecule molecule-5" cx="80" cy="56" r="12" fill="#1971C2"/>
                            </g>

            </svg>
        </Box>
    );
}