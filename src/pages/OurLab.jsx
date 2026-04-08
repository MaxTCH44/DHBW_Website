import { Container, Title, Text } from "@mantine/core";

import ourLab from "../data/our_lab.json"

import ContentDetails from "../components/ContentDetails";



export default function OurLab() {
    return(
        <Container mt="150px">
            <Title order={1} mb="sm">{ourLab.title}</Title>
            <Text size="lg" c="dimmed" maw={800} mx="auto">{ourLab.description}</Text>
            <ContentDetails item={ourLab} />
        </Container>
    )
}