import { Container, Title, Text, Box, Paper } from "@mantine/core";

import recyclingProcessData from "../data/learn/recycling_process.json";

import ContentDetails from "../components/ContentDetails";

import EhcRecycling from "../schematics/recycling/EhcRecycling";
import PsaPurifier from "../schematics/recycling/PsaPurifier";



const COMPONENT_REGISTRY = {
    EhcRecycling,
    PsaPurifier
};

export default function RecyclingProcess() {
    return (
        <Container size="xl" py="xl" mt="150px">
            <Box mb={50} ta="center">
                <Title order={1} c="dark.8" mb="sm">The Hydrogen Recycling Process</Title>
                <Text size="lg" c="dimmed">
                    Explore the technologies used by modern industries to capture, purify, and regenerate hydrogen, driving both economic efficiency and circularity.
                </Text>
            </Box>
            <ContentDetails item={recyclingProcessData} componentList={COMPONENT_REGISTRY} />
        </Container>
    );
}