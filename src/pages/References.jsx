import { Container, Title, Text, Box, Paper } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import ContentDetails from '../components/ContentDetails'; 
import referencesData from '../data/references.json'; 

/**
 * Renders the Scientific References & Sources bibliography page.
 * Displays a structured list of academic papers, institutional reports, and market data sources
 * that underpin the calculator's mathematical models and the platform's educational content.
 * It uses the `ContentDetails` engine to parse and render the `references.json` data.
 */
export default function References() { 
    const { t } = useTranslation("references");
    return ( 
        <Container size="md" py="xl" mt="150px"> 
            <Box mb={50} ta="center"> 
                <Title order={1} c="dark.8" mb="sm">{t("title")}</Title> 
                <Text size="lg" c="dimmed"> 
                    {t("introText")} 
                </Text> 
            </Box> 
            
            <Paper shadow="sm" radius="md" withBorder p="xl" bg="white"> 
                <ContentDetails item={referencesData} namespace='references'/> 
            </Paper> 
        </Container> 
    );
}