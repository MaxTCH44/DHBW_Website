import { Card, Title, Group, Paper, Text, Badge, SimpleGrid, RingProgress, Stack, Progress, ThemeIcon, Grid, Box, Alert } from '@mantine/core';
import { IconBolt, IconDroplet, IconWind, IconTool, IconChartPie, IconAlertCircle, IconLeaf } from '@tabler/icons-react';

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

const CostProgressRow = ({ icon, color, title, value, percent }) => (
    <Box>
        <Group justify="space-between" mb="xs">
            <Group gap="xs">
                <ThemeIcon color={color} size="sm" radius="xl">{icon}</ThemeIcon>
                <Text size="sm" fw={600}>{title}</Text>
            </Group>
            <Text size="sm" fw={700}>
                {value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} € ({percent.toFixed(0)}%)
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
export default function ResultDisplay({ cost, capex, greyCostDifference, greyAnnualDifference, currentCostDifference, currentAnnualDifference, avoidedCO2, breakdown, metrics, greyDetails }) {
    
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
                Project Dashboard
            </Title>

            {/* --- ALERTS --- */}
            {showOversizedWarning && (
                <Alert 
                    icon={<IconAlertCircle size={20} />} 
                    title="Oversized Installation Warning" 
                    color="orange" 
                    variant="light"
                    mb="xl"
                >
                    Your physical installation ({metrics.installedCapacity.toLocaleString('de-DE')} kW) is oversized compared to your production needs. 
                    Your utilization rate is only <b>{metrics.utilizationRate.toLocaleString('de-DE', { maximumFractionDigits: 1 })}%</b>. 
                    This increases the CAPEX share per kg and negatively impacts your LCOH.
                </Alert>
            )}
            
            {/* --- PRIMARY FINANCIAL METRICS (TOP ROW) --- */}
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg" mb="xl">
                
                {/* Levelized Cost of Hydrogen (LCOH) - The ultimate KPI combining CAPEX + OPEX over lifetime */}
                <Paper p="md" radius="md" withBorder bg="white">
                    <Text size="sm" c="dimmed" fw={600} tt="uppercase">LCOH (Green H₂)</Text>
                    <Text size="xl" fw={900} c="myColor.9" mt="sm">
                        {cost > 0 && isFinite(cost) ? cost.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0,00"} € / kg
                    </Text>
                </Paper>

                <Paper p="md" radius="md" withBorder bg="white">
                    <Text size="sm" c="dimmed" fw={600} tt="uppercase">Total CAPEX</Text>
                    <Text size="xl" c="red.7" fw={900} mt="sm">
                        {capex.toLocaleString('de-DE', { maximumFractionDigits: 0 })} €
                    </Text>
                </Paper>

                {/* ROI vs User's actual current supply costs */}
                <Paper p="md" radius="md" withBorder bg={isProfitableCurrent ? "teal.0" : "red.0"}>
                    <Text size="sm" c={isProfitableCurrent ? "teal.9" : "red.9"} fw={600} tt="uppercase">
                        {isProfitableCurrent ? "Savings vs Current Cost" : "Loss vs Current Cost"}
                    </Text>
                    <Text size="xl" fw={900} c={isProfitableCurrent ? "teal.7" : "red.7"} mt="sm">
                        {isProfitableCurrent ? "+" : ""}{(isFinite(currentAnnualDifference) && currentAnnualDifference !== 0) ? currentAnnualDifference.toLocaleString('de-DE', { maximumFractionDigits: 0 }) : "0"} € / year
                    </Text>
                    <Badge color={isProfitableCurrent ? "teal" : "red"} mt="xs" variant="light">
                        {isProfitableCurrent ? "+" : ""}{isFinite(currentCostDifference) ? currentCostDifference.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0,00"} € / kg
                    </Badge>
                </Paper>

                {/* Market Competitiveness: Green H2 vs highly polluting Grey H2 */}
                <Paper p="md" radius="md" withBorder bg={isProfitableGrey ? "teal.0" : "red.0"} style={{ opacity: 0.85 }}>
                    <Text size="sm" c={isProfitableGrey ? "teal.9" : "red.9"} fw={600} tt="uppercase">
                        {isProfitableGrey ? "Savings vs Grey H₂" : "Green Premium"}
                    </Text>
                    <Text size="xl" fw={900} c={isProfitableGrey ? "teal.7" : "red.7"} mt="sm">
                        {isProfitableGrey ? "+" : ""}{(isFinite(greyAnnualDifference) && greyAnnualDifference !== 0) ? greyAnnualDifference.toLocaleString('de-DE', { maximumFractionDigits: 0 }) : "0"} € / year
                    </Text>
                    <Badge color={isProfitableGrey ? "teal" : "red"} mt="xs" variant="light">
                        {isProfitableGrey ? "+" : ""}{isFinite(greyCostDifference) ? greyCostDifference.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0,00"} € / kg
                    </Badge>
                    <Box mt="sm" pt="sm" style={{ borderTop: `1px solid var(--mantine-color-${isProfitableGrey ? 'teal' : 'red'}-2)` }}>
                        <Text size="xs" c={isProfitableGrey ? "teal.9" : "red.9"} fw={500}>
                            Grey H₂ estimated at {greyDetails.smoothed.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €/kg
                        </Text>
                    </Box>
                </Paper>
            </SimpleGrid>

            {/* --- LCOH BREAKDOWN CHART --- */}
            {/* Visualizes what is driving the cost. Electricity typically dominates for green hydrogen. */}
            <Paper p="xl" radius="md" withBorder bg="white" mb="xl">
                <Title order={4} mb="lg" c="dark.7">Cost Breakdown per kg</Title>
                <Grid align="center">
                    <Grid.Col span={{ base: 12, md: 5 }}>
                        <Group justify="center">
                            <RingProgress
                                size={220}
                                thickness={24}
                                roundCaps
                                sections={[
                                    { value: percents.electricity, color: 'blue.5', tooltip: 'Electricity' },
                                    { value: percents.capex, color: 'red.5', tooltip: 'CAPEX' },
                                    { value: percents.maintenance, color: 'orange.5', tooltip: 'Maintenance' },
                                    { value: percents.water, color: 'cyan.5', tooltip: 'Water' },
                                ]}
                                label={<Text c="dimmed" fw={700} ta="center" size="lg">100%</Text>}
                            />
                        </Group>
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, md: 7 }}>
                        <Stack gap="md">
                            <CostProgressRow icon={<IconBolt size={12}/>} color="blue.5" title="Electricity" value={breakdown.electricity} percent={percents.electricity} />
                            <CostProgressRow icon={<IconChartPie size={12}/>} color="red.5" title="CAPEX Amortization" value={breakdown.capex} percent={percents.capex} />
                            <CostProgressRow icon={<IconTool size={12}/>} color="orange.5" title="Maintenance" value={breakdown.maintenance} percent={percents.maintenance} />
                            <CostProgressRow icon={<IconDroplet size={12}/>} color="cyan.5" title="Water" value={breakdown.water} percent={percents.water} />
                        </Stack>
                    </Grid.Col>
                </Grid>
            </Paper>

            {/* --- SECONDARY PHYSICAL METRICS (BOTTOM ROW) --- */}
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
                <StatCard 
                    icon={<IconWind size={24} />} 
                    color="myColor" 
                    title="Annual H₂ Prod."
                    value={metrics.annualProd.toLocaleString('de-DE', { maximumFractionDigits: 0 })} 
                    unit="kg" 
                />
                <StatCard 
                    icon={<IconBolt size={24} />} 
                    color="blue" 
                    title="Energy Needed" 
                    value={(metrics.annualElec / 1000).toLocaleString('de-DE', { maximumFractionDigits: 1 })} 
                    unit="MWh" 
                />
                <StatCard 
                    icon={<IconDroplet size={24} />} 
                    color="cyan" 
                    title="Water Needed" 
                    value={metrics.annualWater.toLocaleString('de-DE', { maximumFractionDigits: 0 })} 
                    unit="L" 
                />
                {/* Environmental impact compared to traditional steam methane reforming (grey H2) */}
                <StatCard 
                    icon={<IconLeaf size={24} />} 
                    color="green" 
                    title="Avoided CO₂" 
                    value={avoidedCO2 ? avoidedCO2.toLocaleString('de-DE', { maximumFractionDigits: 1 }) : "0"} 
                    unit="Tons" 
                />
            </SimpleGrid>
        </Card>
    );
}