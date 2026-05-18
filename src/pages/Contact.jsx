import { useState } from 'react';
import { Container, Title, Text, Box, SegmentedControl } from '@mantine/core';

import ContactForm from '../components/ContactForm.jsx';
import ContactList from '../components/ContactList.jsx';

/**
 * Renders the Contact page.
 * Manages a local form state for user inquiries, implementing real-time email 
 * validation via Regex before allowing submission.
 */
export default function Contact() {

    const [showPeople, setShowPeople] = useState(false);

    // --- RENDER ---
    return (
        <Container size="sm" py="xl" mt="150px">
            <Box ta="center" mb="xl">
                <Title order={1} c="dark.7" mb="sm">Contact Our Researchers</Title>
                <Text c="dimmed" size="lg">
                    Because every hydrogen and recycling system is unique, contacting our project researchers is highly recommended for proper understanding and implementation.
                </Text>
            </Box>

            <SegmentedControl
                value={showPeople ? 'people' : 'email'}
                onChange={(val) => setShowPeople(val === 'people')}
                data={[
                    { label: 'Contact Form', value: 'email' },
                    { label: 'Contact List', value: 'people' },
                ]}
                bg="green.1"
                mb="md"
            />

            {showPeople ? <ContactList /> : <ContactForm />}

       </Container>
    );
}