import { Title, Card, Text, Select, Divider } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

import ValueInput from '../ValueInput';
import SliderInput from '../SliderInput';
import LabelWithTooltip from '../LabelWithTooltip';

import gasData from '../../data/recycling_gases.json';
import { ELEC_PRICE_UNITS, H2_VOLUME_POWER_UNITS, MAINTENANCE_UNITS, H2_VOLUME_PRICE_UNITS } from './calculatorConstants';
import React from 'react';

/**
 * Sub-component isolating the input form for the recycling calculator.
 * Passing down the state and setters keeps the main component cleaner.
 * * @param {Object} props
 * @param {string|null} props.gasType - The selected mixed gas matrix.
 * @param {Function} props.setGasType - Setter for the gas type.
 * @param {number} props.annualMixedGas - The total volume of exhaust gas produced per year.
 * @param {Function} props.setAnnualMixedGas - Setter for the annual mixed gas volume.
 * @param {number} props.h2Concentration - The percentage of pure hydrogen inside the exhaust gas.
 * @param {Function} props.setH2Concentration - Setter for the H2 concentration.
 * @param {number} props.h2Price - Current baseline cost of hydrogen per kg.
 * @param {Function} props.setH2Price - Setter for the baseline H2 price.
 * @param {number} props.systemPrice - Estimated CAPEX for the recycling plant.
 * @param {Function} props.setSystemPrice - Setter for the recycling system CAPEX.
 */
export default function RecyclingInputs ({
    gasType,
    setGasType,
    annualMixedGas,
    setAnnualMixedGas,
    h2Concentration,
    setH2Concentration,
    h2Price,
    setH2Price,
    systemPrice,
    setSystemPrice,
    annualOpexRate,
    setAnnualOpexRate,
    energyConsumption,
    setEnergyConsumption,
    electricityPrice,
    setElectricityPrice
}){
    const { t } = useTranslation("recycling");

    const gasOptions = useMemo(() => {
        return gasData.map(gas => ({
            value: gas.value,       
            label: t(gas.value)     
        }));
    }, [t]);

    return(
        <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Title order={3} mb="md">
                {t("recyclingForm.exhaustGasParametersTitle")}
            </Title>
            
            <Select
                label={
                    <LabelWithTooltip
                        label={t("recyclingForm.mixedGasType.label")}
                        tooltip={t("recyclingForm.mixedGasType.tooltip")}
                    />
                }
                placeholder={t("recyclingForm.mixedGasType.placeholder")}
                id="mixed_gas_type"
                data={gasOptions}
                value={gasType}
                onChange={setGasType}
                mb="md"
            />

            <ValueInput
                label={
                    <LabelWithTooltip
                        label={t("recyclingForm.annualMixedGasProduced.label")}
                        tooltip={t("recyclingForm.annualMixedGasProduced.tooltip")}
                    />
                }
                id="annual_mixed_gas"
                value={annualMixedGas}
                onValueChange={setAnnualMixedGas}
                units="units.normalized_m3_per_year"
                currentUnit="units.normalized_m3_per_year"
                namespace="recycling"
            />

            <SliderInput
                label={
                    <LabelWithTooltip
                        label={t("recyclingForm.h2Concentration.label")}
                        tooltip={t("recyclingForm.h2Concentration.tooltip")}
                    />
                }
                id="h2_concentration"
                value={h2Concentration}
                onValueChange={setH2Concentration}
                units="%"
                min={5}
                max={95}
            />
            
            <Divider my="md" />
            
            <Title order={4} mb="sm" c="dimmed">
                {t("recyclingForm.financialsTitle")}
            </Title>

            <ValueInput
                label={
                    <LabelWithTooltip
                        label={t("recyclingForm.currentH2PurchasePrice.label")}
                        tooltip={t("recyclingForm.currentH2PurchasePrice.tooltip")}
                    />
                }
                id="current_h2_price"
                units={H2_VOLUME_PRICE_UNITS}
                currentUnit={h2Price.unit}
                value={h2Price.value}
                onValueChange={val => setH2Price({...h2Price, value: val})}
                onUnitChange={u => setH2Price({...h2Price, unit: u})}
                namespace="recycling"
            />

            <ValueInput
                label={
                    <LabelWithTooltip
                        label={t("recyclingForm.recyclingSystemPrice.label")}
                        tooltip={t("recyclingForm.recyclingSystemPrice.tooltip")}
                    />
                }
                id="system_price"
                value={systemPrice}
                onValueChange={setSystemPrice}
                units="units.eur"
                currentUnit="units.eur"
                namespace="recycling"
            />

            <ValueInput
                label={
                    <LabelWithTooltip
                        label={t("recyclingForm.maintenanceCosts.label")}
                        tooltip={t("recyclingForm.maintenanceCosts.tooltip")}
                    />
                }
                id="maintenance_costs"
                units={MAINTENANCE_UNITS}
                currentUnit={annualOpexRate.unit}
                value={annualOpexRate.value}
                namespace="recycling"
                onValueChange={val => setAnnualOpexRate({ ...annualOpexRate, value: val })}
                onUnitChange={u => setAnnualOpexRate({ ...annualOpexRate, unit: u })}
            />

            <ValueInput
                label={
                    <LabelWithTooltip
                        label={t("recyclingForm.energyConsumption.label")}
                        tooltip={t("recyclingForm.energyConsumption.tooltip")}
                    />
                }
                id="energy_consumption"
                units={H2_VOLUME_POWER_UNITS}
                currentUnit={energyConsumption.unit}
                value={energyConsumption.value}
                namespace="recycling"
                onValueChange={val => setEnergyConsumption({ ...energyConsumption, value: val })}
                onUnitChange={u => setEnergyConsumption({ ...energyConsumption, unit: u })}
            />

            <ValueInput
                label={
                    <LabelWithTooltip
                        label={t("recyclingForm.electricityPrice.label")}
                        tooltip={t("recyclingForm.electricityPrice.tooltip")}
                    />
                }
                id="electricity_price"
                units={ELEC_PRICE_UNITS}
                currentUnit={electricityPrice.unit}
                value={electricityPrice.value}
                namespace="recycling"
                onValueChange={val => setElectricityPrice({ ...electricityPrice, value: val })}
                onUnitChange={u => setElectricityPrice({ ...electricityPrice, unit: u })}
            />
        </Card>
    )
}