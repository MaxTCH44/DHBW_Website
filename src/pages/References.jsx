import { Container, Title, Text, Box, Paper } from '@mantine/core';

import ContentDetails from '../components/ContentDetails'; 
import referencesData from '../data/references.json'; 

/**
 * Renders the Scientific References & Sources bibliography page.
 * Displays a structured list of academic papers, institutional reports, and market data sources
 * that underpin the calculator's mathematical models and the platform's educational content.
 * It uses the `ContentDetails` engine to parse and render the `references.json` data.
 */
export default function References() { 
    return ( 
        <Container size="md" py="xl" mt="150px"> 
            <Box mb={50} ta="center"> 
                <Title order={1} c="dark.8" mb="sm">Scientific References & Sources</Title> 
                <Text size="lg" c="dimmed"> 
                    The data, models, and explanations used in our calculators and articles are based on peer-reviewed research, institutional reports, and industry standards. Explore the literature below. 
                </Text> 
            </Box> 
            
            <Paper shadow="sm" radius="md" withBorder p="xl" bg="white"> 
                <ContentDetails item={referencesData} /> 
            </Paper> 
        </Container> 
    );
}