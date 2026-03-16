import { Container, Title, Text } from "@mantine/core";
import { useState } from "react";
import { IconWindmill, IconDroplet, IconCylinder, IconCar, IconBuildingWarehouse,IconFlame } from '@tabler/icons-react';

import production_data from "../data/hydrogen_production_chain.json";

import InteractiveFlow from "../components/InteractiveFlow";



const ICON_MAP = {
    IconWindmill,
    IconDroplet,
    IconCylinder,
    IconCar,
    IconBuildingWarehouse,
    IconFlame
};

export default function ProductionChain() {
    const [selectedItem, setSelectedItem] = useState(production_data[0].items[0]);

    return(
        <Container size="xl" mt="xl">
            <Title order={1} mb="xl">Production Chain</Title>
            
            <InteractiveFlow 
                data={production_data} 
                iconMap={ICON_MAP} 
                selectedItem={selectedItem}
                onNodeClick={setSelectedItem} 
            />

            <Title size="lg" mt="lg" mb="lg" > {selectedItem.label} </Title>
            <Text size="md">
                {selectedItem.content}
            </Text>

        </Container>
    );
}