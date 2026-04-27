import { useState, useEffect } from "react";
import { Container, Title, Text, Group, Button } from "@mantine/core";

import ContentDetails from "../components/ContentDetails";
import ProsConsCards from "../components/ProsConsCards";

import PemElectrolyzer from "../schematics/electrolyzers/PemElectrolyzer";
import AlkalineElectrolyzer from "../schematics/electrolyzers/AlkalineElectrolyzer";
import AemElectrolyzer from "../schematics/electrolyzers/AemElectrolyzer";
import SoecElectrolyzer from "../schematics/electrolyzers/SoecElectrolyzer";
import MechanicalCompressor from "../schematics/compressors/MechanicalCompressor";
import EhcCompressor from "../schematics/compressors/EhcCompressor";

// --- COMPONENT REGISTRY ---
// A dictionary mapping string names (defined in the JSON data) to actual React components.
// This allows the JSON files to dynamically inject complex interactive SVG schematics into the documentation.
const COMPONENT_REGISTRY = {
    PemElectrolyzer,
    AlkalineElectrolyzer,
    AemElectrolyzer,
    SoecElectrolyzer,
    MechanicalCompressor,
    EhcCompressor
};

/**
 * A highly reusable documentation template page. 
 * It dynamically renders an overview of industrial equipment (like Electrolyzers or Compressors) 
 * solely based on the JSON `equipmentList` provided to it. 
 * * @param {Object} props
 * @param {Object} props.equipmentList - The master JSON object containing the category title, intro, and the list of specific equipment models.
 */
export default function EquipmentOverview({ equipmentList }) {
    
    // Default to displaying the first item in the provided JSON list
    const [selectedItem, setSelectedItem] = useState(equipmentList.list[0]);

    // Reset the active tab back to the first item if the user switches to a completely different equipment category
    useEffect(() => {
        setSelectedItem(equipmentList.list[0]);
    }, [equipmentList]);

    return (
        <Container size="xl" mt="150px">
            {/* --- PAGE HEADER --- */}
            <Title order={1} mb="xl">{equipmentList.title}</Title>
            <Text size="md" mb="xl">{equipmentList.introText}</Text>
            
            {/* --- NAVIGATION TABS --- */}
            {/* Renders a row of buttons allowing the user to toggle between different hardware variants (e.g., PEM, Alkaline, AEM) */}
            <Group justify="center" mb="xl" pb="lg">
                {equipmentList.list.map((e) =>
                    <Button 
                        variant={e.id === selectedItem.id ? "light" : "filled"} 
                        key={e.id} 
                        onClick={() => setSelectedItem(e)}
                    >
                        {e.label}
                    </Button>
                )}
            </Group>

            {/* --- DYNAMIC CONTENT --- */}
            {/* The title, text paragraphs, and interactive schematics change entirely based on the clicked tab */}
            <Title order={2} mt="xl" mb="xl">
                {selectedItem.label}
            </Title>

            <ContentDetails item={selectedItem} componentList={COMPONENT_REGISTRY}/>
            <ProsConsCards item={selectedItem} />
            
        </Container>
    );
}