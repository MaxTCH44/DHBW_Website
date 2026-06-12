# Mathematical Models: Hydrogen Recycling Simulator

This document details the scientific and financial equations implemented in the `Recycling.jsx` component of the GreenLab H2 Calculator. It evaluates the physical yield and financial viability of capturing and recycling mixed exhaust gases instead of venting them.

---

## 1. Thermodynamic Algorithm (Auto-Calculation)

When a user selects a gas mixture, the system automatically estimates the required system price (CAPEX) and energy consumption using scaling laws and concentration penalties.

### 1.1. System Price Scaling (Six-Tenths Rule)
The CAPEX is estimated by scaling a baseline system price ($BaseCapex$) against the ratio of the user's volume ($V_{annual}$) to a baseline volume ($V_{base}$), applying an economy-of-scale exponent.

**Scientific Formula:**

$$
CAPEX_{auto} = BaseCapex \times \left( \frac{V_{annual}}{V_{base}} \right)^{Exponent}
$$

**Code Correspondence:**

```javascript
const scaleFactor = Math.pow(annualMixedGas / gasInfo.scaling.baseVolume, gasInfo.scaling.exponent);
const newAutoSystemPrice = Math.round(gasInfo.scaling.baseCapex * scaleFactor);
```

### 1.2. Energy Penalty Factor
Lower $H_2$ concentrations require more energy to purify. The model applies a penalty factor compared to a 50% concentration baseline. The concentration is floored at 5% to prevent division by zero, and the penalty is capped at 0.8 for highly concentrated gases.

**Scientific Formula:**

$$
Penalty = \max \left( 0.8, \frac{50}{\max(Concentration, 5)} \right)
$$

**Code Correspondence:**

```javascript
const safeConcentration = Math.max(h2Concentration, 5);
let penaltyFactor = 50 / safeConcentration;
if (penaltyFactor < 0.8) penaltyFactor = 0.8;

const newAutoEnergyValue = Number((currentTier.energy_kwh_per_kg * penaltyFactor).toFixed(2));
```

---

## 2. Volumetric and Mass Calculations

The model converts the volumetric flow of the mixed gas (in Nm³) into pure Hydrogen mass (in kg), then applies the technology's recovery rate.

**Scientific Formulas:**

$$
V_{H2} = V_{mixed\_annual} \times \frac{Concentration_{H2}}{100}
$$

$$
Mass_{H2\_total} = \frac{V_{H2}}{11.1}
$$

$$
Mass_{recovered} = Mass_{H2\_total} \times RecoveryRate
$$
*(Note: 11.1 Nm³/kg is the standard density factor of Hydrogen used in the project)*

**Code Correspondence:**

```javascript
const annualH2Volume = annualMixedGas * (h2Concentration / 100);
const annualH2Kg = annualH2Volume / 11.1; 
const recoveredKg = annualH2Kg * rate;
```

---

## 3. Financials: OPEX, Savings, and ROI

### 3.1. Operational Costs (OPEX)
The annual OPEX consists of the electricity required to run the recycling system and the maintenance costs (which can be a flat fee or a percentage of the CAPEX).

**Scientific Formulas:**

$$
Cost_{electricity} = Mass_{recovered} \times Energy_{per\_kg} \times Price_{kWh}
$$

$$
OPEX_{annual} = Cost_{maintenance} + Cost_{electricity}
$$

**Code Correspondence:**

```javascript
const totalElectricityPrice = recoveredKg * energyPerKg * elecPricePerKwh; 

const isOpexPercent = annualOpexRate.unit.label === "units.percent_capex";
const maintenanceCost = isOpexPercent
    ? systemPrice * (annualOpexRate.value / 100)
    : annualOpexRate.value;

const annualOpex = maintenanceCost + totalElectricityPrice;
```

### 3.2. Return on Investment (ROI)
The ROI is the payback period (in years) required for the net savings (value of the recovered Hydrogen minus the OPEX) to cover the initial system price.

**Scientific Formulas:**

$$
Savings_{gross} = Mass_{recovered} \times Price_{H2\_per\_kg}
$$

$$
Savings_{net} = Savings_{gross} - OPEX_{annual}
$$

$$
ROI_{years} = \frac{CAPEX_{system}}{Savings_{net}}
$$

**Code Correspondence:**

```javascript
const savings = recoveredKg * h2PricePerKg;
const netAnnualSavings = savings - annualOpex;

// Prevent division by zero or negative ROI calculation
const roi = netAnnualSavings > 0 ? systemPrice / netAnnualSavings : null;
```

---

## 4. Avoided Emissions (CO2)

Venting Hydrogen into the atmosphere has a high Global Warming Potential ($H2\_GWP$). Recycling it prevents these indirect emissions. The code assumes green energy is used to power the recycling plant, so grid emissions are set to 0 in the final tally.

**Scientific Formula:**

$$
CO2_{avoided\_tons} = \frac{Mass_{recovered} \times H2\_GWP}{1000}
$$

**Code Correspondence:**

```javascript
const CO2_GRID_INTENSITY = 0.295; // kg CO₂/kWh — EU grid mix 2024
const H2_GWP = 11.6; // kg CO₂eq/kg H₂ vented — IPCC AR6 2023

const recyclingEmissions = (recoveredKg * energyPerKg) * CO2_GRID_INTENSITY;

// 0 because we assume it's green energy
const co2AvoidedKg = (recoveredKg * H2_GWP) - 0; 
const co2AvoidedTons = co2AvoidedKg / 1000;
```
