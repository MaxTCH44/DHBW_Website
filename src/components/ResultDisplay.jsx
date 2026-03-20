import { Card, Title, Group, Paper, Text, Badge, SimpleGrid } from '@mantine/core';

export default function ResultDisplay({ cost, capex, costDifference, annualDifference }) {
    const isProfitable = costDifference >= 0;

    return (
        <Card shadow="md" padding="xl" radius="md" withBorder mt="xl" bg="myColor.0" style={{ borderColor: 'var(--mantine-color-myColor-3)' }}>
            <Title order={2} mb="md" c="myColor.9">
                Estimated Results
            </Title>
            
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                <Paper p="md" radius="md" withBorder bg="white">
                    <Text size="sm" c="dimmed" fw={500} mb="xs">
                        Levelized Cost of Hydrogen (LCOH)
                    </Text>
                    <Text size="xl" fw={900} c="myColor.9">
                        {cost > 0 && isFinite(cost) ? cost.toFixed(2) : "0.00"} € / kg
                    </Text>
                    
                    <Group align="center" gap="xs" mt="md">
                        <Text size="sm" fw={500} c="dark.7">
                            Total Investment (CAPEX) :
                        </Text>
                        <Text size="md" c="red" variant="light" fw={900}>
                            {capex.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
                        </Text>
                    </Group>
                </Paper>

                <Paper p="md" radius="md" withBorder bg="white">
                    <Text size="sm" c="dimmed" fw={500} mb="xs">
                        {isProfitable ? "Estimated Savings vs Grey H₂" : "Green Premium (Extra Cost) vs Grey H₂"}
                    </Text>
                    <Text size="xl" fw={900} c={isProfitable ? "teal.6" : "red.6"}>
                        {isProfitable ? "+" : ""}
                        {(isFinite(annualDifference) && annualDifference !== 0) ? annualDifference.toLocaleString('fr-FR', { maximumFractionDigits: 0 }) : "0"} € / year
                    </Text>
                    
                    <Badge color={isProfitable ? "teal" : "red"} mt="sm" size="lg">
                        {isProfitable ? "+" : ""}
                        {isFinite(costDifference) ? costDifference.toFixed(2) : "0.00"} € per kg
                    </Badge>
                </Paper>
            </SimpleGrid>
        </Card>
    );
}