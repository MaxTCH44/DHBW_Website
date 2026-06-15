# Mathematical Models: Techno-Economic Simulator (LCOH)

This document details the exact scientific and financial equations implemented in the `useCalculatorLogic.js` hook of the GreenLab H2 Calculator.

---

## 1. Constants, Target Power, and Operating Time

All calculations are standardized to kilowatts (kW) and annual operating hours to align physical limits with financial metrics.

**Scientific Formulas:**

$$
T_{annual\_hours} = OpTime_{user} \times Factor_{unit}
$$

$$
T_{lifetime\_hours} = A_{project} \times T_{annual\_hours}
$$

$$
P_{target\_kW} = Size_{user} \times Factor_{unit}
$$

**Code Correspondence (`useCalculatorLogic.js`):**

```javascript
const annualOperatingHours = operatingTime.value * operatingTime.unit.factor;
const projectLifetimeHours = projectLifetime * annualOperatingHours;
const targetPowerKW = systemSize.value * systemSize.unit.factor; 
```

---

## 2. Electrolyzer Sizing and Initial CAPEX

The electrolyzer plant requires calculating the number of stacks and full cabinets/frames needed. It rigorously accounts for user-owned inventory to avoid charging CAPEX for existing assets.

### 2.1. Required Stacks and Frames

Because partial hardware cannot be purchased, requirements are rounded up ($\lceil x \rceil$).

**Scientific Formulas:**

$$
N_{stacks\_req} = \left\lceil \frac{P_{target\_kW}}{P_{stack\_power}} \right\rceil
$$

$$
N_{frames\_req} = \left\lceil \frac{N_{stacks\_req}}{Max_{stacks\_per\_frame}} \right\rceil
$$

**Code Correspondence:**

```javascript
const elecStackPower = selectedElectrolyzer.stack_power || 1;
const totalElecStacksNeeded = Math.ceil((targetPowerKW / elecStackPower).toFixed(3));

const maxStacksPerElec = selectedElectrolyzer.max_stacks || 1;
const electrolyzerQuantity = Math.ceil(totalElecStacksNeeded / maxStacksPerElec);
```

### 2.2. Inventory Deduction and Electrolyzer CAPEX

The CAPEX only accounts for *new* frames and *new* additional internal stacks required beyond the user's current inventory. Extra logic prevents negative hardware values.

**Code Correspondence:**

```javascript
const elecExtraStacksNeeded = Math.max(0, totalElecStacksNeeded - electrolyzerQuantity);
const newElecFrames = Math.max(0, electrolyzerQuantity - (electrolyzerSettings.owned || 0));

const actualOwnedElecStacks = Math.max(electrolyzerSettings.ownedStacks || 0, electrolyzerSettings.owned || 0);
const ownedExtraElecStacks = Math.max(0, actualOwnedElecStacks - (electrolyzerSettings.owned || 0));
const newExtraElecStacks = Math.max(-electrolyzerQuantity, elecExtraStacksNeeded - ownedExtraElecStacks); 

const electrolyzerCapex = Math.max((newElecFrames * (selectedElectrolyzer.price || 0)) + (newExtraElecStacks * (selectedElectrolyzer.stack_price || 0)), 0);
```

---

## 3. Compressor Sizing and Initial CAPEX

Compressor sizing uses a conditional branch depending on the hardware `type`: **Mechanical** (scaled by global flowrate) or **Electrochemical** (modular cell stacks).

### 3.1. Mechanical Compressors

Mechanical compressors are scaled as full, standalone units based on a total required flowrate.

**Code Correspondence:**

```javascript
if (selectedCompressor.type === 'Mechanical') {
    const annualCapPerComp = (selectedCompressor.unitary_flowrate_kg_per_day * compressorSettings.flow_unit.factor) * compOpHoursPerYear;
    compressorQuantity = annualCapPerComp > 0 ? Math.ceil(massToCompress / annualCapPerComp) : 0;
    
    const newComps = Math.max(0, compressorQuantity - (compressorSettings.owned || 0));
    compressorCapex = newComps * (selectedCompressor.price || 0);
}
```

### 3.2. Electrochemical Compressors (EHC)

EHCs scale identically to electrolyzers: frames housing multiple internal cell stacks. 

**Code Correspondence:**

```javascript
else if (selectedCompressor.type === 'Electrochemical') {
    const flowPerStackKgPerH = selectedCompressor.unitary_flowrate_kg_per_day * compressorSettings.flow_unit.factor * (selectedCompressor.cells_per_stack || 1);
    const annualCapPerStack = flowPerStackKgPerH * compOpHoursPerYear;
    
    totalCompStacksNeeded = annualCapPerStack > 0 ? Math.ceil(massToCompress / annualCapPerStack) : 0;
    const maxStacksPerComp = selectedCompressor.cells_per_stack > 0 ? Math.floor(selectedCompressor.max_cells / selectedCompressor.cells_per_stack) : 1;
    
    compressorQuantity = maxStacksPerComp > 0 ? Math.ceil(totalCompStacksNeeded / maxStacksPerComp) : 0;
    extraCompStacksNeeded = Math.max(0, totalCompStacksNeeded - compressorQuantity);
    
    const newComps = Math.max(0, compressorQuantity - (compressorSettings.owned || 0));
    const actualOwnedCompStacks = Math.max(compressorSettings.ownedStacks || 0, compressorSettings.owned || 0);
    const ownedExtraCompStacks = Math.max(0, actualOwnedCompStacks - (compressorSettings.owned || 0));
    const newExtraCompStacks = Math.max(-compressorQuantity, extraCompStacksNeeded - ownedExtraCompStacks);
    
    compressorCapex = Math.max((newComps * (selectedCompressor.price || 0)) + (newExtraCompStacks * (selectedCompressor.cell_stack_price || 0)), 0);
}
```


## 4. Hardware Depreciation (CAPEX Amortization)

To translate the upfront hardware cost into a per-kg metric, the total CAPEX is depreciated linearly over the project's lifetime ($A_{project}$) and divided by the annual hydrogen production ($Prod_{annual}$).

**Scientific Formulas:**

$$
CAPEX_{annual\_depre} = \frac{CAPEX_{total}}{A_{project}}
$$

$$
CAPEX_{share\_per\_kg} = \frac{CAPEX_{annual\_depre}}{Prod_{annual}}
$$

**Code Correspondence (`useCalculatorLogic.js`):**

```javascript
const capex = electrolyzerCapex + compressorCapex;
const annualDepre = capex / projectLifetime;
const capexPerKgShare = annualProd > 0 ? (annualDepre / annualProd) : 0; 
```

## 5. Macro-Economics: Levelized Inflation

The model calculates a smoothed inflation factor to average out utility price hikes over the years, which is a standard Levelized Cost methodology.

**Scientific Formula:**

$$
AvgInflaFactor = \frac{(1 + i)^{A_{project}} - 1}{i \times A_{project}}
$$

**Code Correspondence:**

```javascript
const avgInflaFactor = inflationRate === 0 ? 1 : ((1 + inflationRate / 100) ** projectLifetime - 1) / ((inflationRate / 100) * projectLifetime);
const smoothedElecPrice = (electricityPrice.value * electricityPrice.unit.factor) * avgInflaFactor;
```

## 6. Physical Consumptions (Energy & Water)

The total plant energy consumption is the sum of the electrolyzer's core consumption, its Balance of Plant (Auxiliaries), and the compressor's consumption. Self-produced electricity limits the reliance on the paid grid.

**Scientific Formulas:**

$$
Elec_{total} = Elec_{core} + Elec_{aux} + Elec_{comp}
$$

$$
Water_{total} = Q_{water} \times T_{annual\_hours} \times N_{electrolyzers}
$$

**Code Correspondence:**

```javascript
const gridElectricityRatio = systemSize.value > 0 ? Math.max(0, systemSize.value - (systemSize.selfProduced || 0)) / systemSize.value : 0;

const annualAuxElec = (selectedElectrolyzer.total_auxiliary_consumption || 0) * annualOperatingHours;
const elecPowerNeeded = annualProd * (selectedElectrolyzer.energy_consumption_kwh_per_kg * electrolyzerSettings.cons_unit.factor);
const compPowerNeeded = isCompressorNeeded ? (massToCompress * (selectedCompressor.energy_consumption_kwh_per_kg * compressorSettings.cons_unit.factor)) : 0;

const totalElecNeeded = elecPowerNeeded + annualAuxElec + compPowerNeeded;
const totalWaterNeeded = (selectedElectrolyzer.water_consumption_l_per_h || 0) * annualOperatingHours * electrolyzerQuantity;
```

## 7. Operational Costs & Maintenance (OPEX)

### 7.1. Routine Maintenance

Maintenance can be defined dynamically either as a flat annual fee or as a percentage of the initial CAPEX.

**Code Correspondence:**

```javascript
const annualElectrolyzerMaintenance = electrolyzerSettings.maint_unit.label === "units.eur" 
    ? (selectedElectrolyzer.maintenance_percent_capex * electrolyzerQuantity)
    : (selectedElectrolyzer.price * electrolyzerQuantity) * (selectedElectrolyzer.maintenance_percent_capex / 100);

const totalCompressorHardwareValue = (compressorQuantity * (selectedCompressor.price || 0)) + (extraCompStacksNeeded * (selectedCompressor.cell_stack_price || 0));

const annualCompressorMaintenance = isCompressorNeeded 
    ? (compressorSettings.maint_unit.label === "units.eur" 
        ? (selectedCompressor.maintenance_percent_capex * compressorQuantity)
        : totalCompressorHardwareValue * (selectedCompressor.maintenance_percent_capex / 100))
    : 0;
```

### 7.2. Lifecycle and Stack Replacements

Stacks degrade over time. The formula calculates the number of full replacement cycles needed during the project's lifespan and averages the cost annually.

**Scientific Formula:**

$$
N_{replacements} = \left\lfloor \frac{T_{lifetime\_hours}}{T_{stack\_life\_hours}} \right\rfloor
$$

$$
Cost_{annual\_replacement} = \frac{N_{replacements} \times N_{stacks} \times Price_{stack}}{A_{project}}
$$

**Code Correspondence (Electrolyzer Example):**

```javascript
const elecStackLifetimeHours = selectedElectrolyzer.stack_lifetime_hours || 80000; 
const elecStackReplacements = Math.floor(projectLifetimeHours / elecStackLifetimeHours);
const totalElecReplacementCost = elecStackReplacements * totalElecStacksNeeded * (selectedElectrolyzer.stack_price || 0);
const annualElecReplacementCost = totalElecReplacementCost / projectLifetime;
```

## 8. Levelized Cost of Hydrogen (LCOH)

The LCOH represents the absolute break-even selling price required to cover all expenses over the project's lifetime, calculated per kilogram of $H_2$. It sums the per-kg share of the CAPEX, electricity, water, and maintenance.

**Scientific Formula:**

$$
LCOH = CAPEX_{share} + OPEX_{elec\_share} + OPEX_{water\_share} + OPEX_{maint\_share}
$$

**Code Correspondence (`useCalculatorLogic.js`):**

```javascript
// Levelized Cost of Hydrogen (LCOH): The core KPI. The strict break-even cost to produce 1 kg of H2.
const lcoh = capexPerKgShare + elecShare + waterShare + maintenanceShare;

const costBreakdown = {
    capex: capexPerKgShare,
    electricity: elecShare,
    water: waterShare,
    maintenance: maintenanceShare
};
```

## 9. Environmental Impact and Carbon Tax

Green Hydrogen avoids the $CO_2$ emissions associated with Grey Hydrogen (Steam Methane Reforming). The standard emissions factor (`EMISSIONS_PER_KG_OF_H2`) is imported from constants. A carbon tax artificially increases the Grey Hydrogen price to reflect its environmental cost.

**Scientific Formulas:**

$$
Tax_{per\_kg} = Emissions_{H2} \times \left( \frac{Tax_{carbon}}{1000} \right)
$$

$$
Price_{grey\_taxed} = Price_{grey\_base} + Tax_{per\_kg}
$$

$$
CO2_{avoided\_tons} = \frac{Prod_{annual} \times Emissions_{H2}}{1000}
$$

**Code Correspondence:**

```javascript
// Carbon tax acts as an artificial price penalty on fossil-based grey hydrogen
const carbonTaxPerKg = EMISSIONS_PER_KG_OF_H2 * (carbonTax / 1000);
const baseGreyPrice = greyHydrogenPrice.value * greyHydrogenPrice.unit.factor;
const greyPriceWithTax = baseGreyPrice + carbonTaxPerKg;
const smoothedGreyPrice = greyPriceWithTax * avgInflaFactor;

const avoidedCO2 = (annualProd * EMISSIONS_PER_KG_OF_H2) / 1000;
```

## 10. Financial Savings and ROI

The model evaluates the project's profitability by comparing the Green Hydrogen LCOH against two baselines: the market Grey Hydrogen price (including tax) and the user's current specific Hydrogen supply price.

**Scientific Formulas:**

$$
Savings_{per\_kg} = Price_{baseline} - LCOH
$$

$$
Savings_{annual} = Savings_{per\_kg} \times Prod_{annual}
$$

**Code Correspondence:**

```javascript
// ROI compared to highly-polluting market alternatives
const costDifference = smoothedGreyPrice - lcoh; 
const annualDifference = costDifference * annualProd;

// ROI compared to the user's specific current hydrogen supply
const currentPricePerKg = currentHydrogenPrice.value * currentHydrogenPrice.unit.factor;
const currentCostDifference = currentPricePerKg - lcoh;
const currentAnnualDifference = currentCostDifference * annualProd;
```
