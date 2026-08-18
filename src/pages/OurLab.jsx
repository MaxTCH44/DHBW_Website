import { Container, Title, Text } from "@mantine/core";
import { useTranslation } from 'react-i18next';

import ourLab from "../data/our_lab.json"
import ContentDetails from "../components/ContentDetails";

/**
 * Renders the "Our Lab" presentation page.
 * This is a highly static page driven entirely by the `our_lab.json` data file,
 * utilizing the dynamic `ContentDetails` component to parse and display the layout.
 */
export default function OurLab() {
    const { t } = useTranslation("ourLab");
    return(
        <Container mt="150px">
            <Title order={1} mb="sm">{t(ourLab.title)}</Title>
            <Text size="lg" c="#495057" maw={800} mx="auto">{t(ourLab.description)}</Text>
            
            {/* Feeds the entire JSON payload to the dynamic rendering engine */}
            <ContentDetails item={ourLab} namespace="ourLab"/>
        </Container>
    )
}