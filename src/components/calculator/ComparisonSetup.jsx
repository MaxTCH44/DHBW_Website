import { useTranslation } from 'react-i18next';
import { Paper, Text, Group, Badge, Divider, RingProgress, Box, ThemeIcon, Stack, Anchor } from '@mantine/core';
import { IconBolt, IconDroplet, IconLeaf, IconChartPie, IconTool } from '@tabler/icons-react';

export default function ComparisonSetup({ setup, index, onRemove, setCalculatorToSetup }) {
    const { t, i18n } = useTranslation("calculator");

    const { cost, capex, greyCostDifference, greyAnnualDifference,
            currentCostDifference, currentAnnualDifference,
            avoidedCO2, breakdown, metrics, greyDetails } = setup;

    const isProfitableCurrent = currentCostDifference >= 0;
    const isProfitableGrey = greyCostDifference >= 0;

    const safeCost = cost > 0 ? cost : 1;
    const percents = {
        electricity: (breakdown.electricity / safeCost) * 100,
        capex:       (breakdown.capex       / safeCost) * 100,
        maintenance: (breakdown.maintenance / safeCost) * 100,
        water:       (breakdown.water       / safeCost) * 100,
    };

    const fmt  = (n, d = 2) => (isFinite(n) ? n.toLocaleString(i18n.language, { minimumFractionDigits: d, maximumFractionDigits: d }) : '0,00');
    const fmt0 = (n)        => (isFinite(n) ? n.toLocaleString(i18n.language, { maximumFractionDigits: 0 }) : '0');

    return (
        <Paper p="md" radius="md" withBorder bg="white" style={{ flexShrink: 0, position: 'relative' }}>

            {/* ---- HEADER ---- */}
            <Group justify="space-between" mb="sm">
                <Badge variant="filled" color="myColor" size="lg">{t("comparison.setup")} #{index + 1}</Badge>
                <Anchor
                    component="button" 
                    type="button" 
                    size="xs"
                    c="#495057"
                    style={{ cursor: 'pointer' }}
                    onClick={setCalculatorToSetup}
                >{t("comparison.loadInputLabel")}</Anchor>
                <Text
                    size="xs"
                    c="#495057"
                    style={{ cursor: 'pointer' }}
                    onClick={() => onRemove(index)}
                >✕</Text>
            </Group>

            {/* ---- LCOH + CAPEX ---- */}
            <Group grow mb="sm">
                <Box>
                    <Text size="xs" c="#495057" fw={600} tt="uppercase">{t('dashboard.metrics.lcoh')}</Text>
                    <Text size="xl" fw={900} c="myColor.9">{fmt(cost)} {t('units.eur_per_kg')}</Text>
                </Box>
                <Box>
                    <Text size="xs" c="#495057" fw={600} tt="uppercase">{t('dashboard.metrics.totalCapex')}</Text>
                    <Text size="xl" fw={900} c="red.7">{fmt0(capex)} €</Text>
                </Box>
            </Group>

            <Divider mb="sm" />

            {/* ---- ROI BADGES ---- */}
            <Stack gap="xs" mb="sm">
                <Group justify="space-between">
                    <Text size="xs" c="#495057" fw={600} tt="uppercase">
                        {isProfitableCurrent ? t('dashboard.metrics.savingsVsCurrentCost') : t('dashboard.metrics.lossVsCurrentCost')}
                    </Text>
                    <Badge color={isProfitableCurrent ? 'teal' : 'red'} variant="light">
                        {isProfitableCurrent ? '+' : ''}{fmt(currentCostDifference)} {t('units.eur_per_kg')}
                    </Badge>
                </Group>
                <Group justify="space-between">
                    <Text size="xs" c="#495057" fw={600} tt="uppercase">
                        {isProfitableGrey ? t('dashboard.metrics.savingsVsGrey') : t('dashboard.metrics.greenPremium')}
                    </Text>
                    <Badge color={isProfitableGrey ? 'teal' : 'red'} variant="light">
                        {isProfitableGrey ? '+' : ''}{fmt(greyCostDifference)} {t('units.eur_per_kg')}
                    </Badge>
                </Group>
            </Stack>

            <Divider mb="sm" />

            {/* ---- PHYSICAL STATS ---- */}
            <Group grow>
                <Box ta="center">
                    <Text size="xs" c="#495057">{t('dashboard.stats.annualProduction')}</Text>
                    <Text size="sm" fw={700}>{fmt0(metrics.annualProd)} {t('units.kg')}</Text>
                </Box>
                <Box ta="center">
                    <Text size="xs" c="#495057">{t('dashboard.stats.avoidedCo2')}</Text>
                    <Group gap={4} justify="center">
                        <ThemeIcon color="green" size={14} radius="xl"><IconLeaf size={10} /></ThemeIcon>
                        <Text size="sm" fw={700}>{fmt(avoidedCO2 ?? 0, 1)} {t('units.tons')}</Text>
                    </Group>
                </Box>
            </Group>
        </Paper>
    );
}