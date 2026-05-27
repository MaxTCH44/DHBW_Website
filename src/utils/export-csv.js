// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (v, lang, decimals = 2) =>
    v == null || isNaN(v)
        ? 'N/A'
        : Number(v).toLocaleString(lang, {
              minimumFractionDigits: decimals,
              maximumFractionDigits: decimals,
              useGrouping: false,
          })

// Section, Paramètre, Valeur, Unité
const row = (sep, section, label, value, unit = '') =>
    `"${section}"${sep}"${label}"${sep}"${value}"${sep}"${unit}"`;

// ─── Builder ──────────────────────────────────────────────────────────────────

function buildCSV(inputs, outputs, t, lang) {
    const {
        selectedElectrolyzer, electrolyzerSettings,
        systemSize, operatingTime,
        electricityPrice, waterPrice, currentHydrogenPrice, greyHydrogenPrice,
        carbonTax, projectLifetime, inflationRate,
        isCompressorNeeded, selectedCompressor, compressorSettings, massToCompress,
    } = inputs;

    const {
        electrolyzerQuantity, compressorQuantity,
        totalStacksNeeded, totalCompStacksNeeded,
        capex,
        lcoh, costDifference, annualDifference,
        currentCostDifference, currentAnnualDifference, avoidedCO2,
        costBreakdown,
        extraMetrics,
        greyDetails,
    } = outputs.calcResults;

    const lines = [];

    const sep = (1.1).toLocaleString(lang).includes(',') ? ';' : ',';

    // ── En-tête ───────────────────────────────────────────────────────────────
    lines.push(`"${t('export.date')}"${sep}"${new Date().toISOString().slice(0, 10)}"${sep}""${sep}""`);
    lines.push('');
    lines.push(`"${t('export.section')}"${sep}"${t('export.parameter')}"${sep}"${t('export.value')}"${sep}"${t('export.units')}"`);

    // ── INPUTS ────────────────────────────────────────────────────────────────

    lines.push(row(sep, t('export.config'), t('export.electrolyzer'),                 t(selectedElectrolyzer.name)));
    lines.push(row(sep, t('export.config'), t('equipment.electrolyzer.type'),         t(selectedElectrolyzer.type)));
    lines.push(row(sep, t('export.config'), t('equipment.electrolyzer.power'),        fmt(selectedElectrolyzer.power, lang), t('units.power_kw')));
    lines.push(row(sep, t('export.config'), t('equipment.electrolyzer.energy_consumption_kwh_per_kg'), fmt(selectedElectrolyzer.energy_consumption_kwh_per_kg, lang), t('units.kwh_per_kg')));
    lines.push(row(sep, t('export.config'), t('electrolyzer.price.label'),            fmt(selectedElectrolyzer.price, lang, 0), t('units.eur')));
    lines.push(row(sep, t('export.config'), t('equipment.electrolyzer.maintenance_percent_capex'), fmt(selectedElectrolyzer.maintenance_percent_capex, lang), t('equipment.electrolyzer.maintenanceUnit')));
    lines.push(row(sep, t('export.config'), t('export.ownedUnits'),                       electrolyzerSettings.owned));
    lines.push(row(sep, t('export.config'), t('electrolyzer.ownedStacks.label'),      electrolyzerSettings.ownedStacks));
    lines.push(row(sep, t('export.config'), t('electrolyzer.systemSize.label'),       fmt(systemSize.value, lang), t(systemSize.unit.label)));
    lines.push(row(sep, t('export.config'), t('electrolyzer.operatingTime.label'),    fmt(operatingTime.value, lang), t(operatingTime.unit.label)));
    lines.push(row(sep, t('export.config'), t('resourcesCosts.electricity_price.label'), fmt(electricityPrice.value, lang), t(electricityPrice.unit.label)));
    lines.push(row(sep, t('export.config'), t('resourcesCosts.water_price.label'),    fmt(waterPrice.value, lang), t(waterPrice.unit.label)));
    lines.push(row(sep, t('export.config'), t('export.current_h2_price'),             fmt(currentHydrogenPrice.value, lang), t(currentHydrogenPrice.unit.label)));
    lines.push(row(sep, t('export.config'), t('export.grey_h2_price'),                fmt(greyHydrogenPrice.value, lang), t(greyHydrogenPrice.unit.label)));
    lines.push(row(sep, t('export.config'), t('resourcesCosts.carbon_tax.label'),     fmt(carbonTax, lang), t('export.ton_co2_per_year')));
    lines.push(row(sep, t('export.config'), t('lifecycleParameters.project_lifetime.label'), fmt(projectLifetime, lang, 0), t('units.years')));
    lines.push(row(sep, t('export.config'), t('lifecycleParameters.inflation_rate.label'),   fmt(inflationRate, lang), t('units.pourcent')));

    if (isCompressorNeeded) {
        lines.push(row(sep, t('export.config'), t('export.compressor'), t(selectedCompressor.name)));
        lines.push(row(sep, t('export.config'), t('compressorSetup.compressorType'),  t(selectedCompressor.type)));
        lines.push(row(sep, t('export.config'), t('compressorSetup.purchasePrice.label'), fmt(selectedCompressor.price, lang, 0), t('units.eur')));
        lines.push(row(sep, t('export.config'), t('compressorSetup.hydrogenToCompress.label'), massToCompress === -1 ? 'Auto' : fmt(massToCompress, lang, 0), massToCompress === -1 ? '' : t('units.kg_per_year')));
        lines.push(row(sep, t('export.config'), t('export.ownedUnits'),              compressorSettings.owned));
        lines.push(row(sep, t('export.config'), t('compressorSetup.operatingTime.label'), fmt(compressorSettings.operatingTime.value, lang), t(compressorSettings.operatingTime.unit.label)));
    }

    // ── OUTPUTS ───────────────────────────────────────────────────────────────

    lines.push(row(sep, t('export.results'), t('electrolyzer.hardwareNeeded.setup'),  `${electrolyzerQuantity}`));
    lines.push(row(sep, t('export.results'), t('electrolyzer.hardwareNeeded.stacks'), `${totalStacksNeeded}`));

    if (isCompressorNeeded) {
        lines.push(row(sep, t('export.results'), t('compressorSetup.compressorSetupBadge'), `${compressorQuantity}`));
        lines.push(row(sep, t('export.results'), t('compressorSetup.stackBadge'),     `${totalCompStacksNeeded}`));
    }

    lines.push(row(sep, t('export.results'), t('dashboard.metrics.totalCapex'),       fmt(capex, lang, 0),                                              t('units.eur')));
    lines.push(row(sep, t('export.results'), t('export.lcoh'),                        fmt(lcoh, lang),                                                  t('units.eur_per_kg')));
    costDifference > 0 ? lines.push(row(sep, t('export.results'), t('dashboard.metrics.savingsVsGrey'),    fmt(costDifference, lang), t('units.eur_per_kg'))) : lines.push(row(sep, t('export.results'), t('dashboard.metrics.greenPremium'),    fmt(costDifference, lang), t('units.eur_per_kg')));
    costDifference > 0 ? lines.push(row(sep, t('export.results'), t('dashboard.metrics.savingsVsGrey'),    fmt(annualDifference, lang, 0), t('units.eur_per_year'))) : lines.push(row(sep, t('export.results'), t('dashboard.metrics.greenPremium'),    fmt(annualDifference, lang, 0), t('units.eur_per_year')));
    currentCostDifference > 0 ? lines.push(row(sep, t('export.results'), t('dashboard.metrics.savingsVsCurrentCost'), fmt(currentCostDifference, lang), t('units.eur_per_kg'))) : lines.push(row(sep, t('export.results'), t('dashboard.metrics.lossVsCurrentCost'), fmt(currentCostDifference, lang), t('units.eur_per_kg')));
    currentCostDifference > 0 ? lines.push(row(sep, t('export.results'), t('dashboard.metrics.savingsVsCurrentCost'), fmt(currentAnnualDifference, lang, 0), t('units.eur_per_year'))) : lines.push(row(sep, t('export.results'), t('dashboard.metrics.lossVsCurrentCost'), fmt(currentAnnualDifference, lang, 0), t('units.eur_per_year')));

    if (greyDetails) {
        lines.push(row(sep, t('export.results'), t('export.grey_h2_price'),           fmt(greyDetails.base, lang),                                      t('units.eur_per_kg')));
        lines.push(row(sep, t('export.results'), t('dashboard.metrics.greenPremium'), fmt(greyDetails.tax, lang),                                       t('units.eur_per_kg')));
        lines.push(row(sep, t('export.results'), t('grey_smoothed'),                  fmt(greyDetails.smoothed, lang),                                  t('units.eur_per_kg')));
    }

    lines.push(row(sep, t('export.results'), t('dashboard.costBreakdown.capex'),      fmt(costBreakdown.capex, lang),                                   t('units.eur_per_kg')));
    lines.push(row(sep, t('export.results'), t('dashboard.costBreakdown.electricity'),fmt(costBreakdown.electricity, lang),                            t('units.eur_per_kg')));
    lines.push(row(sep, t('export.results'), t('dashboard.costBreakdown.maintenance'),fmt(costBreakdown.maintenance, lang),                            t('units.eur_per_kg')));
    lines.push(row(sep, t('export.results'), t('dashboard.costBreakdown.water'),      fmt(costBreakdown.water, lang),                                   t('units.eur_per_kg')));
    lines.push(row(sep, t('export.results'), t('export.annualProduction'),            fmt(extraMetrics.annualProd, lang, 0),                            t('units.kg_per_year')));
    lines.push(row(sep, t('export.results'), t('dashboard.costBreakdown.electricity'),fmt(extraMetrics.annualElec, lang, 0),                            t('units.kWh_per_year')));
    lines.push(row(sep, t('export.results'), t('dashboard.costBreakdown.water'),      fmt(extraMetrics.annualWater, lang, 0),                           t('units.l_per_year')));
    lines.push(row(sep, t('export.results'), t('export.installed_capacity'),          fmt(extraMetrics.installedCapacity, lang),                        t('units.power_kw')));
    lines.push(row(sep, t('export.results'), t('export.useRate'),                     fmt(extraMetrics.utilizationRate, lang),                          t('units.pourcent')));
    lines.push(row(sep, t('export.results'), t('export.avoidedCo2'),                  fmt(avoidedCO2, lang, 1),                                        t('units.ton_co2_per_year')));

    lines.push('');
    lines.push(`"${t('export.footer')}"${sep}""${sep}""${sep}""`);

    return lines.join('\n');
}

// ─── Export public ────────────────────────────────────────────────────────────

export function exportCSV(inputs, outputs, t, lang) {
    const csv = buildCSV(inputs, outputs, t, lang);
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${t('export.title')}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
}