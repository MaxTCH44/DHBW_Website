import { Card, Text } from '@mantine/core';

import ValueInput from '../ValueInput';
import LabelWithTooltip from '../LabelWithTooltip';
import DetailSection from '../DetailSection';

import { ELEC_PRICE_UNITS, WATER_VOLUME_PRICE_UNITS, H2_VOLUME_PRICE_UNITS } from './calculatorConstants';

/**
 * Manages the inputs for utility prices (electricity, water) and baseline economic 
 * indicators (current H2 price, grey H2 price, carbon tax). These values are the core 
 * drivers for calculating the operational expenditures (OPEX) and potential project savings.
 * * @param {Object} props 
 * @param {Object} props.electricityPrice - The grid electricity price state {value, unit}.
 * @param {Function} props.setElectricityPrice - Setter for the electricity price.
 * @param {Object} props.waterPrice - The industrial water price state {value, unit}.
 * @param {Function} props.setWaterPrice - Setter for the water price.
 * @param {Object} props.currentHydrogenPrice - The baseline price the user currently pays for H2 {value, unit}.
 * @param {Function} props.setCurrentHydrogenPrice - Setter for the current H2 price.
 * @param {Object} props.greyHydrogenPrice - The market price of fossil-based grey hydrogen {value, unit}.
 * @param {Function} props.setGreyHydrogenPrice - Setter for the grey hydrogen price.
 * @param {number} props.carbonTax - The projected tax per ton of CO2 emissions.
 * @param {Function} props.setCarbonTax - Setter for the carbon tax rate.
 * @param {Object} props.openedSections - Tracks which detail accordions are currently expanded.
 * @param {Function} props.toggleSection - Handler to toggle accordion visibility.
 * @param {boolean} props.isAdvancedMode - Toggles between simple OPEX inputs and full economic parametrization.
 */
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

            {/* Electricity is universally the largest cost driver for green hydrogen, so it remains visible in both modes */}
            <ValueInput
                id="electricity_price"
                label={<LabelWithTooltip label="Electricity price" tooltip="The average grid electricity price. This is the primary cost driver for green hydrogen production." />}
                units={ELEC_PRICE_UNITS}
                currentUnit={electricityPrice.unit}
                value={electricityPrice.value}
                onValueChange={val => setElectricityPrice({ ...electricityPrice, value: val })}
                onUnitChange={u => setElectricityPrice({ ...electricityPrice, unit: u })}
            />

            {/* Water cost is typically negligible compared to electricity, so we hide it in simple mode to reduce cognitive load */}
            {isAdvancedMode && <ValueInput
                label={<LabelWithTooltip label="Water price" tooltip="Cost of purified water supply for the electrolysis process." />}
                id="water_price"
                units={WATER_VOLUME_PRICE_UNITS}
                currentUnit={waterPrice.unit}
                value={waterPrice.value}
                onValueChange={val => setWaterPrice({ ...waterPrice, value: val })}
                onUnitChange={u => setWaterPrice({ ...waterPrice, unit: u })}
            />}

            {/* Used to calculate the strict Return On Investment (ROI) vs what the client is paying today */}
            <ValueInput
                label={<LabelWithTooltip label="Current H₂ price" tooltip="The price you currently pay for delivered hydrogen. This serves as a baseline to calculate your potential savings with on-site production." />}
                id="current_h2_price"
                units={H2_VOLUME_PRICE_UNITS}
                currentUnit={currentHydrogenPrice.unit}
                value={currentHydrogenPrice.value}
                onValueChange={val => setCurrentHydrogenPrice({ ...currentHydrogenPrice, value: val })}
                onUnitChange={u => setCurrentHydrogenPrice({ ...currentHydrogenPrice, unit: u })}
            />

            {/* --- MARKET PROJECTIONS --- */}
            {/* These fields project the "Green Premium", showing the price gap against highly polluting natural-gas-derived hydrogen */}
            {isAdvancedMode && (
                <>
                    <ValueInput
                        label={<LabelWithTooltip label="Grey H₂ price" tooltip="The current market price of grey hydrogen (produced from natural gas). Used as a baseline to calculate your savings." />}
                        id="grey_h2_price"
                        units={H2_VOLUME_PRICE_UNITS}
                        currentUnit={greyHydrogenPrice.unit}
                        value={greyHydrogenPrice.value}
                        onValueChange={val => setGreyHydrogenPrice({ ...greyHydrogenPrice, value: val })}
                        onUnitChange={u => setGreyHydrogenPrice({ ...greyHydrogenPrice, unit: u })}
                    />

                    {/* A high carbon tax acts as an artificial price increase on Grey H2, accelerating the financial competitiveness of Green H2 */}
                    <DetailSection openedSections={openedSections.greyH2} toggleSection={() => toggleSection('greyH2')}>
                        <ValueInput
                            label={<LabelWithTooltip label="Carbon Tax" tooltip="The price applied per ton of CO2 emissions. A higher tax increases the cost of grey hydrogen, making green hydrogen more competitive." />}
                            id="carbon_tax"
                            units="€/t CO₂"
                            currentUnit="€/t CO₂"
                            value={carbonTax}
                            onValueChange={val => setCarbonTax(val)}
                        />
                    </DetailSection>
                </>
            )}
        </Card>
    )
}