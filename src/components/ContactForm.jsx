import { useState } from 'react';
import { Container, TextInput, Textarea, Button, Group, Paper, Notification } from '@mantine/core';
import { IconSend, IconCheck, IconX } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

export default function ContactForm({ link, label }) {
    const { t } = useTranslation("contact");

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
            setEmailError(t("contactForm.emailError"));
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
        
        // We pack the form data to send it to our local Node.js backend
        const formData = {
            name: form.full_name.value,
            email: email,
            subject: form.subject.value,
            message: form.message.value,
        };

        try {
            // Send the envelope (JSON) to our local post office (Node.js)
            const response = await fetch('http://localhost:3001/api/contact', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setStatus('success');
                form.reset();
                setEmail('');
            } else {
                setStatus('error');
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setStatus('error');
        } finally {
            setLoading(false);
        }
    }

    return (
        <Container>
            {status === 'success' && (
                <Notification
                    icon={<IconCheck size={18} />}
                    color="teal"
                    title={t("contactForm.success.title")}
                    mb="md"
                    onClose={() => setStatus(null)}
                >
                    {t("contactForm.success.description")}
                </Notification>
            )}

            {status === 'error' && (
                <Notification
                    icon={<IconX size={18} />}
                    color="red"
                    title={t("contactForm.error.title")}
                    mb="md"
                    onClose={() => setStatus(null)}
                >
                    {t("contactForm.error.description")}
                </Notification>
            )}

            <Paper withBorder shadow="md" p="xl" radius="md">
                <form onSubmit={handleSubmit}>
                    <TextInput
                        name="full_name"
                        label={t("contactForm.fields.fullName.label")}
                        placeholder={t("contactForm.fields.fullName.placeholder")}
                        required
                        mb="md"
                    />

                    <TextInput
                        name="email"
                        label={t("contactForm.fields.email.label")}
                        placeholder={t("contactForm.fields.email.placeholder")}
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
                        label={t("contactForm.fields.subject.label")}
                        placeholder={t("contactForm.fields.subject.placeholder")}
                        required
                        mb="md"
                    />

                    <Textarea
                        name="message"
                        label={t("contactForm.fields.message.label")}
                        placeholder={t("contactForm.fields.message.placeholder")}
                        minRows={5}
                        required
                        mb="xl"
                        autosize
                    />

                    <Group justify="flex-end">
                        <Button
                            type="submit"
                            size="md"
                            loading={loading}
                            rightSection={!loading ? <IconSend size={18} /> : null}
                        >
                            {t("contactForm.submit")}
                        </Button>
                    </Group>
                </form>
            </Paper>
        </Container>
    );
}