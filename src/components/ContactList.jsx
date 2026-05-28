import { useState } from 'react';
import { Text, Container, Card, Collapse, Anchor, Group, Avatar, Box } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import { IconMapPin, IconPhone, IconPhoneCall, IconMail } from '@tabler/icons-react';

import contactList from "../data/contact_list.json"


function ContactCard({ contact }) {

    const { t } = useTranslation("contact");

    const [opened, setOpened] = useState(false);

    return (

        <Card withBorder style={{ borderColor: 'var(--mantine-color-green-6)' }} mb="md">
            <Anchor
                component="button"
                type="button"
                size="sm"
                c="dimmed"
                mb="sm"
                mt={opened ? "xs" : ""}
                onClick={() => setOpened((o) => !o)}
            >
                <Text c="black" fw={500}>{contact.name}</Text>
                {contact.role.map((role) => (
                    <Text key={role} c="dimmed" size="xs">{t(role)}</Text>
                ))}
            </Anchor>

            <Collapse in={opened}>
                <Group 
                    justify="space-between" 
                    align="center" 
                    wrap="wrap" 
                    mt="md" 
                >
                    <Card p={0} style={{ flex: '1 1 300px' }}> 
                        <Group gap="xs" align="flex-start" mb="xs" wrap="nowrap">
                            <IconMapPin size={16} style={{ marginTop: 2, flexShrink: 0 }} />
                            <Text size="sm">{t(contact.place)}</Text>
                        </Group>

                        <Group gap="xs" mb="xs" wrap="nowrap">
                            <IconPhone size={16} style={{ flexShrink: 0 }} />
                            <Text size="sm">{contact.mobile}</Text>
                        </Group>

                        <Group gap="xs" mb="xs" wrap="nowrap">
                            <IconPhoneCall size={16} style={{ flexShrink: 0 }} />
                            <Text size="sm">{contact.landline}</Text>
                        </Group>

                        <Group gap="xs" mb="xs" wrap="nowrap">
                            <IconMail size={16} style={{ flexShrink: 0 }} />
                            <Text size="sm" style={{ wordBreak: 'break-word' }}>{contact.mail}</Text>
                        </Group>
                    </Card>

                    <Box style={{ flex: '0 0 auto', margin: '0 auto' }}>
                        <Avatar
                            src={contact.photo}
                            size="150"
                            radius="md"
                        />
                    </Box>
                </Group>
            </Collapse>

        </Card>
    );
}

export default function ContactList() {
    return (
        <Container>
            {contactList.map((contact) => (
                <ContactCard key={contact.name} contact={contact} />
            ))}
        </Container>
    );
}