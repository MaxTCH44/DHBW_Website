import { useState } from "react";
import { Container, Title, Text, Group, Button } from "@mantine/core";
import ContentDetails from "../components/ContentDetails";
import ProsConsCards from "../components/ProsConsCards";
import electrolyzersData from "../data/types_of_electrolyzers.json";

export default function Electrolyzers() {
    const [selectedItem, setSelectedItem] = useState(electrolyzersData.electrolyzers[0]);

    return (
        <Container size="xl" mt="xl">
            <Title order={1} mb="xl">Types of electrolyzers</Title>
            <Text size="md" mb="xl">{electrolyzersData.introText}</Text>
            
            <Group justify="center" mb="xl" pb="lg">
                {electrolyzersData.electrolyzers.map((e) =>
                    <Button 
                        variant={e.id === selectedItem.id ? "outline" : "filled"} 
                        key={e.id} 
                        onClick={() => setSelectedItem(e)}
                    >
                        {e.label}
                    </Button>
                )}
            </Group>
            <Title size="lg" mt="xl" mb="xl"> {selectedItem.label} </Title>
            <ContentDetails item={selectedItem} />
            <ProsConsCards item={selectedItem} />
        </Container> 
    );
}