// utils/export-csv.js
// Génère un CSV en deux sections : INPUTS puis OUTPUTS

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Les unit.label sont des clés i18n → on utilise unit.value (ex: "€/MWh")
const unitStr = (u) => {
    if (!u) return '';
    if (typeof u === 'string') return u;
    return u.value ?? u.label ?? '';
};

const fmt = (v, decimals = 2) =>
    v == null || isNaN(v) ? 'N/A' : Number(v).toFixed(decimals);

const row = (label, value, unit = '') =>
    `"${label}","${value}","${unit}"`;

// ─── Builder ──────────────────────────────────────────────────────────────────

function buildCSV(inputs, outputs) {
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

    // ── INPUTS ────────────────────────────────────────────────────────────────
    lines.push('## INPUTS');
    lines.push('"Paramètre","Valeur","Unité"');

    lines.push('');
    lines.push('"--- Électrolyseur ---","",""');
    lines.push(row('Modèle', selectedElectrolyzer.name));
    lines.push(row('Puissance unitaire', fmt(selectedElectrolyzer.power), 'kW'));
    lines.push(row('Efficacité', fmt(selectedElectrolyzer.energy_consumption_kwh_per_kg), 'kWh/kg'));
    lines.push(row('Prix unitaire', fmt(selectedElectrolyzer.price, 0), '€'));
    lines.push(row('Maintenance', fmt(selectedElectrolyzer.maintenance_percent_capex), '%'));
    lines.push(row('Unités possédées', electrolyzerSettings.owned));
    lines.push(row('Stacks possédés', electrolyzerSettings.ownedStacks));

    lines.push('');
    lines.push('"--- Dimensionnement & exploitation ---","",""');
    lines.push(row('Taille du système', systemSize.value, unitStr(systemSize.unit)));
    lines.push(row("Temps d'exploitation", operatingTime.value, unitStr(operatingTime.unit)));

    lines.push('');
    lines.push('"--- Prix & macro-économie ---","",""');
    lines.push(row("Prix de l'électricité", electricityPrice.value, unitStr(electricityPrice.unit)));
    lines.push(row("Prix de l'eau", waterPrice.value, unitStr(waterPrice.unit)));
    lines.push(row("Prix H₂ actuel", currentHydrogenPrice.value, unitStr(currentHydrogenPrice.unit)));
    lines.push(row("Prix H₂ gris", greyHydrogenPrice.value, unitStr(greyHydrogenPrice.unit)));
    lines.push(row("Taxe carbone", carbonTax, '€/tCO₂'));

    lines.push('');
    lines.push('"--- Cycle de vie ---","",""');
    lines.push(row("Durée de vie du projet", projectLifetime, 'ans'));
    lines.push(row("Taux d'inflation", inflationRate, '%'));

    lines.push('');
    lines.push('"--- Compresseur ---","",""');
    lines.push(row('Compresseur requis', isCompressorNeeded ? 'Oui' : 'Non'));
    if (isCompressorNeeded) {
        lines.push(row('Modèle compresseur', selectedCompressor.name));
        lines.push(row('Type', selectedCompressor.type));
        lines.push(row('Prix unitaire', fmt(selectedCompressor.price, 0), '€'));
        lines.push(row('Masse à comprimer', massToCompress === -1 ? 'Auto' : fmt(massToCompress, 0), 'kg/an'));
        lines.push(row('Unités possédées', compressorSettings.owned));
        lines.push(row("Temps d'exploitation", compressorSettings.operatingTime.value, unitStr(compressorSettings.operatingTime.unit)));
    }

    // ── OUTPUTS ───────────────────────────────────────────────────────────────
    lines.push('');
    lines.push('');
    lines.push('## OUTPUTS');
    lines.push('"Indicateur","Valeur","Unité"');

    lines.push('');
    lines.push('"--- Dimensionnement ---","",""');
    lines.push(row("Quantité d'électrolyseurs", electrolyzerQuantity));
    lines.push(row('Stacks nécessaires', totalStacksNeeded));
    if (isCompressorNeeded) {
        lines.push(row('Quantité de compresseurs', compressorQuantity));
        lines.push(row('Stacks compresseurs', totalCompStacksNeeded));
    }

    lines.push('');
    lines.push('"--- CAPEX ---","",""');
    lines.push(row('CAPEX total', fmt(capex, 0), '€'));

    lines.push('');
    lines.push('"--- Coût de l\'hydrogène ---","",""');
    lines.push(row('LCOH (H₂ vert)', fmt(lcoh), '€/kg H₂'));
    lines.push(row('Écart vs H₂ gris (avec taxe)', fmt(costDifference), '€/kg'));
    lines.push(row('Économie annuelle vs H₂ gris', fmt(annualDifference, 0), '€/an'));
    lines.push(row('Écart vs H₂ actuel', fmt(currentCostDifference), '€/kg'));
    lines.push(row('Économie annuelle vs H₂ actuel', fmt(currentAnnualDifference, 0), '€/an'));
    if (greyDetails) {
        lines.push(row('Prix H₂ gris de base', fmt(greyDetails.base), '€/kg'));
        lines.push(row('Taxe carbone / kg', fmt(greyDetails.tax), '€/kg'));
        lines.push(row('H₂ gris + taxe (lissé)', fmt(greyDetails.smoothed), '€/kg'));
    }

    lines.push('');
    lines.push('"--- Décomposition des coûts (par kg H₂) ---","",""');
    lines.push(row('Amortissement CAPEX', fmt(costBreakdown.capex), '€/kg'));
    lines.push(row('Électricité', fmt(costBreakdown.electricity), '€/kg'));
    lines.push(row('Maintenance', fmt(costBreakdown.maintenance), '€/kg'));
    lines.push(row('Eau', fmt(costBreakdown.water), '€/kg'));

    lines.push('');
    lines.push('"--- Production & ressources ---","",""');
    lines.push(row('Production annuelle H₂', fmt(extraMetrics.annualProd, 0), 'kg/an'));
    lines.push(row('Énergie nécessaire', fmt(extraMetrics.annualElec, 0), 'kWh/an'));
    lines.push(row('Eau nécessaire', fmt(extraMetrics.annualWater, 0), 'L/an'));
    lines.push(row('Capacité installée', fmt(extraMetrics.installedCapacity), 'kW'));
    lines.push(row("Taux d'utilisation", fmt(extraMetrics.utilizationRate), '%'));
    lines.push(row('CO₂ évité', fmt(avoidedCO2, 1), 'tCO₂/an'));

    return lines.join('\n');
}

// ─── Export public ────────────────────────────────────────────────────────────

export function exportCSV(inputs, outputs, t) {
    const csv = buildCSV(inputs, outputs);
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `h2-lcoh-export-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
}