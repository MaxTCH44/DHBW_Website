import { useState, useEffect } from "react";
import { Container, Title, Text, Group, Button } from "@mantine/core";

import ContentDetails from "../components/ContentDetails";
import ProsConsCards from "../components/ProsConsCards";

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