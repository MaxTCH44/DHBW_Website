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

// ─── Header ───────────────────────────────────────────────────────────────────

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

// ─── KPI cards ────────────────────────────────────────────────────────────────

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
    // Color
    doc.setFillColor(...color);
    doc.roundedRect(x, y, w, 4, 3, 3, 'F');
    doc.rect(x, y + 1.5, w, 2.5, 'F');
    // Value
    drawTextWithSub(doc, value, x + w / 2, y + 14, { align: 'center', fontSize: 13, style: 'bold',   color: C.textDark  });
    // Unit
    drawTextWithSub(doc, unit, x + w / 2, y + 20, { align: 'center', fontSize: 7,  style: 'normal', color: C.textMuted });
    // Label
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
            label: t('dashboard.metrics.lossVsCurrentCost'),
            value: fmt(outputs.currentCostDifference, lang),
            unit: t('units.eur_per_kg'),
            color: outputs.currentCostDifference >= 0 ? C.primary : C.danger
        },
    ];

    kpis.forEach((kpi, i) => {
        drawKPICard(doc, margin + i * (cardW + gap), y, cardW, cardH, kpi);
    });

    return y + cardH + 8;
}

// ─── Cost Graph ───────────────────────────────────────

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

    // Title section
    doc.setFillColor(...C.bg);
    doc.rect(margin, y, chartW, 7, 'F');
    setFont(doc, 9, 'bold', C.textDark);
    doc.text(t('dashboard.costBreakdown.title'), margin + 3, y + 5);
    y += 10;

    const barH = 14;
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

    let legendY = y + 4;
    items.forEach(item => {
        const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0';
        doc.setFillColor(...item.color);
        doc.rect(margin + barW + 6, legendY - 3, 4, 4, 'F');
        setFont(doc, 7, 'normal', C.textDark);
        doc.text(`${item.label}: ${fmt(item.value, lang)} ${t('units.eur')} (${pct}${t('units.pourcent')})`, margin + barW + 13, legendY);
        legendY += 6;
    });

    y += barH + 4;
    return y + 12;
}

// ─── Tabs ─────────────────────────────────────────────────────

function drawTables(doc, inputs, outputs, pageW, y, t, lang) {
    const margin = 14;
    const rightX = pageW / 2 + 3;
    const { extraMetrics, greyDetails, costBreakdown } = outputs;

    const sectionHeader = (x, w, label, yPos) => {
        doc.setFillColor(...C.bg);
        doc.rect(x, yPos, w, 7, 'F');
        setFont(doc, 9, 'bold', C.textDark);
        doc.text(label, x + 3, yPos + 5);
    };

    sectionHeader(margin, pageW / 2 - margin - 3, t('export.config'), y);
    sectionHeader(rightX, pageW / 2 - margin - 3, t('export.results') , y);
    y += 9;

    const baseStyle = {
        styles: { fontSize: 7, cellPadding: 2, lineColor: C.border, lineWidth: 0.2, overflow: 'ellipsize', cellWidth: 'wrap',},
        alternateRowStyles: { fillColor: C.white },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 42 }, 1: { cellWidth: 'auto' } },
    };

    // input table (left)
    autoTable(doc, {
        startY: y,
        head: [[t('export.parameter'), t('export.value')]],
        body: [
            [t('export.electrolyzer'), t(inputs.selectedElectrolyzer.name)],
            [t('electrolyzer.systemSize.label'), `${fmt(inputs.systemSize.value, lang)} ${t(inputs.systemSize.unit.label)}`],
            [t('electrolyzer.operatingTime.label'), `${fmt(inputs.operatingTime.value, lang)} ${t(inputs.operatingTime.unit.label)}`],
            [t('resourcesCosts.electricity_price.label'), `${fmt(inputs.electricityPrice.value, lang)} ${t(inputs.electricityPrice.unit.label)}`],
            [t('export.current_h2_price'), `${fmt(inputs.currentHydrogenPrice.value, lang)} ${t(inputs.currentHydrogenPrice.unit.label)}`],
            [t('export.grey_h2_price'), `${fmt(inputs.greyHydrogenPrice.value, lang)} ${t(inputs.greyHydrogenPrice.unit.label)}`],
            [t('resourcesCosts.carbon_tax.label'), `${fmt(inputs.carbonTax, lang)} ${t('export.ton_co2_per_year')}`],
            [t('lifecycleParameters.project_lifetime.label'), `${fmt(inputs.projectLifetime, lang, 0)} ${t('units.years')}`],
            [t('lifecycleParameters.inflation_rate.label'), `${fmt(inputs.inflationRate, lang)} ${t('units.pourcent')}`],
            [t('export.compressor'), inputs.isCompressorNeeded ? t(inputs.selectedCompressor.name) : t('compressorSetup.useCompressor')],
        ],
        margin: { left: margin, right: pageW / 2 + 3 },
        headStyles: { fillColor: C.primary, textColor: C.white, fontStyle: 'bold' },
        ...baseStyle,
    });

    // outputs table (right)
    autoTable(doc, {
        startY: y,
        head: [[t('export.indicator'), t('export.value')]],
        body: [
            [t('export.lcoh'), `${fmt(outputs.lcoh, lang)} ${t('units.eur_per_kg')}`],
            [t('dashboard.metrics.totalCapex'), `${fmt(outputs.capex, lang)} ${t('units.eur')}`],
            [t('dashboard.costBreakdown.capex'), `${fmt(costBreakdown.capex, lang)} ${t('units.eur_per_kg')}`],
            [t('dashboard.costBreakdown.electricity'), `${fmt(costBreakdown.electricity, lang)} ${t('units.eur_per_kg')}`],
            [t('dashboard.costBreakdown.maintenance'), `${fmt(costBreakdown.maintenance, lang)} ${t('units.eur_per_kg')}`],
            [t('dashboard.costBreakdown.water'), `${fmt(costBreakdown.water, lang)} ${t('units.eur_per_kg')}`],
            [t('dashboard.metrics.lossVsCurrentCost'), `${fmt(outputs.currentCostDifference, lang)} ${t('units.eur_per_kg')}`],
            [t('export.savingsVsGrey'), `${fmt(outputs.costDifference, lang)} ${t('units.eur_per_kg')}`],
            [t('dashboard.metrics.greenPremium'), `${fmt(greyDetails.tax, lang)} ${t('units.eur_per_kg')}`],
            [t('export.annualProduction'), `${fmt(extraMetrics.annualProd, lang, 0)} ${t('units.kg_per_year')}`],
            [t('dashboard.stats.energyNeeded'), `${fmt(extraMetrics.annualElec, lang, 0)} ${t('units.kWh_per_year')}`],
            [t('dashboard.stats.waterNeeded'), `${fmt(extraMetrics.annualWater, lang, 0)} ${t('units.l_per_year')}`],
            [t('export.useRate'), `${fmt(extraMetrics.utilizationRate, lang, 1)} ${t('units.pourcent')}`],
            [t('export.avoidedCo2'), `${fmt(outputs.avoidedCO2, lang, 1)} ${t('export.ton_co2_per_year')}`],
            [t('export.electrolyzer'), fmt(outputs.electrolyzerQuantity, lang, 0)],
            [t('electrolyzer.hardwareNeeded.stacks'), fmt(outputs.totalStacksNeeded, lang, 0)],
        ],
        margin: { left: rightX, right: margin },
        headStyles: { fillColor: C.secondary, textColor: C.white, fontStyle: 'bold' },
        ...baseStyle,
    });
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function drawFooter(doc, pageW, pageH, t) {
    doc.setFillColor(...C.border);
    doc.rect(0, pageH - 10, pageW, 10, 'F');
    setFont(doc, 7, 'normal', C.textMuted);
    doc.text(t('export.footer'), 14, pageH - 3);
}

// ─── Export public ────────────────────────────────────────────────────────────

export function exportPDF(inputs, outputs, t, lang) {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    doc.setFillColor(...C.bg);
    doc.rect(0, 0, pageW, pageH, 'F');

    drawHeader(doc, pageW, t, lang);
    let y = 30;
    y = drawKPIRow(doc, outputs.calcResults, pageW, y, t, lang);
    y = drawCostBreakdown(doc, outputs.calcResults, pageW, y, t, lang);
    drawTables(doc, inputs, outputs.calcResults, pageW, y, t, lang);
    drawFooter(doc, pageW, pageH, t, lang);

    doc.save(`${t('export.title')}-${new Date().toISOString().slice(0, 10)}.pdf`);
}