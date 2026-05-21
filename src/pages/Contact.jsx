import { useState } from 'react';
import { Container, Title, Text, Box, SegmentedControl } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import ContactForm from '../components/ContactForm.jsx';
import ContactList from '../components/ContactList.jsx';

/**
 * Renders the Contact page.
 * Manages a local form state for user inquiries, implementing real-time email 
 * validation via Regex before allowing submission.
 */
export default function Contact() {

    const { t } = useTranslation("contact");

    const [showPeople, setShowPeople] = useState(false);

    // --- RENDER ---
    return (
        <Container size="sm" py="xl" mt="150px">
            <Box ta="center" mb="xl">
                <Title order={1} c="dark.7" mb="sm">{t("title")}</Title>
                <Text c="dimmed" size="lg">
                    {t("introText")}
                </Text>
            </Box>

            <SegmentedControl
                value={showPeople ? 'people' : 'email'}
                onChange={(val) => setShowPeople(val === 'people')}
                data={[
                    { label: t("segmentedControl.contactFormLabel"), value: 'email' },
                    { label: t("segmentedControl.contactListLabel"), value: 'people' },
                ]}
                bg="green.1"
                mb="md"
            />

            {showPeople ? <ContactList /> : <ContactForm />}

       </Container>
    );
}