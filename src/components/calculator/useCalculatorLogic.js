import { useMemo } from 'react';

import { EMISSIONS_PER_KG_OF_H2 } from './calculatorConstants';



export function useCalculatorLogic({
    annualProd,
    systemSize,
    selectedElectrolyzer,
    electrolyzerSettings,
    isCompressorNeeded,
    massToCompress,
    selectedCompressor,
    compressorSettings,
    projectLifetime,
    inflationRate,
    electricityPrice,
    carbonTax,
    greyHydrogenPrice,
    waterPrice,
    currentHydrogenPrice,
    operatingTime
}) {
    
    return useMemo(() => {
        
        // =========================================================
        // 0. CONSTANTS & OPERATING TIME
        // =========================================================
        const annualOperatingHours = operatingTime.value * operatingTime.unit.factor;
        const projectLifetimeHours = projectLifetime * annualOperatingHours;
        const targetPowerKW = systemSize.value * systemSize.unit.factor; 

        // =========================================================
        // 1. ELECTROLYZER: SIZING AND CAPEX
        // =========================================================
        const elecStackPower = selectedElectrolyzer.stack_power || 1;
        const totalElecStacksNeeded = Math.ceil((targetPowerKW / elecStackPower).toFixed(3));
        
        const maxStacksPerElec = selectedElectrolyzer.max_stacks || 1;
        const electrolyzerQuantity = Math.ceil(totalElecStacksNeeded / maxStacksPerElec);
        
        // Calculation of owned units
        const elecExtraStacksNeeded = Math.max(0, totalElecStacksNeeded - electrolyzerQuantity);
        const newElecFrames = Math.max(0, electrolyzerQuantity - (electrolyzerSettings.owned || 0));
        
        const actualOwnedElecStacks = Math.max(electrolyzerSettings.ownedStacks || 0, electrolyzerSettings.owned || 0);
        const ownedExtraElecStacks = Math.max(0, actualOwnedElecStacks - (electrolyzerSettings.owned || 0));
        const newExtraElecStacks = Math.max(-electrolyzerQuantity, elecExtraStacksNeeded - ownedExtraElecStacks); 

        const electrolyzerCapex = (newElecFrames * (selectedElectrolyzer.price || 0)) + 
                                  (newExtraElecStacks * (selectedElectrolyzer.stack_price || 0));

        // --- ELECTROLYZER LIFECYCLE (STACK REPLACEMENT) ---
        const elecStackLifetimeHours = selectedElectrolyzer.stack_lifetime_hours || 80000; 
        const elecStackReplacements = Math.floor(projectLifetimeHours / elecStackLifetimeHours);
        const totalElecReplacementCost = elecStackReplacements * totalElecStacksNeeded * (selectedElectrolyzer.stack_price || 0);
        const annualElecReplacementCost = totalElecReplacementCost / projectLifetime;


        // =========================================================
        // 2. COMPRESSOR: SIZING AND CAPEX
        // =========================================================
        let compressorQuantity = 0;
        let compressorCapex = 0;
        let totalCompStacksNeeded = 0;
        let extraCompStacksNeeded = 0;
        let annualCompReplacementCost = 0;

        if (isCompressorNeeded && massToCompress > 0) {
            const compOpHoursPerYear = compressorSettings.operatingTime.value * compressorSettings.operatingTime.unit.factor;
            
            if (selectedCompressor.type === 'Mechanical') {
                const annualCapPerComp = (selectedCompressor.unitary_flowrate_kg_per_day * compressorSettings.flow_unit.factor) * compOpHoursPerYear;
                compressorQuantity = annualCapPerComp > 0 ? Math.ceil(massToCompress / annualCapPerComp) : 0;
                
                const newComps = Math.max(0, compressorQuantity - (compressorSettings.owned || 0));
                compressorCapex = newComps * (selectedCompressor.price || 0);
            } 
            else if (selectedCompressor.type === 'Electrochemical') {
                const flowPerStackKgPerH = selectedCompressor.unitary_flowrate_kg_per_day * compressorSettings.flow_unit.factor * (selectedCompressor.cells_per_stack || 1);
                const annualCapPerStack = flowPerStackKgPerH * compOpHoursPerYear;
                
                totalCompStacksNeeded = annualCapPerStack > 0 ? Math.ceil(massToCompress / annualCapPerStack) : 0;
                const maxStacksPerComp = selectedCompressor.cells_per_stack > 0 ? Math.floor(selectedCompressor.max_cells / selectedCompressor.cells_per_stack) : 1;
                
                compressorQuantity = maxStacksPerComp > 0 ? Math.ceil(totalCompStacksNeeded / maxStacksPerComp) : 0;
                extraCompStacksNeeded = Math.max(0, totalCompStacksNeeded - compressorQuantity);
                
                // Calculation of owned units
                const newComps = Math.max(0, compressorQuantity - (compressorSettings.owned || 0));
                const actualOwnedCompStacks = Math.max(compressorSettings.ownedStacks || 0, compressorSettings.owned || 0);
                const ownedExtraCompStacks = Math.max(0, actualOwnedCompStacks - (compressorSettings.owned || 0));
                const newExtraCompStacks = Math.max(-compressorQuantity, extraCompStacksNeeded - ownedExtraCompStacks);
                
                compressorCapex = (newComps * (selectedCompressor.price || 0)) + 
                                  (newExtraCompStacks * (selectedCompressor.cell_stack_price || 0));

                // --- EHC LIFECYCLE (STACK REPLACEMENT) ---
                const compStackLifetimeHours = selectedCompressor.stack_lifetime_hours || 60000;
                const totalCompLifeHours = projectLifetime * compOpHoursPerYear;
                const compStackReplacements = Math.floor(totalCompLifeHours / compStackLifetimeHours);
                const totalCompReplacementCost = compStackReplacements * totalCompStacksNeeded * (selectedCompressor.cell_stack_price || 0);
                annualCompReplacementCost = totalCompReplacementCost / projectLifetime;
            }
        }


        // =========================================================
        // 3. HARDWARE DEPRECIATION (CAPEX)
        // =========================================================
        const capex = electrolyzerCapex + compressorCapex;
        const annualDepre = capex / projectLifetime;
        const capexPerKgShare = annualProd > 0 ? (annualDepre / annualProd) : 0; 


        // =========================================================
        // 4. ENERGY, WATER & MACRO-ECONOMICS
        // =========================================================
        const avgInflaFactor = inflationRate === 0 ? 1 : ((1 + inflationRate / 100) ** projectLifetime - 1) / ((inflationRate / 100) * projectLifetime);
        const smoothedElecPrice = (electricityPrice.value * electricityPrice.unit.factor) * avgInflaFactor;
        const gridElectricityRatio = systemSize.value > 0 ? Math.max(0, systemSize.value - (systemSize.selfProduced || 0)) / systemSize.value : 0;
        
        const carbonTaxPerKg = EMISSIONS_PER_KG_OF_H2 * (carbonTax / 1000);
        const baseGreyPrice = greyHydrogenPrice.value * greyHydrogenPrice.unit.factor;
        const greyPriceWithTax = baseGreyPrice + carbonTaxPerKg;
        const smoothedGreyPrice = greyPriceWithTax * avgInflaFactor;

        // Physical consumptions
        const annualAuxElec = (selectedElectrolyzer.total_auxiliary_consumption || 0) * annualOperatingHours;
        const elecPowerNeeded = annualProd * (selectedElectrolyzer.energy_consumption_kwh_per_kg * electrolyzerSettings.cons_unit.factor);
        const compPowerNeeded = isCompressorNeeded ? (massToCompress * (selectedCompressor.energy_consumption_kwh_per_kg * compressorSettings.cons_unit.factor)) : 0;
        
        const totalElecNeeded = elecPowerNeeded + annualAuxElec + compPowerNeeded;
        const totalWaterNeeded = (selectedElectrolyzer.water_consumption_l_per_h || 0) * annualOperatingHours * electrolyzerQuantity;


        // =========================================================
        // 5. OPERATIONAL COSTS & MAINTENANCE (OPEX)
        // =========================================================
        const elecShare = annualProd > 0 ? (totalElecNeeded * smoothedElecPrice * gridElectricityRatio) / annualProd : 0;
        const waterShare = annualProd > 0 ? (totalWaterNeeded * (waterPrice.value * waterPrice.unit.factor)) / annualProd : 0;
        
        // Routine Maintenance
        const annualElectrolyzerMaintenance = electrolyzerSettings.maint_unit.label === "€" 
            ? (selectedElectrolyzer.maintenance_percent_capex * electrolyzerQuantity)
            : (selectedElectrolyzer.price * electrolyzerQuantity) * (selectedElectrolyzer.maintenance_percent_capex / 100);

        const totalCompressorHardwareValue = (compressorQuantity * (selectedCompressor.price || 0)) + 
                                             (extraCompStacksNeeded * (selectedCompressor.cell_stack_price || 0));
        
        const annualCompressorMaintenance = isCompressorNeeded 
            ? (compressorSettings.maint_unit.label === "€" 
                ? (selectedCompressor.maintenance_percent_capex * compressorQuantity)
                : totalCompressorHardwareValue * (selectedCompressor.maintenance_percent_capex / 100))
            : 0;

        // routine maintenance + depreciation of stack replacements
        const totalAnnualMaintenance = annualElectrolyzerMaintenance + annualCompressorMaintenance + annualElecReplacementCost + annualCompReplacementCost;
        const maintenanceShare = annualProd > 0 ? (totalAnnualMaintenance / annualProd) : 0;


        // =========================================================
        // 6. FINANCIAL RESULTS (LCOH)
        // =========================================================
        const lcoh = capexPerKgShare + elecShare + waterShare + maintenanceShare;
        
        const costDifference = smoothedGreyPrice - lcoh; 
        const annualDifference = costDifference * annualProd;

        const currentPricePerKg = currentHydrogenPrice.value * currentHydrogenPrice.unit.factor;
        const currentCostDifference = currentPricePerKg - lcoh;
        const currentAnnualDifference = currentCostDifference * annualProd;
        
        const avoidedCO2 = (annualProd * EMISSIONS_PER_KG_OF_H2) / 1000;

        const costBreakdown = {
            capex: capexPerKgShare,
            electricity: elecShare,
            water: waterShare,
            maintenance: maintenanceShare
        };


        // =========================================================
        // 7. ALERTS & SECONDARY METRICS
        // =========================================================
        const showCellWarning = selectedCompressor?.type === 'Electrochemical' && 
                                selectedCompressor.cells_per_stack > 0 && 
                                (selectedCompressor.max_cells % selectedCompressor.cells_per_stack !== 0);

        const installedElectrolyzerPower = (totalElecStacksNeeded * elecStackPower).toFixed(2);
        const utilizationRate = installedElectrolyzerPower > 0 
            ? (targetPowerKW / installedElectrolyzerPower) * 100 
            : 0;

        const extraMetrics = {
            annualProd: annualProd, 
            annualElec: totalElecNeeded, 
            annualWater: totalWaterNeeded,
            installedCapacity: installedElectrolyzerPower,
            utilizationRate: utilizationRate 
        };

        const greyDetails = {
            base: baseGreyPrice,
            tax: carbonTaxPerKg,
            totalWithTax: greyPriceWithTax,
            smoothed: smoothedGreyPrice
        };

        return {
            electrolyzerQuantity,
            compressorQuantity,
            totalStacksNeeded: totalElecStacksNeeded,
            totalCompStacksNeeded,
            capex,
            showCellWarning,
            lcoh,
            costDifference,
            annualDifference,
            costBreakdown,
            extraMetrics,
            greyDetails,
            currentCostDifference, 
            currentAnnualDifference, 
            avoidedCO2
        };
    }, [
        annualProd,
        systemSize,
        selectedElectrolyzer,
        electrolyzerSettings,
        isCompressorNeeded,
        massToCompress,
        selectedCompressor,
        compressorSettings,
        projectLifetime,
        inflationRate,
        electricityPrice,
        carbonTax,
        greyHydrogenPrice,
        waterPrice,
        currentHydrogenPrice,
        operatingTime
    ]);
}