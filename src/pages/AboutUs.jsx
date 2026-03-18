import { Container, Title, Text } from "@mantine/core";

import aboutUs from "../data/about_us.json"

import ContentDetails from "../components/ContentDetails";
import { BarChart } from "@mantine/charts";



export default function AboutUs() {
    return(
        <Container>
            <Title order={1} mb="sm">{aboutUs.title}</Title>
            <Text size="lg" c="dimmed" maw={800} mx="auto">{aboutUs.description}</Text>
            <ContentDetails item={aboutUs} />
        </Container>
    )
}