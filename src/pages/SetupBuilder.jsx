import { useState } from 'react';
import { Container, Title, TextInput, Select, Button, Card, Text, Group, Stack, ActionIcon, Grid, Badge, Divider, Box, Paper } from '@mantine/core';
import { IconPlus, IconTrash, IconServerCog } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import ValueInput from '../components/ValueInput.jsx';
import { H2_VOLUME_POWER_UNITS, MAINTENANCE_UNITS } from '../components/calculator/calculatorConstants.js';

const MAP_TYPE = {
    "PEM": "PEM",
    "Alkaline": "Alkaline", 
    "AEM": "AEM",
    "SOEC": "SOEC"
}

const REVERSE_MAP_TYPE = {
    "PEM": "electrolyzer.type.pem",
    "Alkaline": "electrolyzer.type.alkaline",
    "AEM": "electrolyzer.type.aem",
    "SOEC": "electrolyzer.type.soec",
}

export default function SetupBuilder() {

    const { t } = useTranslation("setupBuilder");

    // 1. L'état qui stocke la liste de tous nos setups
    const [setups, setSetups] = useState([]);

    // 2. Les états du formulaire principal
    const [name, setName] = useState('');
    const [type, setType] = useState('PEM');
    const [stackPower, setStackPower] = useState(2.4);
    const [stackPrice, setStackPrice] = useState(9600);
    const [maxStacks, setMaxStacks] = useState(4);
    const [energyConsumption, setEnergyConsumption] = useState(53.4);
    const [waterConsumption, setWaterConsumption] = useState(1.26);
    
    // Maintenance et durée de vie globales
    const [maintenance, setMaintenance] = useState(5);
    const [lifetime, setLifetime] = useState(35000);

    // 3. Les états du mini-formulaire pour un Auxiliaire
    const [auxiliaries, setAuxiliaries] = useState([]);
    const [auxName, setAuxName] = useState('');
    const [auxPrice, setAuxPrice] = useState('');
    const [auxPower, setAuxPower] = useState('');
    const [auxWater, setAuxWater] = useState('');
    const [auxCapacity, setAuxCapacity] = useState(1);

    // Ajouter un équipement auxiliaire à la liste de construction
    const handleAddAuxiliary = () => {
        if (!auxName.trim()) return;
        setAuxiliaries([...auxiliaries, { 
            id: Date.now(), 
            name: auxName, 
            price: auxPrice, 
            power: auxPower, 
            water: auxWater,
            capacity: auxCapacity
        }]);
        
        // Reset des champs
        setAuxName('');
        setAuxPrice('');
        setAuxPower('');
        setAuxWater('');
        setAuxCapacity(1);
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
            // Prix total : 1 Stack de base + tout le BoP auxiliaire
            price: stackPrice + totalAuxPrice,
            stack_price: stackPrice,
            max_stacks: maxStacks,
            power: stackPower * maxStacks,
            stack_power: stackPower,
            energy_consumption_kwh_per_kg: energyConsumption,
            maintenance_percent_capex: maintenance,
            stack_lifetime_hours: lifetime,
            water_consumption_l_per_h: waterConsumption + totalAuxWater,
            total_auxiliary_consumption: totalAuxPower,
            auxiliariesList: [...auxiliaries]
        };

        setSetups([...setups, newSetup]);
        setName('');
    };

    const handleDeleteSetup = (idToRemove) => {
        setSetups(setups.filter(s => s.id !== idToRemove));
    };

    return (
        <Container size="xl" py="xl" mt="150">
            <Group mb="xl">
                <IconServerCog size={32} color="var(--mantine-color-blue-6)" />
                <Title order={2}>{t("title")}</Title>
            </Group>

            <Grid gutter="xl">
                {/* --- COLONNE GAUCHE : LE FORMULAIRE --- */}
                <Grid.Col span={{ base: 12, md: 5 }}>
                    <Card withBorder shadow="sm" radius="md">
                        <Title order={4} mb="md">
                            {t("setupBuilder.create_new_setup")}
                        </Title>
                        
                        <Stack gap="md">
                            <TextInput 
                                label={t("setupBuilder.configuration_name")}
                                placeholder={t("setupBuilder.configuration_name_placeholder")}
                                value={name} 
                                onChange={(e) => setName(e.currentTarget.value)} 
                                required 
                            />

                            <Select 
                                label={t("setupBuilder.technology_type")}
                                data={[
                                    t('electrolyzer.type.pem'),
                                    t('electrolyzer.type.alkaline'),
                                    t('electrolyzer.type.aem'),
                                    t('electrolyzer.type.soec')
                                ]} 
                                value={type} 
                                onChange={(val) => setType(MAP_TYPE[val])} 
                            />

                            <Divider 
                                my="xs" 
                                label={t("setupBuilder.electrolyzer_specs")}
                                labelPosition="center" 
                            />
                            
                            <ValueInput 
                                label={t("setupBuilder.stack_power")}
                                value={stackPower} 
                                onValueChange={setStackPower} 
                                units={[{ label: "units.power_kw", factor: 1 }]} 
                                currentUnit={{ label: "units.power_kw", factor: 1 }}
                                namespace="setupBuilder" 
                            />

                            <ValueInput 
                                label={t("setupBuilder.max_stacks_per_unit")}
                                value={maxStacks} 
                                onValueChange={setMaxStacks} 
                                units={[{ label: "units.stacks", factor: 1 }]} 
                                currentUnit={{ label: "units.stacks", factor: 1 }}
                                namespace="setupBuilder" 
                            />

                            <ValueInput 
                                label={t("setupBuilder.energy_consumption")}
                                value={energyConsumption} 
                                onValueChange={setEnergyConsumption} 
                                units={H2_VOLUME_POWER_UNITS} 
                                currentUnit={H2_VOLUME_POWER_UNITS[0]}
                                namespace="setupBuilder" 
                            />

                            <ValueInput 
                                label={t("setupBuilder.water_consumption")}
                                value={waterConsumption} 
                                onValueChange={setWaterConsumption} 
                                units={[{ label: "units.l_per_hour", factor: 1 }]} 
                                currentUnit={{ label: "units.l_per_hour", factor: 1 }}
                                namespace="setupBuilder"  
                            />

                            <Divider 
                                my="xs" 
                                label={t("setupBuilder.financials")}
                                labelPosition="center" 
                            />
                            
                            <ValueInput 
                                label={t("setupBuilder.single_stack_price")}
                                value={stackPrice} 
                                onValueChange={setStackPrice} 
                                units={[{ label: "units.eur", factor: 1 }]} 
                                currentUnit={{ label: "units.eur", factor: 1 }}
                                namespace="setupBuilder"  
                            />

                            <ValueInput 
                                label={t("setupBuilder.global_maintenance")}
                                value={maintenance} 
                                onValueChange={setMaintenance} 
                                units={MAINTENANCE_UNITS} 
                                currentUnit={MAINTENANCE_UNITS[0]}
                                namespace="setupBuilder"  
                            />

                            <ValueInput 
                                label={t("setupBuilder.stack_lifetime")}
                                value={lifetime} 
                                onValueChange={setLifetime} 
                                units={[{ label: "units.hours", factor: 1 }]} 
                                currentUnit={{ label: "units.hours", factor: 1 }}
                                namespace="setupBuilder"
                            />

                            <Divider 
                                my="xs" 
                                label={t("setupBuilder.auxiliary_equipments")}
                                labelPosition="center" 
                            />

                            <Paper withBorder p="sm" radius="md" bg="light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-8))">
                                <Text size="sm" fw={600} mb="xs">
                                    {t("setupBuilder.add_component")}
                                </Text>

                                <Grid gutter="xs">
                                    <Grid.Col span={12}>
                                        <TextInput 
                                            placeholder={t("setupBuilder.component_name")}
                                            value={auxName} 
                                            onChange={(e) => setAuxName(e.currentTarget.value)} 
                                        />
                                    </Grid.Col>

                                    <Grid.Col span={6}>
                                        <ValueInput 
                                            label={t("setupBuilder.added_power")}
                                            value={auxPower} 
                                            onValueChange={setAuxPower} 
                                            units={[{ label: "units.power_kw", factor: 1 }]} 
                                            currentUnit={{ label: "units.power_kw", factor: 1 }}
                                            namespace="setupBuilder" 
                                        />
                                    </Grid.Col>

                                    <Grid.Col span={6}>
                                        <ValueInput 
                                            label={t("setupBuilder.added_water")}
                                            value={auxWater} 
                                            onValueChange={setAuxWater} 
                                            units={[{ label: "units.l_per_hour", factor: 1 }]} 
                                            currentUnit={{ label: "units.l_per_hour", factor: 1 }}
                                            namespace="setupBuilder" 
                                        />
                                    </Grid.Col>

                                    <Grid.Col span={6}>
                                        <ValueInput 
                                            label={t("setupBuilder.added_capex")}
                                            value={auxPrice} 
                                            onValueChange={setAuxPrice} 
                                            units={[{ label: "units.eur", factor: 1 }]} 
                                            currentUnit={{ label: "units.eur", factor: 1 }}
                                            namespace="setupBuilder" 
                                        />
                                    </Grid.Col>

                                    <Grid.Col span={6}>
                                        <ValueInput 
                                            label={t("setupBuilder.capacity_supported")}
                                            value={auxCapacity} 
                                            onValueChange={setAuxCapacity} 
                                            units={[{ label: "units.units", factor: 1 }]} 
                                            currentUnit={{ label: "units.units", factor: 1 }}
                                            namespace="setupBuilder" 
                                        />
                                    </Grid.Col>
                                </Grid>
                                
                                <Button 
                                    fullWidth 
                                    variant="light" 
                                    mt="sm" 
                                    leftSection={<IconPlus size={14} />} 
                                    onClick={handleAddAuxiliary}
                                    disabled={!auxName.trim() || auxPower === '' || auxPrice === '' || auxWater === '' || auxCapacity === ''}
                                >
                                    {t("setupBuilder.add_to_setup")}
                                </Button>
                            </Paper>

                            <Button 
                                size="md" 
                                color="blue" 
                                mt="md" 
                                onClick={handleAddSetup} 
                                disabled={!name.trim()}
                            >
                                {t("setupBuilder.save_complete_setup")}
                            </Button>
                        </Stack>
                    </Card>
                </Grid.Col>

                {/* --- COLONNE DROITE : LA LISTE DES SETUPS --- */}
                <Grid.Col span={{ base: 12, md: 7 }}>
                    <Group justify="space-between" mb="md">
                        <Title order={4}>
                            {t("setupBuilder.saved_configurations")}
                        </Title>

                        <Badge size="lg" radius="sm">
                            {setups.length} {t("setupBuilder.setups_count")}
                        </Badge>
                    </Group>

                    {setups.length === 0 ? (
                        <Card withBorder padding="xl" ta="center" bg="var(--mantine-color-gray-0)">
                            <Text c="dimmed">
                                {t("setupBuilder.no_setups_title")}
                                <br/>
                                {t("setupBuilder.no_setups_subtitle")}
                            </Text>
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
                                                    {t(REVERSE_MAP_TYPE[setup.type])}
                                                </Badge>
                                            </Group>
                                            
                                            {/* Détails consolidés */}
                                            <Group gap="md" rowGap="xs" mb="sm">
                                                <Text size="sm">⚡ <b>{setup.stack_power}</b> {t("units.kW_per_stack")} <Text span c="dimmed" size="xs">({t("setupBuilder.max")}: {setup.max_stacks})</Text></Text>
                                                <Text size="sm">💧 <b>{setup.water_consumption_l_per_h}</b> {t("units.l_per_hour")}</Text>
                                                <Text size="sm">💶 <b>{setup.price.toLocaleString()}</b> {t("units.eur")} <Text span c="dimmed" size="xs">{t("setupBuilder.total_capex")}</Text></Text>
                                                <Text size="sm">⚙️ <b>{setup.energy_consumption_kwh_per_kg}</b> {t("units.kwh_per_kg")}</Text>
                                            </Group>

                                            {/* Le bloc décalé pour le détail des auxiliaires */}
                                            {setup.auxiliariesList && setup.auxiliariesList.length > 0 && (
                                                <Box pl="md" mt="xs" style={{ borderLeft: '3px solid var(--mantine-color-gray-3)' }}>
                                                    <Text
                                                        size="xs"
                                                        fw={700}
                                                        c="dimmed"
                                                        mb={4}
                                                        tt="uppercase"  
                                                    >
                                                        {t("setupBuilder.balance_of_plant")}
                                                    </Text>
                                                    <Stack gap={4}>
                                                        {setup.auxiliariesList.map(aux => (
                                                            <Group key={aux.id} gap="xs" wrap="nowrap">
                                                                <Text size="xs" fw={500}>• {aux.name}</Text>
                                                                <Text size="xs" c="dimmed">
                                                                    (+{aux.power} {t("units.power_kw")} | +{aux.water} {t("units.l_per_hour")} | +{aux.price.toLocaleString()} {t("units.eur")} | {t("setupBuilder.cap")}: {aux.capacity} {t("setupBuilder.sys")})
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