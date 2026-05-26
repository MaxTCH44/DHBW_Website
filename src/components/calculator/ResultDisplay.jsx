import { Card, Title, Group, Paper, Text, Badge, SimpleGrid, RingProgress, Stack, Progress, ThemeIcon, Grid, Box, Alert } from '@mantine/core';
import { IconBolt, IconDroplet, IconWind, IconTool, IconChartPie, IconAlertCircle, IconLeaf } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { memo } from 'react';

// --- SUB-COMPONENTS ---
// Small utility components to keep the main render tree clean and readable.

const StatCard = ({ icon, color, title, value, unit }) => (
    <Paper p="md" radius="md" withBorder bg="white">
        <Group gap="sm">
            <ThemeIcon size="xl" radius="md" variant="light" color={color}>
                {icon}
            </ThemeIcon>
            <div>
                <Text size="xs" c="dimmed" tt="uppercase" fw={600}>{title}</Text>
                <Text fw={700} size="lg">
                    {value} {unit}
                </Text>
            </div>
        </Group>
    </Paper>
);

const CostProgressRow = ({ icon, color, title, value, percent, lang }) => (
    <Box>
        <Group justify="space-between" mb="xs">
            <Group gap="xs">
                <ThemeIcon color={color} size="sm" radius="xl">{icon}</ThemeIcon>
                <Text size="sm" fw={600}>{title}</Text>
            </Group>
            <Text size="sm" fw={700}>
                {value.toLocaleString(lang, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} € ({percent.toFixed(0)}%)
            </Text>
        </Group>
        <Progress value={percent} color={color} size="md" radius="xl" />
    </Box>
);

/**
 * Renders the final executive dashboard displaying the techno-economic viability of the hydrogen plant.
 * It visualizes the Levelized Cost of Hydrogen (LCOH), CAPEX, ROI against current prices, and environmental impact.
 * * @param {Object} props - Destructured properties from the parent Calculator logic.
 * @param {number} props.cost - The calculated Levelized Cost of Hydrogen (LCOH) in €/kg.
 * @param {number} props.capex - The total initial Capital Expenditure (equipment upfront cost) in €.
 * @param {number} props.greyCostDifference - The price gap in €/kg between the user's LCOH and the market grey hydrogen price.
 * @param {number} props.greyAnnualDifference - The projected annual savings/losses compared to buying fossil-based grey hydrogen.
 * @param {number} props.currentCostDifference - The price gap in €/kg between the user's LCOH and their current H2 supply.
 * @param {number} props.currentAnnualDifference - The actual projected annual savings/losses for the specific user setup.
 * @param {number} props.avoidedCO2 - The estimated tons of CO2 emissions avoided annually by producing green hydrogen.
 * @param {Object} props.breakdown - Breakdown of the LCOH into exact cost drivers (electricity, capex, maintenance, water).
 * @param {Object} props.metrics - Additional physical plant metrics (annual production, energy needed, utilization rate).
 * @param {Object} props.greyDetails - Contextual market data regarding grey hydrogen (base price, carbon tax impact).
 */
function ResultDisplay({ cost, capex, greyCostDifference, greyAnnualDifference, currentCostDifference, currentAnnualDifference, avoidedCO2, breakdown, metrics, greyDetails }) {
    
    const { t, i18n } = useTranslation("calculator");

    // Profitability toggles used to dynamically switch card background colors (green for savings, red for losses)
    const isProfitableCurrent = currentCostDifference >= 0;
    const isProfitableGrey = greyCostDifference >= 0;
    
    // Fallback to prevent division by zero in edge cases where cost hasn't been fully calculated
    const safeCost = cost > 0 ? cost : 1;
    
    // Normalizing the breakdown values into percentages for the RingProgress chart
    const percents = {
        electricity: (breakdown.electricity / safeCost) * 100,
        capex: (breakdown.capex / safeCost) * 100,
        maintenance: (breakdown.maintenance / safeCost) * 100,
        water: (breakdown.water / safeCost) * 100,
    };

    // If the installed physical capacity drastically exceeds the actual annual production needs (low utilization rate),
    // the CAPEX share per kg spikes. This warns the user about a suboptimal, unnecessarily expensive hardware configuration.
    const showOversizedWarning = metrics?.utilizationRate > 0 && metrics.utilizationRate < 95;

    return (
        <Card shadow="lg" padding="xl" radius="md" withBorder mt="xl" bg="gray.0">
            <Title order={2} mb="xl" c="dark.8" ta="center">
                {t('dashboard.title')}
            </Title>

            {/* --- ALERTS --- */}
            {showOversizedWarning && (
                <Alert 
                    icon={<IconAlertCircle size={20} />} 
                    title={t('dashboard.oversizedWarning.title')}
                    color="orange" 
                    variant="light"
                    mb="xl"
                >
                    {t('dashboard.oversizedWarning.messageP1')}
                    {metrics.installedCapacity.toLocaleString(i18n.language)}
                    {t('dashboard.oversizedWarning.messageP2')}
                    <b>{metrics.utilizationRate.toLocaleString(i18n.language, { maximumFractionDigits: 1 })}%</b>
                    {t('dashboard.oversizedWarning.messageP3')}
                </Alert>
            )}
            
            {/* --- PRIMARY FINANCIAL METRICS (TOP ROW) --- */}
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg" mb="xl">
                
                {/* Levelized Cost of Hydrogen (LCOH) - The ultimate KPI combining CAPEX + OPEX over lifetime */}
                <Paper p="md" radius="md" withBorder bg="white">
                    <Text size="sm" c="dimmed" fw={600} tt="uppercase">
                        {t('dashboard.metrics.lcoh')}
                    </Text>

                    <Text size="xl" fw={900} c="myColor.9" mt="sm">
                        {cost > 0 && isFinite(cost)
                            ? cost.toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                            : "0,00"} {t('units.eur_per_kg')}
                    </Text>
                </Paper>

                <Paper p="md" radius="md" withBorder bg="white">
                    <Text size="sm" c="dimmed" fw={600} tt="uppercase">
                        {t('dashboard.metrics.totalCapex')}
                    </Text>

                    <Text size="xl" c="red.7" fw={900} mt="sm">
                        {capex.toLocaleString(i18n.language, { maximumFractionDigits: 0 })} €
                    </Text>
                </Paper>

                {/* ROI vs User's actual current supply costs */}
                <Paper p="md" radius="md" withBorder bg={isProfitableCurrent ? "teal.0" : "red.0"}>
                    <Text
                        size="sm"
                        c={isProfitableCurrent ? "teal.9" : "red.9"}
                        fw={600}
                        tt="uppercase"
                    >
                        {isProfitableCurrent
                            ? t('dashboard.metrics.savingsVsCurrentCost')
                            : t('dashboard.metrics.lossVsCurrentCost')}
                    </Text>

                    <Text
                        size="xl"
                        fw={900}
                        c={isProfitableCurrent ? "teal.7" : "red.7"}
                        mt="sm"
                    >
                        {isProfitableCurrent ? "+" : ""}
                        {(isFinite(currentAnnualDifference) && currentAnnualDifference !== 0)
                            ? currentAnnualDifference.toLocaleString(i18n.language, { maximumFractionDigits: 0 })
                            : "0"} {t('units.eur_per_year')}
                    </Text>

                    <Badge color={isProfitableCurrent ? "teal" : "red"} mt="xs" variant="light">
                        {isProfitableCurrent ? "+" : ""}
                        {isFinite(currentCostDifference)
                            ? currentCostDifference.toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                            : "0,00"} {t('units.eur_per_kg')}
                    </Badge>
                </Paper>

                <Paper
                    p="md"
                    radius="md"
                    withBorder
                    bg={isProfitableGrey ? "teal.0" : "red.0"}
                    style={{ opacity: 0.85 }}
                >
                    <Text
                        size="sm"
                        c={isProfitableGrey ? "teal.9" : "red.9"}
                        fw={600}
                        tt="uppercase"
                    >
                        {isProfitableGrey
                            ? t('dashboard.metrics.savingsVsGrey')
                            : t('dashboard.metrics.greenPremium')}
                    </Text>

                    <Text
                        size="xl"
                        fw={900}
                        c={isProfitableGrey ? "teal.7" : "red.7"}
                        mt="sm"
                    >
                        {isProfitableGrey ? "+" : ""}
                        {(isFinite(greyAnnualDifference) && greyAnnualDifference !== 0)
                            ? greyAnnualDifference.toLocaleString(i18n.language, { maximumFractionDigits: 0 })
                            : "0"} {t('units.eur_per_year')}
                    </Text>

                    <Badge color={isProfitableGrey ? "teal" : "red"} mt="xs" variant="light">
                        {isProfitableGrey ? "+" : ""}
                        {isFinite(greyCostDifference)
                            ? greyCostDifference.toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                            : "0,00"} {t('units.eur_per_kg')}
                    </Badge>

                    <Box
                        mt="sm"
                        pt="sm"
                        style={{
                            borderTop: `1px solid var(--mantine-color-${isProfitableGrey ? 'teal' : 'red'}-2)`
                        }}
                    >
                        <Text
                            size="xs"
                            c={isProfitableGrey ? "teal.9" : "red.9"}
                            fw={500}
                        >
                            {t('dashboard.metrics.greyEstimatedP1')}
                            {greyDetails.smoothed.toLocaleString(i18n.language, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}
                            {t('dashboard.metrics.greyEstimatedP2')}
                            
                        </Text>
                    </Box>
                </Paper>
            </SimpleGrid>

            {/* --- LCOH BREAKDOWN CHART --- */}
            {/* Visualizes what is driving the cost. Electricity typically dominates for green hydrogen. */}
            <Paper p="xl" radius="md" withBorder bg="white" mb="xl">
                <Title order={4} mb="lg" c="dark.7">
                    {t('dashboard.costBreakdown.title')}
                </Title>

                <Grid align="center">
                    <Grid.Col span={{ base: 12, md: 5 }}>
                        <Group justify="center">
                            <RingProgress
                                size={220}
                                thickness={24}
                                roundCaps
                                sections={[
                                    {
                                        value: percents.electricity,
                                        color: 'blue.5',
                                        tooltip: t('dashboard.costBreakdown.electricity')
                                    },
                                    {
                                        value: percents.capex,
                                        color: 'red.5',
                                        tooltip: t('dashboard.costBreakdown.capex')
                                    },
                                    {
                                        value: percents.maintenance,
                                        color: 'orange.5',
                                        tooltip: t('dashboard.costBreakdown.maintenance')
                                    },
                                    {
                                        value: percents.water,
                                        color: 'cyan.5',
                                        tooltip: t('dashboard.costBreakdown.water')
                                    },
                                ]}
                                label={
                                    <Text c="dimmed" fw={700} ta="center" size="lg">
                                        100%
                                    </Text>
                                }
                            />
                        </Group>
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, md: 7 }}>
                        <Stack gap="md">
                            <CostProgressRow
                                icon={<IconBolt size={12}/>}
                                color="blue.5"
                                title={t('dashboard.costBreakdown.electricity')}
                                value={breakdown.electricity}
                                percent={percents.electricity}
                                lang={i18n.language}
                            />

                            <CostProgressRow
                                icon={<IconChartPie size={12}/>}
                                color="red.5"
                                title={t('dashboard.costBreakdown.capex')}
                                value={breakdown.capex}
                                percent={percents.capex}
                                lang={i18n.language}
                            />

                            <CostProgressRow
                                icon={<IconTool size={12}/>}
                                color="orange.5"
                                title={t('dashboard.costBreakdown.maintenance')}
                                value={breakdown.maintenance}
                                percent={percents.maintenance}
                                lang={i18n.language}
                            />

                            <CostProgressRow
                                icon={<IconDroplet size={12}/>}
                                color="cyan.5"
                                title={t('dashboard.costBreakdown.water')}
                                value={breakdown.water}
                                percent={percents.water}
                                lang={i18n.language}
                            />
                        </Stack>
                    </Grid.Col>
                </Grid>
            </Paper>

            {/* --- SECONDARY PHYSICAL METRICS (BOTTOM ROW) --- */}
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
                <StatCard 
                    icon={<IconWind size={24} />} 
                    color="myColor" 
                    title={t('dashboard.stats.annualProduction')}
                    value={metrics.annualProd.toLocaleString(i18n.language, { maximumFractionDigits: 0 })} 
                    unit={t('units.kg')}
                />

                <StatCard 
                    icon={<IconBolt size={24} />} 
                    color="blue" 
                    title={t('dashboard.stats.energyNeeded')}
                    value={(metrics.annualElec / 1000).toLocaleString(i18n.language, { maximumFractionDigits: 1 })} 
                    unit={t('units.energy_mwh')}
                />

                <StatCard 
                    icon={<IconDroplet size={24} />} 
                    color="cyan" 
                    title={t('dashboard.stats.waterNeeded')}
                    value={metrics.annualWater.toLocaleString(i18n.language, { maximumFractionDigits: 0 })} 
                    unit={t('units.liters')}
                />

                <StatCard 
                    icon={<IconLeaf size={24} />} 
                    color="green" 
                    title={t('dashboard.stats.avoidedCo2')}
                    value={avoidedCO2
                        ? avoidedCO2.toLocaleString(i18n.language, { maximumFractionDigits: 1 })
                        : "0"} 
                    unit={t('units.tons')}
                />
            </SimpleGrid>
        </Card>
    );
}

export default memo(ResultDisplay);