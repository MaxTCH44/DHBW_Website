import { Container, Title, Text } from "@mantine/core";
import { useState } from "react";
import InteractiveFlow from "../components/InteractiveFlow";
import production_data from "../data/hydrogen_production_chain.json";

import { 
    IconWindmill, 
    IconDroplet, 
    IconCylinder, 
    IconCar, 
    IconBuildingWarehouse,
    IconFlame 
} from '@tabler/icons-react';

const iconMap = {
    "IconWindmill": IconWindmill,
    "IconDroplet": IconDroplet,
    "IconCylinder": IconCylinder,
    "IconCar": IconCar,
    "IconBuildingWarehouse": IconBuildingWarehouse,
    "IconFlame": IconFlame
};

export default function ProductionChain() {
    const [selectedItem, setSelectedItem] = useState(production_data[0].items[0]);

    return(
        <Container size="xl" mt="xl">
            <Title order={1} mb="xl">Production Chain</Title>
            
            <InteractiveFlow 
                data={production_data} 
                iconMap={iconMap} 
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