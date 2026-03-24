import { Container, Title, Text, Box, Paper } from "@mantine/core";
import ContentDetails from "../components/ContentDetails";
import recyclingProcessData from "../data/recycling_process.json";

export default function RecyclingProcess() {
    return (
        <Container size="md" py="xl">
            <Box mb={50} ta="center">
                <Title order={1} c="dark.8" mb="sm">The Hydrogen Recycling Process</Title>
                <Text size="lg" c="dimmed">
                    Explore the technologies used by modern industries to capture, purify, and regenerate hydrogen, driving both economic efficiency and circularity.
                </Text>
            </Box>
            <ContentDetails item={recyclingProcessData} />
        </Container>
    );
}