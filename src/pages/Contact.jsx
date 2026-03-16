import { useState } from 'react';
import { Container, Title, Text, TextInput, Textarea, Button, Group, Paper, Box } from '@mantine/core';
import { IconSend } from '@tabler/icons-react';



export default function Contact() {
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');

    function validateEmail(value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (value.length > 0 && !emailRegex.test(value)) {
            setEmailError('Please enter a valid email address (e.g. name@domain.com)');
            return false;
        }
        setEmailError('');
        return true;
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (validateEmail(email)) {
            alert("Your message has been successfully submitted");
            document.getElementById("messageForm").reset();
            setEmail('');
        }
    }

    return (
        <Container size="sm" py="xl">
            <Box ta="center" mb="xl">
                <Title order={1} c="dark.7" mb="sm">Contact Our Researchers</Title>
                <Text c="dimmed" size="lg">
                    Because every hydrogen and recycling system is unique, contacting our project researchers is highly recommended for proper understanding and implementation.
                </Text>
            </Box>
            <Paper withBorder shadow="md" p="xl" radius="md">
                <form id="messageForm" onSubmit={handleSubmit}>
                    <TextInput 
                        label="Full Name" 
                        placeholder="John Doe" 
                        required 
                        mb="md"
                    />
                    <TextInput 
                        label="Email or Lab/Company Address" 
                        placeholder="your@email.com" 
                        required 
                        mb="md"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.currentTarget.value);
                            if (emailError) setEmailError('');
                        }}
                        onBlur={(e) => validateEmail(e.currentTarget.value)}
                        error={emailError} 
                    />
                    <TextInput 
                        label="Subject" 
                        placeholder="E.g., Recycling System Audit" 
                        required 
                        mb="md"
                    />
                    <Textarea
                        label="Your Message"
                        placeholder="Tell us about your current infrastructure, your gas mixtures, or any questions you have about our mathematical models."
                        minRows={5}
                        required
                        mb="xl"
                    />
                    <Group justify="flex-end">
                        <Button 
                            type="submit" 
                            size="md" 
                            rightSection={<IconSend size={18} />}
                        >
                            Send Message
                        </Button>
                    </Group>
                </form>
            </Paper>
        </Container>
    );
}