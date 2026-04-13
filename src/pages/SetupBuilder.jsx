import { useState } from 'react';
import { Container, Title, TextInput, Select, Button, Card, Text, Group, Stack, ActionIcon, Grid, Badge, Divider, Box, Paper } from '@mantine/core';
import { IconPlus, IconTrash, IconServerCog } from '@tabler/icons-react';

import ValueInput from '../components/ValueInput.jsx'; 

export default function SetupBuilder() {
    // 1. L'état qui stocke la liste de tous nos setups
    const [setups, setSetups] = useState([]);
    
    // 2. Les états du formulaire principal
    const [name, setName] = useState('');
    const [type, setType] = useState('PEM');
    const [power, setPower] = useState(2.4);
    const [price, setPrice] = useState(35000);
    const [energyConsumption, setEnergyConsumption] = useState(53.4);
    const [waterConsumption, setWaterConsumption] = useState(1.26); // NOUVEAU : Eau principale
    const [maintenance, setMaintenance] = useState(5);
    const [lifetime, setLifetime] = useState(35000);

    // 3. NOUVEAU : Les états du mini-formulaire pour un Auxiliaire
    const [auxiliaries, setAuxiliaries] = useState([]);
    const [auxName, setAuxName] = useState('');
    const [auxPrice, setAuxPrice] = useState('');
    const [auxPower, setAuxPower] = useState(''); 
    const [auxWater, setAuxWater] = useState(''); 
    const [auxMaintenance, setAuxMaintenance] = useState(2); 

    // Ajouter un équipement auxiliaire à la liste de construction
    const handleAddAuxiliary = () => {
        if (!auxName.trim()) return;
        setAuxiliaries([...auxiliaries, {
            id: Date.now(),
            name: auxName,
            price: auxPrice,
            power: auxPower,
            water: auxWater,
            maintenance: auxMaintenance
        }]);
        // Reset des champs de l'auxiliaire pour le prochain
        setAuxName('');
        setAuxPrice('');
        setAuxPower('');
        setAuxWater('');
        setAuxMaintenance(2);
    };

    const handleRemoveAuxiliary = (id) => {
        setAuxiliaries(auxiliaries.filter(a => a.id !== id));
    };

    // Fonction pour sauvegarder le setup final
    const handleAddSetup = () => {
        if (!name.trim()) return; 
        
        // Calcul des totaux des équipements auxiliaires
        const totalAuxPrice = auxiliaries.reduce((sum, aux) => sum + aux.price, 0);
        const totalAuxPower = auxiliaries.reduce((sum, aux) => sum + aux.power, 0);
        const totalAuxWater = auxiliaries.reduce((sum, aux) => sum + aux.water, 0);
        
        const newSetup = {
            id: Date.now(),
            name: name,
            type: type,
            // On additionne les valeurs de base et celles des auxiliaires
            price: price + totalAuxPrice,
            power: power, 
            energy_consumption_kwh_per_kg: energyConsumption,
            maintenance_percent_capex: maintenance,
            stack_lifetime_hours: lifetime,
            
            // Les nouveaux totaux
            water_consumption_l_per_h: waterConsumption + totalAuxWater,
            total_auxiliary_consumption: totalAuxPower,
            
            // On sauvegarde la liste pour l'affichage décalé
            auxiliariesList: [...auxiliaries]
        };
        
        setSetups([...setups, newSetup]);
        
        // On vide le nom pour pouvoir faire une variante
        setName('');
    };

    const handleDeleteSetup = (idToRemove) => {
        setSetups(setups.filter(s => s.id !== idToRemove));
    };

    return (
        <Container size="xl" py="xl">
            <Group mb="xl">
                <IconServerCog size={32} color="var(--mantine-color-blue-6)" />
                <Title order={2}>Electrolyzer Setup Builder</Title>
            </Group>
            
            <Grid gutter="xl">
                {/* --- COLONNE GAUCHE : LE FORMULAIRE --- */}
                <Grid.Col span={{ base: 12, md: 5 }}>
                    <Card withBorder shadow="sm" radius="md">
                        <Title order={4} mb="md">Create New Setup</Title>
                        
                        <Stack gap="md">
                            <TextInput 
                                label="Configuration Name" 
                                placeholder="e.g., Test Plant Alpha"
                                value={name}
                                onChange={(e) => setName(e.currentTarget.value)}
                                required
                            />
                            
                            <Select
                                label="Technology Type"
                                data={['PEM', 'AEM', 'Alkaline', 'SOEC']}
                                value={type}
                                onChange={setType}
                            />
                            
                            <Divider my="xs" label="Electrolyzer Specs" labelPosition="center" />

                            <ValueInput label="System Power" value={power} onValueChange={setPower} units={[{ label: "kW", factor: 1 }]} currentUnit={{ label: "kW", factor: 1 }} />
                            <ValueInput label="Energy Consumption" value={energyConsumption} onValueChange={setEnergyConsumption} units={[{ label: "kWh/kg", factor: 1 }]} currentUnit={{ label: "kWh/kg", factor: 1 }} />
                            <ValueInput label="Water Consumption" value={waterConsumption} onValueChange={setWaterConsumption} units={[{ label: "L/h", factor: 1 }]} currentUnit={{ label: "L/h", factor: 1 }} />
                            
                            <Divider my="xs" label="Financials" labelPosition="center" />

                            <ValueInput label="Stack Price (CAPEX)" value={price} onValueChange={setPrice} units={[{ label: "€", factor: 1 }]} currentUnit={{ label: "€", factor: 1 }} />
                            <ValueInput label="Annual Maintenance" value={maintenance} onValueChange={setMaintenance} units={[{ label: "% CAPEX", factor: 1 }]} currentUnit={{ label: "% CAPEX", factor: 1 }} />
                            <ValueInput label="Stack Lifetime" value={lifetime} onValueChange={setLifetime} units={[{ label: "hours", factor: 1 }]} currentUnit={{ label: "hours", factor: 1 }} />

                            {/* --- SECTION DES AUXILIAIRES --- */}
                            <Divider my="xs" label="Auxiliary Equipments (BOP)" labelPosition="center" />
                            
                            {/* Affichage des auxiliaires en cours d'ajout */}
                            {auxiliaries.length > 0 && (
                                <Stack gap="xs">
                                    {auxiliaries.map(aux => (
                                        <Group key={aux.id} justify="space-between" bg="light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-6))" p="xs" style={{ borderRadius: 'var(--mantine-radius-sm)' }}>
                                            <div style={{ flex: 1 }}>
                                                <Text size="sm" fw={500}>{aux.name}</Text>
                                                <Text size="xs" c="dimmed">
                                                    ⚡ {aux.power} kW | 💧 {aux.water} L/h | 💶 {aux.price} €
                                                </Text>
                                            </div>
                                            <ActionIcon color="red" variant="subtle" onClick={() => handleRemoveAuxiliary(aux.id)}>
                                                <IconTrash size={16} />
                                            </ActionIcon>
                                        </Group>
                                    ))}
                                </Stack>
                            )}

                            {/* Le mini-formulaire pour ajouter un composant */}
                            <Paper withBorder p="sm" radius="md" bg="light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-8))">
                                <Text size="sm" fw={600} mb="xs">Add Component (Chiller, Dryer, etc.)</Text>
                                <Grid gutter="xs">
                                    <Grid.Col span={12}>
                                        <TextInput placeholder="Component Name" value={auxName} onChange={(e) => setAuxName(e.currentTarget.value)} />
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                        <ValueInput label="Added Power" value={auxPower} onValueChange={setAuxPower} units={[{ label: "kW", factor: 1 }]} currentUnit={{ label: "kW", factor: 1 }} />
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                        <ValueInput label="Added Water" value={auxWater} onValueChange={setAuxWater} units={[{ label: "L/h", factor: 1 }]} currentUnit={{ label: "L/h", factor: 1 }} />
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                        <ValueInput label="Added CAPEX" value={auxPrice} onValueChange={setAuxPrice} units={[{ label: "€", factor: 1 }]} currentUnit={{ label: "€", factor: 1 }} />
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                        <ValueInput label="Maintenance" value={auxMaintenance} onValueChange={setAuxMaintenance} units={[{ label: "%", factor: 1 }]} currentUnit={{ label: "%", factor: 1 }} />
                                    </Grid.Col>
                                </Grid>
                                <Button fullWidth variant="light" mt="sm" leftSection={<IconPlus size={14} />} onClick={handleAddAuxiliary} disabled={!auxName.trim() || !auxPower || !auxPrice || !auxWater || !auxMaintenance}>
                                    Add to Setup
                                </Button>
                            </Paper>

                            <Button 
                                size="md"
                                color="blue"
                                mt="md"
                                onClick={handleAddSetup}
                                disabled={!name.trim()} 
                            >
                                Save Complete Setup
                            </Button>
                        </Stack>
                    </Card>
                </Grid.Col>

                {/* --- COLONNE DROITE : LA LISTE DES SETUPS --- */}
                <Grid.Col span={{ base: 12, md: 7 }}>
                    <Group justify="space-between" mb="md">
                        <Title order={4}>Saved Configurations</Title>
                        <Badge size="lg" radius="sm">{setups.length} Setups</Badge>
                    </Group>
                    
                    {setups.length === 0 ? (
                        <Card withBorder padding="xl" ta="center" bg="var(--mantine-color-gray-0)">
                            <Text c="dimmed">No setups stored in memory yet.<br/>Create your first configuration on the left.</Text>
                        </Card>
                    ) : (
                        <Stack gap="sm">
                            {setups.map(setup => (
                                <Card key={setup.id} withBorder shadow="xs" radius="md">
                                    <Group justify="space-between" align="flex-start" wrap="nowrap">
                                        <div style={{ flex: 1 }}>
                                            <Group gap="xs" mb="xs">
                                                <Title order={5}>{setup.name}</Title>
                                                <Badge color={setup.type === 'AEM' ? 'green' : setup.type === 'PEM' ? 'blue' : setup.type === 'Alkaline' ? 'orange' : 'gray'}>
                                                    {setup.type}
                                                </Badge>
                                            </Group>
                                            
                                            {/* Détails consolidés (Total) */}
                                            <Group gap="md" rowGap="xs" mb="sm">
                                                <Text size="sm">⚡ <b>{setup.power}</b> kW <Text span c="dimmed" size="xs">(+{setup.total_auxiliary_consumption} kW aux)</Text></Text>
                                                <Text size="sm">💧 <b>{setup.water_consumption_l_per_h}</b> L/h</Text>
                                                <Text size="sm">💶 <b>{setup.price.toLocaleString()}</b> €</Text>
                                                <Text size="sm">⚙️ <b>{setup.energy_consumption_kwh_per_kg}</b> kWh/kg</Text>
                                            </Group>

                                            {/* Le bloc décalé pour le détail des auxiliaires */}
                                            {setup.auxiliariesList && setup.auxiliariesList.length > 0 && (
                                                <Box pl="md" mt="xs" style={{ borderLeft: '3px solid var(--mantine-color-gray-3)' }}>
                                                    <Text size="xs" fw={700} c="dimmed" mb={4} tt="uppercase">Balance of Plant (Included)</Text>
                                                    <Stack gap={4}>
                                                        {setup.auxiliariesList.map(aux => (
                                                            <Group key={aux.id} gap="xs" wrap="nowrap">
                                                                <Text size="xs" fw={500}>• {aux.name}</Text>
                                                                <Text size="xs" c="dimmed">
                                                                    (+{aux.power} kW | +{aux.water} L/h | +{aux.price.toLocaleString()} €)
                                                                </Text>
                                                            </Group>
                                                        ))}
                                                    </Stack>
                                                </Box>
                                            )}
                                        </div>
                                        <ActionIcon color="red" variant="light" onClick={() => handleDeleteSetup(setup.id)} size="lg">
                                            <IconTrash size={20} />
                                        </ActionIcon>
                                    </Group>
                                </Card>
                            ))}
                        </Stack>
                    )}
                </Grid.Col>
            </Grid>
        </Container>
    );
}