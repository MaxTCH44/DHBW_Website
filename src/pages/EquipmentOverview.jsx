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



const COMPONENT_REGISTRY = {
    PemElectrolyzer,
    AlkalineElectrolyzer,
    AemElectrolyzer,
    SoecElectrolyzer,
    MechanicalCompressor,
    EhcCompressor
};

export default function EquipmentOverview({ equipmentList }) {
    const [selectedItem, setSelectedItem] = useState(equipmentList.list[0]);

    useEffect(() => {
        setSelectedItem(equipmentList.list[0]);
    }, [equipmentList]);

    return (
        <Container size="xl" mt="150px">
            <Title order={1} mb="xl">{equipmentList.title}</Title>
            <Text size="md" mb="xl">{equipmentList.introText}</Text>
            
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
            <Title order={2} mt="xl" mb="xl"> {selectedItem.label} </Title>
            <ContentDetails item={selectedItem} componentList={COMPONENT_REGISTRY}/>
            <ProsConsCards item={selectedItem} />
        </Container> 
    );
}