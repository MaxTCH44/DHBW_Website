import { Card, Text } from '@mantine/core';

import ValueInput from '../ValueInput';
import LabelWithTooltip from '../LabelWithTooltip';
import DetailSection from '../DetailSection';

import { ELEC_PRICE_UNITS, WATER_VOLUME_PRICE_UNITS, H2_VOLUME_PRICE_UNITS } from './calculatorConstants';



export default function ResourcesCosts ({
    electricityPrice,
    setElectricityPrice,
    waterPrice,
    setWaterPrice,
    currentHydrogenPrice,
    setCurrentHydrogenPrice,
    greyHydrogenPrice,
    setGreyHydrogenPrice,
    carbonTax,
    setCarbonTax,
    openedSections,
    toggleSection,
    isAdvancedMode
}){
    return(
        <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Text fw={700} size="xl" mb="md" pb="xs" style={{ borderBottom: '2px solid var(--mantine-color-gray-2)' }}>
                Resources Costs
            </Text>
            <ValueInput
                id="electricity_price"
                label={<LabelWithTooltip label="Electricity price" tooltip="The average grid electricity price. This is the primary cost driver for green hydrogen production." />}
                units={ELEC_PRICE_UNITS}
                currentUnit={electricityPrice.unit}
                value={electricityPrice.value}
                onValueChange={val => setElectricityPrice({ ...electricityPrice, value: val })}
                onUnitChange={u => setElectricityPrice({ ...electricityPrice, unit: u })}
            />
            {isAdvancedMode && <ValueInput
                label={<LabelWithTooltip label="Water price" tooltip="Cost of purified water supply for the electrolysis process." />}
                id="water_price"
                units={WATER_VOLUME_PRICE_UNITS}
                currentUnit={waterPrice.unit}
                value={waterPrice.value}
                onValueChange={val => setWaterPrice({ ...waterPrice, value: val })}
                onUnitChange={u => setWaterPrice({ ...waterPrice, unit: u })}
            />}
            <ValueInput
                label={<LabelWithTooltip label="Current H₂ price" tooltip="The price you currently pay for delivered hydrogen. This serves as a baseline to calculate your potential savings with on-site production." />}
                id="current_h2_price"
                units={H2_VOLUME_PRICE_UNITS}
                currentUnit={currentHydrogenPrice.unit}
                value={currentHydrogenPrice.value}
                onValueChange={val => setCurrentHydrogenPrice({ ...currentHydrogenPrice, value: val })}
                onUnitChange={u => setCurrentHydrogenPrice({ ...currentHydrogenPrice, unit: u })}
            />
            {isAdvancedMode && (<><ValueInput
                label={<LabelWithTooltip label="Grey H₂ price" tooltip="The current market price of grey hydrogen (produced from natural gas). Used as a baseline to calculate your savings." />}
                id="grey_h2_price"
                units={H2_VOLUME_PRICE_UNITS}
                currentUnit={greyHydrogenPrice.unit}
                value={greyHydrogenPrice.value}
                onValueChange={val => setGreyHydrogenPrice({ ...greyHydrogenPrice, value: val })}
                onUnitChange={u => setGreyHydrogenPrice({ ...greyHydrogenPrice, unit: u })}
            />
            <DetailSection openedSections={openedSections.greyH2} toggleSection={() => toggleSection('greyH2')}>
                <ValueInput
                    label={<LabelWithTooltip label="Carbon Tax" tooltip="The price applied per ton of CO2 emissions. A higher tax increases the cost of grey hydrogen, making green hydrogen more competitive." />}
                    id="carbon_tax"
                    units="€/t CO₂"
                    currentUnit="€/t CO₂"
                    value={carbonTax}
                    onValueChange={val => setCarbonTax(val)}
                />
            </DetailSection></>)}
        </Card>
    )
}