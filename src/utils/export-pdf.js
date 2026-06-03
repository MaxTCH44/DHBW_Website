import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// ─── Colors ──────────────────────────────────────────────────────────────────

const C = {
    primary:   [30,  120, 90],
    secondary: [15,  60,  45],
    accent:    [250, 199, 117],
    danger:    [226, 75,  74],
    bg:        [245, 248, 246],
    white:     [255, 255, 255],
    textDark:  [30,  40,  35],
    textMuted: [100, 115, 108],
    border:    [210, 220, 214],
    teal:      [34,  139, 100],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (v, lang, decimals = 2) =>
    v == null || isNaN(v) ? 'N/A' : Number(v).toLocaleString(lang, { 
                                                                        minimumFractionDigits: decimals, 
                                                                        maximumFractionDigits: decimals,
                                                                    }).replace(/\u202F/g, ' ');

const setFont = (doc, size, style = 'normal', color = C.textDark) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', style);
    doc.setTextColor(...color);
};

// ─── Layout Elements ──────────────────────────────────────────────────────────

function drawHeader(doc, pageW, t, lang) {
    doc.setFillColor(...C.primary);
    doc.rect(0, 0, pageW, 22, 'F');
    setFont(doc, 16, 'bold', C.white);
    doc.text('GreenLabs', 14, 10);
    setFont(doc, 8, 'normal', C.white);
    doc.text(
        `${t("export.date")} ${new Date().toLocaleDateString(lang, { day: '2-digit', month: 'long', year: 'numeric' })}`,
        14, 17
    );
    doc.setFillColor(...C.accent);
    doc.rect(0, 22, pageW, 3, 'F');
}

function drawFooter(doc, pageW, pageH, t) {
    doc.setFillColor(...C.border);
    doc.rect(0, pageH - 10, pageW, 10, 'F');
    setFont(doc, 7, 'normal', C.textMuted);
    doc.text(t('export.footer'), 14, pageH - 3);
}

// ─── KPI cards & Graph (Page 2) ───────────────────────────────────────────────

function drawTextWithSub(doc, text, x, y, { align = 'left', fontSize = 13, style = 'normal', color = C.textDark } = {}) {
    doc.setFont('helvetica', style);
    doc.setTextColor(...color);
    const parts = text.split(/([₀-₉²³¹])/u);
    const subMap = { '₀':'0','₁':'1','₂':'2','₃':'3','₄':'4',
                     '₅':'5','₆':'6','₇':'7','₈':'8','₉':'9',
                     '²':'2','³':'3','¹':'1' };

    let totalW = 0;
    parts.forEach(p => {
        if (!p) return;
        const isSub = /[₀-₉²³¹]/u.test(p);
        doc.setFontSize(isSub ? fontSize * 0.6 : fontSize);
        totalW += doc.getTextWidth(subMap[p] ?? p);
    });

    let curX = align === 'center' ? x - totalW / 2 : x;
    parts.forEach(p => {
        if (!p) return;
        const isSub = /[₀-₉²³¹]/u.test(p);
        doc.setFontSize(isSub ? fontSize * 0.6 : fontSize);
        const char = subMap[p] ?? p;
        doc.text(char, curX, isSub ? y + 1.5 : y);
        curX += doc.getTextWidth(char);
    });
    doc.setFontSize(fontSize);
}

function drawKPICard(doc, x, y, w, h, { label, value, unit, color }) {
    doc.setFillColor(...C.white);
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, w, h, 3, 3, 'FD');
    doc.setFillColor(...color);
    doc.roundedRect(x, y, w, 4, 3, 3, 'F');
    doc.rect(x, y + 1.5, w, 2.5, 'F');
    drawTextWithSub(doc, value, x + w / 2, y + 14, { align: 'center', fontSize: 13, style: 'bold',   color: C.textDark  });
    drawTextWithSub(doc, unit, x + w / 2, y + 20, { align: 'center', fontSize: 7,  style: 'normal', color: C.textMuted });
    setFont(doc, 7, 'bold', C.textDark);
    const lines = doc.splitTextToSize(label, w - 4);
    lines.forEach((line, i) => {
        drawTextWithSub(doc, line, x + w / 2, y + 27 + i * 4, { align: 'center', fontSize: 7,  style: 'bold',   color: C.textDark  });
    });
}

function drawKPIRow(doc, outputs, pageW, y, t, lang) {
    const margin = 14;
    const gap = 4;
    const cardW = (pageW - margin * 2 - gap * 4) / 5;
    const cardH = 32;

    const kpis = [
        { label: t('dashboard.metrics.lcoh'), value:fmt(outputs.lcoh, lang), unit: t('units.eur_per_kg'), color: C.primary },
        { label: t('dashboard.metrics.totalCapex'), value:fmt(outputs.capex, lang), unit:t('units.eur'), color: C.secondary },
        { label: t('dashboard.stats.avoidedCo2'), value:fmt(outputs.avoidedCO2, lang, 1), unit: t('units.tons'), color: C.teal },
        { label: t('dashboard.stats.annualProduction'), value:fmt(outputs.extraMetrics.annualProd, lang, 0), unit:t('units.kg'),    color: C.accent },
        {
            label: outputs.currentCostDifference < 0 ? t('dashboard.metrics.lossVsCurrentCost') : t('dashboard.metrics.savingsVsCurrentCost'),
            value: fmt(outputs.currentCostDifference, lang),
            unit: t('units.eur_per_kg'),
            color: outputs.currentCostDifference >= 0 ? C.primary : C.danger
        },
    ];

    kpis.forEach((kpi, i) => { drawKPICard(doc, margin + i * (cardW + gap), y, cardW, cardH, kpi); });
    return y + cardH + 8;
}

function drawCostBreakdown(doc, outputs, pageW, y, t, lang) {
    const margin = 14;
    const chartW = pageW - margin * 2;
    const { costBreakdown, lcoh } = outputs;

    const items = [
        { label: t('dashboard.costBreakdown.capex'), value: costBreakdown.capex ?? 0, color: C.secondary },
        { label: t('dashboard.costBreakdown.electricity'), value: costBreakdown.electricity ?? 0, color: C.accent },
        { label: t('dashboard.costBreakdown.maintenance'), value: costBreakdown.maintenance ?? 0, color: C.primary },
        { label: t('dashboard.costBreakdown.water'), value: costBreakdown.water ?? 0, color: [100, 180, 220] },
    ].filter(i => i.value > 0);

    const total = lcoh ?? items.reduce((s, i) => s + i.value, 0);

    setFont(doc, 10, 'bold', C.textDark);
    doc.text(t('dashboard.costBreakdown.title'), margin, y + 4);
    y += 8;

    const barH = 10;
    const barW = chartW - 70;
    let xCursor = margin;

    items.forEach(item => {
        const segW = total > 0 ? (item.value / total) * barW : 0;
        doc.setFillColor(...item.color);
        doc.rect(xCursor, y, segW, barH, 'F');
        xCursor += segW;
    });

    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.3);
    doc.rect(margin, y, barW, barH);

    let legendY = y + 2;
    items.forEach(item => {
        const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0';
        doc.setFillColor(...item.color);
        doc.rect(margin + barW + 6, legendY - 3, 4, 4, 'F');
        setFont(doc, 7, 'normal', C.textDark);
        doc.text(`${item.label}: ${fmt(item.value, lang)} ${t('units.eur')} (${pct}${t('units.pourcent')})`, margin + barW + 13, legendY);
        legendY += 5;
    });

    return y + barH + 10;
}

// ─── Table Builders (Page 1 & 2 - en 2 Colonnes) ──────────────────────────────

function drawConfigTables(doc, inputs, pageW, startY, t, lang, initPageHook) {
    const margin = 14;
    const rightX = pageW / 2 + 3;
    const colW = pageW / 2 - margin - 3;

    const leftStyle = {
        styles: { fontSize: 8, cellPadding: 2.5, lineColor: C.border, lineWidth: 0.2, overflow: 'linebreak', cellWidth: 'wrap' },
        alternateRowStyles: { fillColor: C.white },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: colW * 0.55 }, 1: { cellWidth: 'auto' } },
        margin: { left: margin, right: rightX },
        willDrawPage: (data) => initPageHook(data.pageNumber)
    };

    const rightStyle = {
        styles: { fontSize: 8, cellPadding: 2.5, lineColor: C.border, lineWidth: 0.2, overflow: 'linebreak', cellWidth: 'wrap' },
        alternateRowStyles: { fillColor: C.white },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: colW * 0.55 }, 1: { cellWidth: 'auto' } },
        margin: { left: rightX, right: margin },
        willDrawPage: (data) => initPageHook(data.pageNumber)
    };

    const sectionHeader = (label, yPos, isRight = false) => {
        const x = isRight ? rightX : margin;
        doc.setFillColor(...C.bg);
        doc.rect(x, yPos, colW, 7, 'F');
        setFont(doc, 9, 'bold', C.primary);
        doc.text(label, x + 2, yPos + 5);
        return yPos + 8;
    };

    let leftY = startY;
    let rightY = startY;

    // ── COLONNE GAUCHE : Configuration Générale + Compresseur
    leftY = sectionHeader(t('export.gen_config'), leftY, false);
    autoTable(doc, {
        startY: leftY,
        head: [[t('export.parameter'), t('export.value')]],
        body: [
            [t('electrolyzer.systemSize.label'), `${fmt(inputs.systemSize.value, lang)} ${t(inputs.systemSize.unit.label)}`],
            [t('electrolyzer.selfProduced.label'), `${fmt(inputs.systemSize.selfProduced, lang)} ${t('units.pourcent')}`],
            [t('resourcesCosts.electricity_price.label'), `${fmt(inputs.electricityPrice.value, lang)} ${t(inputs.electricityPrice.unit.label)}`],
            [t('resourcesCosts.water_price.label'), `${fmt(inputs.waterPrice.value, lang)} ${t(inputs.waterPrice.unit.label)}`],
            [t('export.current_h2_price'), `${fmt(inputs.currentHydrogenPrice.value, lang)} ${t(inputs.currentHydrogenPrice.unit.label)}`],
            [t('export.grey_h2_price'), `${fmt(inputs.greyHydrogenPrice.value, lang)} ${t(inputs.greyHydrogenPrice.unit.label)}`],
            [t('export.carbon_tax'), `${fmt(inputs.carbonTax, lang)} ${t('export.eur_per_ton_co2')}`],
            [t('lifecycleParameters.project_lifetime.label'), `${fmt(inputs.projectLifetime, lang, 0)} ${t('units.years')}`],
            [t('lifecycleParameters.inflation_rate.label'), `${fmt(inputs.inflationRate, lang)} ${t('units.pourcent')}`]
        ],
        headStyles: { fillColor: C.primary, textColor: C.white, fontStyle: 'bold' },
        ...leftStyle,
    });
    leftY = doc.lastAutoTable.finalY + 8;

    if (inputs.isCompressorNeeded) {
        leftY = sectionHeader(t('export.comp_config'), leftY, false);
        const compRows = [];
        compRows.push([t('export.compressor'), t(inputs.selectedCompressor.name)]);
        compRows.push([t('compressorSetup.compressorType'), t(inputs.selectedCompressor.type)]);
        compRows.push([t('compressorSetup.purchasePrice.label'), `${fmt(inputs.selectedCompressor.price, lang, 0)} ${t('units.eur')}`]);
        compRows.push([t('compressorSetup.energyConsumption.label'), `${fmt(inputs.selectedCompressor.energy_consumption_kwh_per_kg, lang)} ${t('units.kwh_per_kg')}`]);

        if (inputs.selectedCompressor.type === 'Electrochemical') {
            compRows.push([t('compressorSetup.cellStackPrice.label'), `${fmt(inputs.selectedCompressor.cell_stack_price, lang, 0)} ${t('units.eur')}`]);
            compRows.push([t('compressorSetup.cellsPerStack.label'), `${fmt(inputs.selectedCompressor.cells_per_stack, lang, 0)} ${t('units.cells')}`]);
            compRows.push([t('compressorSetup.maxCells.label'), `${fmt(inputs.selectedCompressor.max_cells, lang, 0)} ${t('units.cells')}`]);
            compRows.push([t('compressorSetup.flowrate.perCellLabel'), `${fmt(inputs.selectedCompressor.unitary_flowrate_kg_per_day, lang)} ${t(inputs.compressorSettings.flow_unit.label)}`]);
            compRows.push([t('compressorSetup.maintenanceCosts.label'), `${fmt(inputs.selectedCompressor.maintenance_percent_capex, lang)} ${t(inputs.compressorSettings.maint_unit.label)}`]);
            compRows.push([t('compressorSetup.stackLifetime.label'), `${fmt(inputs.selectedCompressor.stack_lifetime_hours, lang, 0)} ${t('units.hour')}`]);
            compRows.push([t('export.ownedUnits'), inputs.compressorSettings.owned]);
            compRows.push([t('compressorSetup.ownedStacks.label'), inputs.compressorSettings.ownedStacks]);
        } else {
            compRows.push([t('compressorSetup.flowrate.perCompressorLabel'), `${fmt(inputs.selectedCompressor.unitary_flowrate_kg_per_day, lang)} ${t(inputs.compressorSettings.flow_unit.label)}`]);
            compRows.push([t('compressorSetup.maintenanceCosts.label'), `${fmt(inputs.selectedCompressor.maintenance_percent_capex, lang)} ${t(inputs.compressorSettings.maint_unit.label)}`]);
            compRows.push([t('export.ownedUnits'), inputs.compressorSettings.owned]);
        }

        compRows.push([t('compressorSetup.hydrogenToCompress.label'), inputs.massToCompress === -1 ? 'Auto' : `${fmt(inputs.massToCompress, lang, 0)} ${t('units.kg_per_year')}`]);
        compRows.push([t('compressorSetup.operatingTime.label'), `${fmt(inputs.compressorSettings.operatingTime.value, lang)} ${t(inputs.compressorSettings.operatingTime.unit.label)}`]);

        autoTable(doc, {
            startY: leftY,
            head: [[t('export.parameter'), t('export.value')]],
            body: compRows,
            headStyles: { fillColor: C.primary, textColor: C.white, fontStyle: 'bold' },
            ...leftStyle,
        });
        leftY = doc.lastAutoTable.finalY + 8;
    }

    // ── COLONNE DROITE : Configuration Électrolyseur
    rightY = sectionHeader(t('export.elec_config'), rightY, true);
    autoTable(doc, {
        startY: rightY,
        head: [[t('export.parameter'), t('export.value')]],
        body: [
            [t('export.electrolyzer'), t(inputs.selectedElectrolyzer.name)],
            [t('equipment.electrolyzer.type'), t(inputs.selectedElectrolyzer.type)],
            [t('equipment.electrolyzer.power'), `${fmt(inputs.selectedElectrolyzer.power, lang)} ${t('units.power_kw')}`],
            [t('equipment.electrolyzer.energy_consumption_kwh_per_kg'), `${fmt(inputs.selectedElectrolyzer.energy_consumption_kwh_per_kg, lang)} ${t('units.kwh_per_kg')}`],
            [t('electrolyzer.auxiliaryConsumption.label'), `${fmt(inputs.selectedElectrolyzer.total_auxiliary_consumption, lang)} ${t('units.power_kw')}`],
            [t('electrolyzer.waterConsumption.label'), `${fmt(inputs.selectedElectrolyzer.water_consumption_l_per_h, lang)} ${t('units.l_per_hour')}`],
            [t('electrolyzer.price.label'), `${fmt(inputs.selectedElectrolyzer.price, lang, 0)} ${t('units.eur')}`],
            [t('electrolyzer.stackPower.label'), `${fmt(inputs.selectedElectrolyzer.stack_power, lang)} ${t('units.power_kw')}`],
            [t('electrolyzer.stackPrice.label'), `${fmt(inputs.selectedElectrolyzer.stack_price, lang, 0)} ${t('units.eur')}`],
            [t('electrolyzer.maxStacks.label'), `${fmt(inputs.selectedElectrolyzer.max_stacks, lang, 0)} ${t('units.stacks')}`],
            [t('electrolyzer.stackLifetime.label'), `${fmt(inputs.selectedElectrolyzer.stack_lifetime_hours, lang, 0)} ${t('units.hour')}`],
            [t('electrolyzer.maintenanceCosts.label'), `${fmt(inputs.selectedElectrolyzer.maintenance_percent_capex, lang)} ${t(inputs.electrolyzerSettings.maint_unit.label)}`],
            [t('export.ownedUnits'), inputs.electrolyzerSettings.owned],
            [t('electrolyzer.ownedStacks.label'), inputs.electrolyzerSettings.ownedStacks],
            [t('electrolyzer.operatingTime.label'), `${fmt(inputs.operatingTime.value, lang)} ${t(inputs.operatingTime.unit.label)}`]
        ],
        headStyles: { fillColor: C.primary, textColor: C.white, fontStyle: 'bold' },
        ...rightStyle,
    });
    rightY = doc.lastAutoTable.finalY + 8;

    return Math.max(leftY, rightY);
}

function drawResultsTable(doc, inputs, outputs, pageW, startY, t, lang, initPageHook) {
    const margin = 14;
    const rightX = pageW / 2 + 3;
    const colW = pageW / 2 - margin - 3;

    // Titre de section principal (Pleine largeur)
    doc.setFillColor(...C.bg);
    doc.rect(margin, startY, pageW - margin * 2, 7, 'F');
    setFont(doc, 10, 'bold', C.secondary);
    doc.text(t('export.results'), margin + 2, startY + 5);
    
    let currentY = startY + 8;

    const leftStyle = { styles: { fontSize: 8, cellPadding: 2.5, lineColor: C.border, lineWidth: 0.2, overflow: 'linebreak', cellWidth: 'wrap' }, alternateRowStyles: { fillColor: C.white }, columnStyles: { 0: { fontStyle: 'bold', cellWidth: colW * 0.65 }, 1: { cellWidth: 'auto' } }, margin: { left: margin, right: rightX }, willDrawPage: (data) => initPageHook(data.pageNumber) };
    const rightStyle = { styles: { fontSize: 8, cellPadding: 2.5, lineColor: C.border, lineWidth: 0.2, overflow: 'linebreak', cellWidth: 'wrap' }, alternateRowStyles: { fillColor: C.white }, columnStyles: { 0: { fontStyle: 'bold', cellWidth: colW * 0.65 }, 1: { cellWidth: 'auto' } }, margin: { left: rightX, right: margin }, willDrawPage: (data) => initPageHook(data.pageNumber) };

    const leftRows = [];
    const rightRows = [];

    // ── COLONNE GAUCHE (Résultats Financiers et Matériel)
    leftRows.push([t('electrolyzer.hardwareNeeded.setup'), `${outputs.electrolyzerQuantity}`]);
    leftRows.push([t('export.elec_stacks'), `${outputs.totalStacksNeeded}`]);

    if (inputs.isCompressorNeeded) {
        leftRows.push([t('compressorSetup.compressorSetupBadge'), `${outputs.compressorQuantity}`]);
        if (inputs.selectedCompressor.type === 'Electrochemical') {
            leftRows.push([t('export.comp_stacks'), `${outputs.totalCompStacksNeeded}`]);
        }
    }

    leftRows.push([t('dashboard.metrics.totalCapex'), `${fmt(outputs.capex, lang, 0)} ${t('units.eur')}`]);
    leftRows.push([t('export.lcoh'), `${fmt(outputs.lcoh, lang)} ${t('units.eur_per_kg')}`]);

    outputs.costDifference > 0 
        ? leftRows.push([t('dashboard.metrics.savingsVsGrey'), `${fmt(outputs.costDifference, lang)} ${t('units.eur_per_kg')}`]) 
        : leftRows.push([t('dashboard.metrics.greenPremium'), `${fmt(outputs.costDifference, lang)} ${t('units.eur_per_kg')}`]);

    outputs.costDifference > 0 
        ? leftRows.push([t('dashboard.metrics.savingsVsGrey'), `${fmt(outputs.annualDifference, lang, 0)} ${t('units.eur_per_year')}`]) 
        : leftRows.push([t('dashboard.metrics.greenPremium'), `${fmt(outputs.annualDifference, lang, 0)} ${t('units.eur_per_year')}`]);

    outputs.currentCostDifference > 0 
        ? leftRows.push([t('dashboard.metrics.savingsVsCurrentCost'), `${fmt(outputs.currentCostDifference, lang)} ${t('units.eur_per_kg')}`]) 
        : leftRows.push([t('dashboard.metrics.lossVsCurrentCost'), `${fmt(outputs.currentCostDifference, lang)} ${t('units.eur_per_kg')}`]);

    outputs.currentCostDifference > 0 
        ? leftRows.push([t('dashboard.metrics.savingsVsCurrentCost'), `${fmt(outputs.currentAnnualDifference, lang, 0)} ${t('units.eur_per_year')}`]) 
        : leftRows.push([t('dashboard.metrics.lossVsCurrentCost'), `${fmt(outputs.currentAnnualDifference, lang, 0)} ${t('units.eur_per_year')}`]);

    if (outputs.greyDetails) {
        leftRows.push([t('export.grey_h2_price'), `${fmt(outputs.greyDetails.base, lang)} ${t('units.eur_per_kg')}`]);
        leftRows.push([t('dashboard.metrics.greenPremium'), `${fmt(outputs.greyDetails.tax, lang)} ${t('units.eur_per_kg')}`]);
        leftRows.push([t('export.grey_smoothed'), `${fmt(outputs.greyDetails.smoothed, lang)} ${t('units.eur_per_kg')}`]);
    }

    // ── COLONNE DROITE (Répartition des Coûts et Performances Physiques)
    rightRows.push([t('dashboard.costBreakdown.capex'), `${fmt(outputs.costBreakdown.capex, lang)} ${t('units.eur_per_kg')}`]);
    rightRows.push([t('dashboard.costBreakdown.electricity'), `${fmt(outputs.costBreakdown.electricity, lang)} ${t('units.eur_per_kg')}`]);
    rightRows.push([t('dashboard.costBreakdown.maintenance'), `${fmt(outputs.costBreakdown.maintenance, lang)} ${t('units.eur_per_kg')}`]);
    rightRows.push([t('dashboard.costBreakdown.water'), `${fmt(outputs.costBreakdown.water, lang)} ${t('units.eur_per_kg')}`]);
    
    rightRows.push([t('export.annualProduction'), `${fmt(outputs.extraMetrics.annualProd, lang, 0)} ${t('units.kg_per_year')}`]);
    rightRows.push([t('dashboard.stats.energyNeeded'), `${fmt(outputs.extraMetrics.annualElec, lang, 0)} ${t('units.kWh_per_year')}`]);
    rightRows.push([t('dashboard.stats.waterNeeded'), `${fmt(outputs.extraMetrics.annualWater, lang, 0)} ${t('units.l_per_year')}`]);
    rightRows.push([t('export.installed_capacity'), `${fmt(outputs.extraMetrics.installedCapacity, lang)} ${t('units.power_kw')}`]);
    rightRows.push([t('export.useRate'), `${fmt(outputs.extraMetrics.utilizationRate, lang, 1)} ${t('units.pourcent')}`]);
    rightRows.push([t('export.avoidedCo2'), `${fmt(outputs.avoidedCO2, lang, 1)} ${t('export.ton_co2_per_year')}`]);

    // Dessin des deux tables en parallèle
    autoTable(doc, {
        startY: currentY,
        head: [[t('export.indicator'), t('export.value')]],
        body: leftRows,
        headStyles: { fillColor: C.secondary, textColor: C.white, fontStyle: 'bold' },
        ...leftStyle,
    });
    const finalLeft = doc.lastAutoTable.finalY;

    autoTable(doc, {
        startY: currentY,
        head: [[t('export.indicator'), t('export.value')]],
        body: rightRows,
        headStyles: { fillColor: C.secondary, textColor: C.white, fontStyle: 'bold' },
        ...rightStyle,
    });
    const finalRight = doc.lastAutoTable.finalY;

    return Math.max(finalLeft, finalRight);
}

// ─── Export public ────────────────────────────────────────────────────────────

export function exportPDF(inputs, outputs, t, lang) {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    
    // Suivi des pages déjà "peintes" avec le fond
    const initializedPages = new Set();
    const initPage = (pageNum) => {
        if (!initializedPages.has(pageNum)) {
            doc.setPage(pageNum);
            doc.setFillColor(...C.bg);
            doc.rect(0, 0, pageW, pageH, 'F');
            drawHeader(doc, pageW, t, lang);
            initializedPages.add(pageNum);
        }
    };

    // ── PAGE 1: Configurations (En 2 colonnes)
    initPage(1);
    let y = 30;
    y = drawConfigTables(doc, inputs, pageW, y, t, lang, initPage);

    // ── PAGE 2: Résultats (Saut de page forcé + En 2 colonnes)
    doc.addPage();
    const page2Num = doc.internal.getNumberOfPages();
    initPage(page2Num);
    y = 30;
    
    y = drawKPIRow(doc, outputs.calcResults, pageW, y, t, lang);
    y = drawCostBreakdown(doc, outputs.calcResults, pageW, y, t, lang);
    drawResultsTable(doc, inputs, outputs.calcResults, pageW, y, t, lang, initPage);

    // ── Pied de page commun à toutes les pages générées
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        drawFooter(doc, pageW, pageH, t);
    }

    doc.save(`${t('export.title')}-${new Date().toISOString().slice(0, 10)}.pdf`);
}