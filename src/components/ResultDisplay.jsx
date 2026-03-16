import { Card, Title, Group, Paper, Text, Badge } from '@mantine/core';



export default function ResultDisplay({ cost, capex }) {
    return (
        <Card shadow="md" padding="xl" radius="md" withBorder mt="xl" bg="myColor.0" style={{ borderColor: 'var(--mantine-color-myColor-3)' }}>
            <Title order={2} mb="md" c="myColor.9">
                Estimated Results
            </Title>
            <Group align="center" mb="md">
                <Text size="xl" fw={700} c="myColor.9">
                    Estimated cost: {cost} €/kg
                </Text>
            </Group>
            <Paper p="md" radius="md" withBorder>
                <Group align="center" gap="xs">
                    <Text size="lg" fw={500} c="dark.7">
                        Total Investment (CAPEX) :
                    </Text>
                    <Text size="xl" c="red" variant="light" fw={900} >
                        {capex.toLocaleString()} €
                    </Text>
                </Group>
            </Paper>
        </Card>
    );
}