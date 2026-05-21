export const ELEC_PRICE_UNITS = [
  { label: "units.elec_price_mwh", factor: 0.001 },
  { label: "units.elec_price_kwh", factor: 1 }
];

export const POWER_UNITS = [
  { label: "units.power_mw", factor: 1000 },
  { label: "units.power_kw", factor: 1 }
];

export const WATER_VOLUME_PRICE_UNITS = [
  { label: "units.water_price_m3", factor: 0.001 },
  { label: "units.water_price_l", factor: 1 }
];

export const TIME_PER_YEAR_UNITS = [
  { label: "units.time_days_per_year", factor: 24 },
  { label: "units.time_hours_per_year", factor: 1 }
];

export const VOLUME_PER_TIME_UNITS = [
  { label: "units.kg_per_hour", factor: 1 },
  { label: "units.m3_per_hour", factor: 1 / 11.1 },
  { label: "units.kg_per_day", factor: 1 / 24 },
  { label: "units.m3_per_day", factor: 1 / (11.1 * 24) }
];

export const VOLUME_UNITS = [
  { label: "units.kg", factor: 1 },
  { label: "units.m3", factor: 11.1 }
];

export const H2_VOLUME_PRICE_UNITS = [
  { label: "units.eur_per_kg", factor: 1 },
  { label: "units.eur_per_m3", factor: 11.1 }
];

export const H2_VOLUME_POWER_UNITS = [
  { label: "units.kwh_per_kg", factor: 1 },
  { label: "units.kwh_per_m3", factor: 11.1 }
];

export const MAINTENANCE_UNITS = [
  { label: "units.percent_capex", factor: 1 },
  { label: "units.eur", factor: 1 }
];

export const WATER_PER_KG_OF_H2 = 0.015; //m³ of water
export const EMISSIONS_PER_KG_OF_H2 = 9.5; //kg of CO2