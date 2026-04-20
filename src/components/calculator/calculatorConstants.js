export const ELEC_PRICE_UNITS = [{ label: "€/MWh", factor: 0.001 }, { label: "€/kWh", factor: 1 }];
export const POWER_UNITS = [{ label: "MW", factor: 1000 }, { label: "kW", factor: 1}];
export const WATER_VOLUME_PRICE_UNITS = [{ label: "€/m³", factor: 0.001 }, { label: "€/L", factor: 1 }];
export const TIME_PER_YEAR_UNITS = [{ label: "days/year", factor: 24 }, { label: "h/year", factor: 1 }];
export const VOLUME_PER_TIME_UNITS = [{ label: "kg/h", factor: 1 }, { label: "m³/h", factor: (1/11.1) }, { label: "kg/day", factor: (1/24) }, { label: "m³/day", factor: (1/(11.1*24)) }];
export const VOLUME_UNITS = [{ label: "kg", factor: 1 }, { label: "m³", factor: 11.1 }];
export const H2_VOLUME_PRICE_UNITS = [{ label: "€/kg", factor: 1 }, { label: "€/m³", factor: 11.1 }];
export const H2_VOLUME_POWER_UNITS = [{ label: "kWh/kg", factor: 1 }, { label: "kWh/m³", factor: 11.1 }];
export const MAINTENANCE_UNITS = [{ label: "% CAPEX", factor: 1 }, { label: "€", factor: 1 }];

export const WATER_PER_KG_OF_H2 = 0.015; //m³ of water
export const EMISSIONS_PER_KG_OF_H2 = 9.5; //kg of CO2