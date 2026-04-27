import { Container, Title, Text, Box, Paper } from "@mantine/core"; 

import recyclingProcessData from "../data/learn/recycling_process.json";
import ContentDetails from "../components/ContentDetails";
import EhcRecycling from "../schematics/recycling/EhcRecycling"; 
import PsaPurifier from "../schematics/recycling/PsaPurifier"; 

// --- COMPONENT REGISTRY ---
// Maps the string names defined in the JSON file to the actual interactive SVG React components.
// This allows the ContentDetails engine to dynamically inject complex interactive visuals directly between text paragraphs.
const COMPONENT_REGISTRY = { EhcRecycling, PsaPurifier };

/**
 * Renders the educational page detailing the Hydrogen Recycling Process.
 * This component acts as a static layout wrapper that feeds the structured `recycling_process.json`
 * data into the `ContentDetails` engine to render the article and its interactive schematics.
 */
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