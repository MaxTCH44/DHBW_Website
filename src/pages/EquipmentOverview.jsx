import { useState, useEffect } from "react";
import { Container, Title, Text, Group, Button } from "@mantine/core";

import ContentDetails from "../components/ContentDetails";
import ProsConsCards from "../components/ProsConsCards";

import PemElectrolyzer from "../schematics/PemElectrolyzer";
import AlkalineElectrolyzer from "../schematics/AlkalineElectrolyzer";
import AemElectrolyzer from "../schematics/AemElectrolyzer";
import SoecElectrolyzer from "../schematics/SoecElectrolyzer";
import MechanicalCompressor from "../schematics/MechanicalCompressor";
import EhcCompressor from "../schematics/EhcCompressor";



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
        <Container size="xl" mt="xl">
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