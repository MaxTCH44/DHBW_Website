import { useState } from 'react';
import { Container, Title, Text, TextInput, Textarea, Button, Group, Paper, Box, Notification } from '@mantine/core';
import { IconSend,  IconCheck, IconX } from '@tabler/icons-react';
import emailjs from '@emailjs/browser';

const EMAILJS_SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

/**
 * Renders the Contact page.
 * Manages a local form state for user inquiries, implementing real-time email 
 * validation via Regex before allowing submission.
 */
export default function Contact() {
    
    // --- STATE ---
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [status, setStatus] = useState(null); // 'success' | 'error' | null
    const [loading, setLoading] = useState(false);

    // --- HANDLERS ---
    
    /**
     * Validates the email format using a standard Regex pattern.
     * Triggers both on blur (when the user leaves the input) and upon final form submission.
     * @param {string} value - The email string to validate.
     * @returns {boolean} True if valid, false otherwise.
     */
    function validateEmail(value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (value.length > 0 && !emailRegex.test(value)) {
            setEmailError('Please enter a valid email address (e.g. name@domain.com)');
            return false;
        }
        setEmailError('');
        return true;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        // Prevent submission if the email structure is invalid
        if (!validateEmail(email)) return;

        setLoading(true);
        setStatus(null);

        const form = e.currentTarget;
        console.log(e);

        const templateParams = {
            name:form.full_name.value,
            email:email,
            title:form.subject.value,
            message:form.message.value,
        };

        try {
            await emailjs.send(
                EMAILJS_SERVICE_ID,
                EMAILJS_TEMPLATE_ID,
                templateParams,
                EMAILJS_PUBLIC_KEY
            );
            setStatus('success');
            form.reset();
            setEmail('');
        } catch (err) {
            console.error('EmailJS error:', err);
            setStatus('error');
        } finally {
            setLoading(false);
        }
    }

    // --- RENDER ---
    return (
        <Container size="sm" py="xl" mt="150px">
            <Box ta="center" mb="xl">
                <Title order={1} c="dark.7" mb="sm">Contact Our Researchers</Title>
                <Text c="dimmed" size="lg">
                    Because every hydrogen and recycling system is unique, contacting our project researchers is highly recommended for proper understanding and implementation.
                </Text>
            </Box>

            {status === 'success' && (
                <Notification
                    icon={<IconCheck size={18} />}
                    color="teal"
                    title="Message sent!"
                    mb="md"
                    onClose={() => setStatus(null)}
                >
                    We'll get back to you as soon as possible.
                </Notification>
            )}

            {status === 'error' && (
                <Notification
                    icon={<IconX size={18} />}
                    color="red"
                    title="Something went wrong"
                    mb="md"
                    onClose={() => setStatus(null)}
                >
                    Please try again or contact us directly by email.
                    You can find them in the other section.
                </Notification>
            )}

            <Paper withBorder shadow="md" p="xl" radius="md">
                <form onSubmit={handleSubmit}>
                    <TextInput
                        name="full_name"
                        label="Full Name"
                        placeholder="Your Name"
                        required
                        mb="md"
                    />
                    <TextInput
                        name="email"
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
                        name="subject"
                        label="Subject"
                        placeholder="E.g., Recycling System Audit"
                        required
                        mb="md"
                    />
                    <Textarea
                        name="message"
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
                            loading={loading}
                            rightSection={!loading ? <IconSend size={18} /> : null}
                        >
                            Send Message
                        </Button>
                    </Group>
                </form>
            </Paper>
        </Container>
    );
}