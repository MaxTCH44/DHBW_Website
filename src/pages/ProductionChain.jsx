import { Container, Title } from "@mantine/core";
import { AreaChart } from "@mantine/charts";
import { useSearchParams } from "react-router-dom"; 
import { useState } from "react";
import { IconWindmill, IconDroplet, IconCylinder, IconCar, IconBuildingWarehouse, IconFlame } from '@tabler/icons-react';

import production_data from "../data/hydrogen_production_chain.json";

import ContentDetails from "../components/ContentDetails";
import LinkButton from "../components/LinkButton";

import InteractiveFlow from "../schematics/InteractiveFlow";
import PemFuelCell from "../schematics/PemFuelCell";

const ICON_MAP = {
    IconWindmill,
    IconDroplet,
    IconCylinder,
    IconCar,
    IconBuildingWarehouse,
    IconFlame
};

const COMPONENT_REGISTRY = {
    AreaChart,
    LinkButton,
    PemFuelCell
};

export default function ProductionChain() {
    const [searchParams, setSearchParams] = useSearchParams();

    const findItemById = (id) => {
        return production_data.find(item => item.id === id) || null;
    };

    const initialStepId = searchParams.get("step") || production_data[0].id;
    
    const [selectedItem, setSelectedItem] = useState(
        findItemById(initialStepId) || production_data[0]
    );

    const handleNodeClick = (item) => {
        setSelectedItem(item);
        setSearchParams({ step: item.id });
    };

    return(
        <Container size="xl" mt="xl">
            <Title order={1} mb="xl">Green H₂ Production Chain</Title>
            
            <InteractiveFlow 
                data={production_data} 
                iconMap={ICON_MAP} 
                selectedItem={selectedItem}
                onNodeClick={handleNodeClick}
            />

            <ContentDetails item={selectedItem} componentList={COMPONENT_REGISTRY}/>

        </Container>
    );
}