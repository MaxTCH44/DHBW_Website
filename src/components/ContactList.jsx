import { useState } from 'react';
import { Text, Container, Card, Collapse, Anchor, Group, Avatar } from '@mantine/core';

import { IconMapPin, IconPhone, IconPhoneCall, IconMail } from '@tabler/icons-react';

import contactList from "../data/contact_list.json"


function ContactCard({ contact }) {
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
                    <Text key={role} c="dimmed" size="xs">{role}</Text>
                ))}
            </Anchor>

            <Collapse in={opened}>
                <Group justify="space-between" align="flex-start">
                    <Card>
                        <Group gap="xs" align="flex-start" mb="xs">
                            <IconMapPin size={16} style={{ marginTop: 2, flexShrink: 0 }} />
                            <Text size="sm">{contact.place}</Text>
                        </Group>

                        <Group gap="xs" mb="xs">
                            <IconPhone size={16} style={{ flexShrink: 0 }} />
                            <Text size="sm">{contact.mobile}</Text>
                        </Group>

                        <Group gap="xs" mb="xs">
                            <IconPhoneCall size={16} style={{ flexShrink: 0 }} />
                            <Text size="sm">{contact.landline}</Text>
                        </Group>

                        <Group gap="xs" mb="xs">
                            <IconMail size={16} style={{ flexShrink: 0 }} />
                            <Text size="sm">{contact.mail}</Text>
                        </Group>
                    </Card>

                    <Avatar
                        src={contact.photo}
                        size="150"
                        radius="md"
                    />
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