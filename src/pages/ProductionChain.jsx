import { Container, Title } from "@mantine/core";
import { AreaChart } from "@mantine/charts";
import { useSearchParams } from "react-router-dom"; 
import { useState } from "react";
import { IconWindmill, IconDroplet, IconCylinder, IconCar, IconBuildingWarehouse, IconFlame } from '@tabler/icons-react';

import production_data from "../data/learn/hydrogen_production_chain.json";

import ContentDetails from "../components/ContentDetails";
import LinkButton from "../components/LinkButton";

import InteractiveFlow from "../schematics/production_chain/InteractiveFlow";
import PemFuelCell from "../schematics/production_chain/PemFuelCell";
import ChpFuelCell from "../schematics/production_chain/ChpFuelCell";

// --- COMPONENT & ICON REGISTRIES ---
// These maps allow the JSON data to dynamically reference icons and complex React components 
// (like interactive fuel cell SVGs or D3 Charts) without tightly coupling the data file to the source code.
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
    PemFuelCell,
    ChpFuelCell
};

/**
 * Renders the interactive Hydrogen Production Chain documentation page.
 * It features a clickable flowchart where selecting a node updates the detailed content below it.
 * * Note: It utilizes `useSearchParams` to persist the active selected step in the URL, 
 * allowing users to share direct links to specific stages of the production chain.
 */
export default function ProductionChain() {
    
    // URL state management: allows deep-linking directly to a specific step like '?step=compression'
    const [searchParams, setSearchParams] = useSearchParams();

    /**
     * Helper function to find a specific node in the production chain data array.
     */
    const findItemById = (id) => {
        return production_data.find(item => item.id === id) || null;
    };

    // Initialize the active step from the URL parameter, or fallback to the first step in the JSON
    const initialStepId = searchParams.get("step") || production_data[0].id;
    
    const [selectedItem, setSelectedItem] = useState(
        findItemById(initialStepId) || production_data[0]
    );

    /**
     * Handles clicks on the InteractiveFlow nodes.
     * Updates both the local React state (for immediate UI updates) and the URL query parameter.
     */
    const handleNodeClick = (item) => {
        setSelectedItem(item);
        setSearchParams({ step: item.id });
    };

    return(
        <Container size="xl" mt="150px">
            <Title order={1} mb="xl">Green H₂ Production Chain</Title>
            
            {/* The visual flowchart component that acts as the primary navigation for this page */}
            <InteractiveFlow 
                data={production_data} 
                iconMap={ICON_MAP} 
                selectedItem={selectedItem}
                onNodeClick={handleNodeClick}
            />
            
            {/* The dynamic content section that updates based on the clicked flowchart node */}
            <ContentDetails item={selectedItem} componentList={COMPONENT_REGISTRY}/>

        </Container>
    );
}