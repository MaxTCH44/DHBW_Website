import { Card, Title, Group, Paper, Text, Badge, SimpleGrid, RingProgress, Stack, Progress, ThemeIcon, Grid, Box } from '@mantine/core';
import { IconBolt, IconDroplet, IconWind, IconTool, IconChartPie } from '@tabler/icons-react';

export default function ResultDisplay({ cost, capex, costDifference, annualDifference, breakdown, metrics, greyDetails }) {
    const isProfitable = costDifference >= 0;

    const safeCost = cost > 0 ? cost : 1;

    const percents = {
        electricity: (breakdown.electricity / safeCost) * 100,
        capex: (breakdown.capex / safeCost) * 100,
        maintenance: (breakdown.maintenance / safeCost) * 100,
        water: (breakdown.water / safeCost) * 100,
    };

    return (
        <Card shadow="lg" padding="xl" radius="md" withBorder mt="xl" bg="gray.0">
            <Title order={2} mb="xl" c="dark.8" ta="center">
                Project Dashboard
            </Title>
            
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg" mb="xl">
                <Paper p="md" radius="md" withBorder bg="white">
                    <Text size="sm" c="dimmed" fw={600} tt="uppercase">LCOH (Green H₂)</Text>
                    <Text size="xl" fw={900} c="myColor.9" mt="sm">
                        {cost > 0 && isFinite(cost) ? cost.toFixed(2) : "0.00"} € / kg
                    </Text>
                </Paper>

                <Paper p="md" radius="md" withBorder bg="white">
                    <Text size="sm" c="dimmed" fw={600} tt="uppercase">Total CAPEX</Text>
                    <Text size="xl" c="red.7" fw={900} mt="sm">
                        {capex.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
                    </Text>
                </Paper>

                <Paper p="md" radius="md" withBorder bg={isProfitable ? "teal.0" : "red.0"}>
                    <Text size="sm" c={isProfitable ? "teal.9" : "red.9"} fw={600} tt="uppercase">
                        {isProfitable ? "Savings vs Grey H₂" : "Green Premium"}
                    </Text>
                    <Text size="xl" fw={900} c={isProfitable ? "teal.7" : "red.7"} mt="sm">
                        {isProfitable ? "+" : ""}{(isFinite(annualDifference) && annualDifference !== 0) ? annualDifference.toLocaleString('fr-FR', { maximumFractionDigits: 0 }) : "0"} € / year
                    </Text>
                    <Badge color={isProfitable ? "teal" : "red"} mt="xs" variant="light">
                        {isProfitable ? "+" : ""}{isFinite(costDifference) ? costDifference.toFixed(2) : "0.00"} € / kg
                    </Badge>
                    <Box mt="sm" pt="sm" style={{ borderTop: `1px solid var(--mantine-color-${isProfitable ? 'teal' : 'red'}-2)` }}>
                        <Text size="xs" c={isProfitable ? "teal.9" : "red.9"} fw={500}>
                            Grey H₂ estimated at {greyDetails.smoothed.toFixed(2)} €/kg :
                        </Text>
                        <Text size="xs" c={isProfitable ? "teal.8" : "red.8"}>
                            (Base: {greyDetails.base.toFixed(2)} € + CO₂ Tax: {greyDetails.tax.toFixed(2)} €) + Inflation
                        </Text>
                    </Box>
                </Paper>
            </SimpleGrid>

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
                            <Box>
                                <Group justify="space-between" mb="xs">
                                    <Group gap="xs">
                                        <ThemeIcon color="blue.5" size="sm" radius="xl"><IconBolt size={12}/></ThemeIcon>
                                        <Text size="sm" fw={600}>Electricity</Text>
                                    </Group>
                                    <Text size="sm" fw={700}>{breakdown.electricity.toFixed(2)} € ({percents.electricity.toFixed(0)}%)</Text>
                                </Group>
                                <Progress value={percents.electricity} color="blue.5" size="md" radius="xl" />
                            </Box>
                            
                            <Box>
                                <Group justify="space-between" mb="xs">
                                    <Group gap="xs">
                                        <ThemeIcon color="red.5" size="sm" radius="xl"><IconChartPie size={12}/></ThemeIcon>
                                        <Text size="sm" fw={600}>CAPEX Amortization</Text>
                                    </Group>
                                    <Text size="sm" fw={700}>{breakdown.capex.toFixed(2)} € ({percents.capex.toFixed(0)}%)</Text>
                                </Group>
                                <Progress value={percents.capex} color="red.5" size="md" radius="xl" />
                            </Box>

                            <Box>
                                <Group justify="space-between" mb="xs">
                                    <Group gap="xs">
                                        <ThemeIcon color="orange.5" size="sm" radius="xl"><IconTool size={12}/></ThemeIcon>
                                        <Text size="sm" fw={600}>Maintenance</Text>
                                    </Group>
                                    <Text size="sm" fw={700}>{breakdown.maintenance.toFixed(2)} € ({percents.maintenance.toFixed(0)}%)</Text>
                                </Group>
                                <Progress value={percents.maintenance} color="orange.5" size="md" radius="xl" />
                            </Box>

                            <Box>
                                <Group justify="space-between" mb="xs">
                                    <Group gap="xs">
                                        <ThemeIcon color="cyan.5" size="sm" radius="xl"><IconDroplet size={12}/></ThemeIcon>
                                        <Text size="sm" fw={600}>Water</Text>
                                    </Group>
                                    <Text size="sm" fw={700}>{breakdown.water.toFixed(4)} € ({percents.water.toFixed(1)}%)</Text>
                                </Group>
                                <Progress value={percents.water} color="cyan.5" size="md" radius="xl" />
                            </Box>
                        </Stack>
                    </Grid.Col>
                </Grid>
            </Paper>

            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
                <Paper p="md" radius="md" withBorder bg="white">
                    <Group gap="sm">
                        <ThemeIcon size="xl" radius="md" variant="light" color="myColor">
                            <IconWind size={24} />
                        </ThemeIcon>
                        <div>
                            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Annual H₂ Production</Text>
                            <Text fw={700} size="lg">{metrics.annualProd.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} kg</Text>
                        </div>
                    </Group>
                </Paper>

                <Paper p="md" radius="md" withBorder bg="white">
                    <Group gap="sm">
                        <ThemeIcon size="xl" radius="md" variant="light" color="blue">
                            <IconBolt size={24} />
                        </ThemeIcon>
                        <div>
                            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Annual Energy Needed</Text>
                            <Text fw={700} size="lg">{(metrics.annualElec / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} MWh</Text>
                        </div>
                    </Group>
                </Paper>

                <Paper p="md" radius="md" withBorder bg="white">
                    <Group gap="sm">
                        <ThemeIcon size="xl" radius="md" variant="light" color="cyan">
                            <IconDroplet size={24} />
                        </ThemeIcon>
                        <div>
                            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Annual Water Needed</Text>
                            <Text fw={700} size="lg">
                                {(metrics.annualWater).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} Liters
                            </Text>
                        </div>
                    </Group>
                </Paper>
            </SimpleGrid>
        </Card>
    );
}