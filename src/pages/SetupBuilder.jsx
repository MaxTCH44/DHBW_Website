import { useState, useEffect } from 'react';
import { 
    Container, Title, Text, Card, Grid, Stack, Group, TextInput, 
    Button, Divider, ActionIcon, Paper, Select, Badge, ScrollArea, Box
} from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { IconPlus, IconTrash, IconDeviceFloppy, IconBolt, IconDroplet, IconCurrencyEuro, IconPencil } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

// === CUSTOM COMPONENTS IMPORTS ===
import ValueInput from '../components/ValueInput';
import SliderInput from '../components/SliderInput';
import LabelWithTooltip from '../components/LabelWithTooltip';

export default function SetupBuilder() {
    
    const { t } = useTranslation("setupBuilder");
    
    // 1. Local storage for saved custom configurations
    const [savedSetups, setSavedSetups] = useLocalStorage({
        key: 'greenlab-custom-setups',
        defaultValue: [],
    });

    // 2. Main Form State
    const [editingId, setEditingId] = useState(null);
    const [setupName, setSetupName] = useState('');
    const [type, setType] = useState(t('electrolyzer.type.pem'));
    const [stackPrice, setStackPrice] = useState(10000);
    
    // Stack Configuration
    const [systemMaxStacks, setSystemMaxStacks] = useState(4); 
    const [includedStacks, setIncludedStacks] = useState(1); 
    
    useEffect(() => {
        if (includedStacks > systemMaxStacks) {
            setIncludedStacks(systemMaxStacks);
        }
    }, [systemMaxStacks, includedStacks]);

    const [stackPower, setStackPower] = useState(2.4); 
    
    const [energyCons, setEnergyCons] = useState(50); 
    const [waterCons, setWaterCons] = useState(0.42); 
    const [maintenance, setMaintenance] = useState(5); 
    const [stackLifetime, setStackLifetime] = useState(35000); 

    // 3. Balance of Plant (BOP) / Auxiliaries State
    const [auxiliaries, setAuxiliaries] = useState([]);
    const [auxName, setAuxName] = useState('');
    const [auxPrice, setAuxPrice] = useState(0);
    const [auxPower, setAuxPower] = useState(0);
    const [auxWater, setAuxWater] = useState(0);

    const handleAddAuxiliary = () => {
        if (!auxName.trim()) return;
        setAuxiliaries([...auxiliaries, {
            id: Date.now(),
            name: auxName,
            price: auxPrice,
            power: auxPower,
            water: auxWater
        }]);
        setAuxName('');
        setAuxPrice(0);
        setAuxPower(0);
        setAuxWater(0);
    };

    const handleRemoveAuxiliary = (id) => {
        setAuxiliaries(auxiliaries.filter(a => a.id !== id));
    };

    // 4. Dynamic calculation of aggregated totals
    const totalAuxPrice = auxiliaries.reduce((acc, aux) => acc + aux.price, 0);
    const totalAuxPower = auxiliaries.reduce((acc, aux) => acc + aux.power, 0);
    const totalAuxWater = auxiliaries.reduce((acc, aux) => acc + aux.water, 0);

    const calculatedTotalPrice = (stackPrice * includedStacks) + totalAuxPrice;
    const calculatedTotalPower = Number((stackPower * includedStacks).toFixed(3));

    const resetForm = () => {
        setEditingId(null);
        setSetupName('');
        setType(t('electrolyzer.type.pem'));
        setStackPrice(1000);
        setSystemMaxStacks(4);
        setIncludedStacks(1);
        setStackPower(2.4);
        setEnergyCons(50);
        setWaterCons(0.42);
        setMaintenance(5);
        setStackLifetime(35000);
        setAuxiliaries([]);
        setAuxName('');
        setAuxPrice(0);
        setAuxPower(0);
        setAuxWater(0);
    };

    const handleSaveSetup = () => {
        if (!setupName.trim()) return;

        const setupPayload = {
            name: setupName,
            type: type,
            price: calculatedTotalPrice, 
            stack_price: stackPrice,
            max_stacks: systemMaxStacks,
            included_stacks: includedStacks,
            power: calculatedTotalPower,
            stack_power: stackPower,
            energy_consumption_kwh_per_kg: energyCons,
            total_auxiliary_consumption: totalAuxPower,
            water_consumption_l_per_h: waterCons + totalAuxWater,
            base_water_consumption: waterCons,
            maintenance_percent_capex: maintenance,
            stack_lifetime_hours: stackLifetime,
            auxiliaries: auxiliaries,
            isCustom: true
        };

        if (editingId) {
            setSavedSetups(savedSetups.map(s => s.id === editingId ? { ...setupPayload, id: editingId } : s));
        } else {
            setSavedSetups([...savedSetups, { ...setupPayload, id: Date.now() }]);
        }
        
        resetForm();
    };

    const handleEditSetup = (setup) => {
        setEditingId(setup.id);
        setSetupName(setup.name);
        setType(setup.type);
        setStackPrice(setup.stack_price);
        setSystemMaxStacks(setup.max_stacks);
        setIncludedStacks(setup.included_stacks || setup.max_stacks);
        setStackPower(setup.stack_power);
        setEnergyCons(setup.energy_consumption_kwh_per_kg);
        setMaintenance(setup.maintenance_percent_capex);
        setStackLifetime(setup.stack_lifetime_hours);
        
        setAuxiliaries(setup.auxiliaries || []);
        
        if (setup.base_water_consumption !== undefined) {
            setWaterCons(setup.base_water_consumption);
        } else {
            const calculatedAuxWater = (setup.auxiliaries || []).reduce((acc, aux) => acc + aux.water, 0);
            setWaterCons(setup.water_consumption_l_per_h - calculatedAuxWater);
        }
    };

    const handleDeleteSetup = (id) => {
        setSavedSetups(savedSetups.filter(s => s.id !== id));
        if (editingId === id) {
            resetForm();
        }
    };

    return (
        <Container size="xl" py="xl" mt={150}>
            <Title order={1} mb="sm" c="dark.8">{t('title')}</Title>
            <Text c="dimmed" mb="xl">
                {t('description')}
            </Text>

            <Grid gutter="xl">
                {/* --- LEFT COLUMN: CONFIGURATION FORM --- */}
                <Grid.Col span={{ base: 12, md: 7 }}>
                    <Card withBorder shadow="sm" radius="md" p="xl">
                        <Title order={3} mb="md">
                            {editingId ? t('setupBuilder.edit_mode') : t('setupBuilder.step1_title')}
                        </Title>
                        
                        <Grid>
                            <Grid.Col span={8}>
                                <TextInput label={t('setupBuilder.configuration_name')} placeholder={t('setupBuilder.configuration_name_placeholder')} value={setupName} onChange={(e) => setSetupName(e.currentTarget.value)} required mb="sm" />
                            </Grid.Col>
                            <Grid.Col span={4}>
                                <Select label={t('setupBuilder.technology_type')} data={[t('electrolyzer.type.pem'), t('electrolyzer.type.alkaline'), t('electrolyzer.type.aem'), t('electrolyzer.type.soec')]} value={type} onChange={setType} allowDeselect={false} mb="sm" />
                            </Grid.Col>

                           
                            <Grid.Col span={6}>
                                <ValueInput 
                                    label={t('setupBuilder.max_capacity')} 
                                    value={systemMaxStacks} 
                                    onValueChange={setSystemMaxStacks} 
                                    units={t('units.stacks')} 
                                    nullBlocker 
                                />
                            </Grid.Col>

                            <Grid.Col span={6}>
                                <SliderInput 
                                    label={t('setupBuilder.included_stacks', { count: includedStacks })}
                                    value={includedStacks} 
                                    onValueChange={setIncludedStacks}
                                    min={1}
                                    max={systemMaxStacks}
                                    step={1}
                                    units={t('units.stacks')}
                                />
                            </Grid.Col>
                            <Grid.Col span={4}>
                                <ValueInput 
                                    label={t('setupBuilder.single_stack_price')} 
                                    value={stackPrice} 
                                    onValueChange={setStackPrice} 
                                    units={t('units.eur')} 
                                />
                            </Grid.Col>
                            <Grid.Col span={4}>
                                <ValueInput 
                                    label={t('setupBuilder.stack_power')} 
                                    value={stackPower} 
                                    onValueChange={setStackPower} 
                                    units={t('units.power_kw')} 
                                    nullBlocker 
                                />
                            </Grid.Col>
                            <Grid.Col span={4}>
                                <TextInput 
                                    label={<LabelWithTooltip label={t('setupBuilder.total_power')} tooltip={t('setupBuilder.total_power_tooltip')} />} 
                                    value={`${calculatedTotalPower} ${t('units.power_kw')}`} 
                                    readOnly
                                    variant="filled"
                                    styles={{ input: { cursor: 'default' } }}
                                />
                            </Grid.Col>

                            <Grid.Col span={6}>
                                <ValueInput 
                                    label={t('setupBuilder.energy_consumption')} 
                                    value={energyCons} 
                                    onValueChange={setEnergyCons} 
                                    units={t('units.kwh_per_kg')} 
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <ValueInput 
                                    label={t('setupBuilder.base_water_consumption')} 
                                    value={waterCons} 
                                    onValueChange={setWaterCons} 
                                    units={t('units.l_per_h')} 
                                />
                            </Grid.Col>

                            <Grid.Col span={6}>
                                <ValueInput 
                                    label={<LabelWithTooltip label={t('setupBuilder.global_maintenance')} tooltip={t('setupBuilder.maintenance_tooltip')} />} 
                                    value={maintenance} 
                                    onValueChange={setMaintenance} 
                                    units={t('units.percent')} 
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <ValueInput 
                                    label={t('setupBuilder.stack_lifetime')} 
                                    value={stackLifetime} 
                                    onValueChange={setStackLifetime} 
                                    units={t('units.hours')} 
                                />
                            </Grid.Col>
                        </Grid>

                        <Divider my="xl" />

                        {/* --- BALANCE OF PLANT (BOP) / AUXILIARIES SECTION --- */}
                        <Title order={3} mb="md">{t('setupBuilder.auxiliary_equipments')}</Title>
                        <Text size="sm" c="dimmed" mb="md">{t('setupBuilder.auxiliary_equipments_description')}</Text>
                        
                        <Paper withBorder p="md" radius="md" bg="gray.0" mb="md">
                            <Grid align="flex-end">
                                <Grid.Col span={{ base: 12, sm: 6 }}>
                                    <TextInput label={t('setupBuilder.component_name')} placeholder={t('setupBuilder.component_name_placeholder')} value={auxName} onChange={(e) => setAuxName(e.currentTarget.value)} mb="sm" />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, sm: 6 }}>
                                    <ValueInput label={t('setupBuilder.price')} value={auxPrice} onValueChange={setAuxPrice} units={t('units.eur')} />
                                </Grid.Col>
                                
                                <Grid.Col span={{ base: 12, sm: 4 }}>
                                    <ValueInput label={t('setupBuilder.power_consumption')} value={auxPower} onValueChange={setAuxPower} units={t('units.power_kw')} />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, sm: 4 }}>
                                    <ValueInput label={t('setupBuilder.water_consumption_short')} value={auxWater} onValueChange={setAuxWater} units={t('units.l_per_h')} />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, sm: 4 }}>
                                    <Button fullWidth onClick={handleAddAuxiliary} leftSection={<IconPlus size={16} />} px={0} mb="sm" color="green" disabled={!auxName.trim()}>
                                        {t('setupBuilder.add_component')}
                                    </Button>
                                </Grid.Col>
                            </Grid>
                        </Paper>

                        {auxiliaries.length > 0 && (
                            <Stack gap="xs" mb="lg">
                                {auxiliaries.map(aux => (
                                    <Group key={aux.id} justify="space-between" p="sm" style={{ border: '1px solid var(--mantine-color-gray-3)', borderRadius: 'var(--mantine-radius-md)' }}>
                                        <Text fw={500}>{aux.name}</Text>
                                        <Group gap="md">
                                            <Badge color="gray" variant="light" leftSection={<IconCurrencyEuro size={12}/>}>{aux.price}</Badge>
                                            <Badge color="blue" variant="light" leftSection={<IconBolt size={12}/>}>{aux.power} {t('units.power_kw')}</Badge>
                                            <Badge color="cyan" variant="light" leftSection={<IconDroplet size={12}/>}>{aux.water} {t('units.l_per_h')}</Badge>
                                            <ActionIcon color="red" variant="subtle" onClick={() => handleRemoveAuxiliary(aux.id)}>
                                                <IconTrash size={16} />
                                            </ActionIcon>
                                        </Group>
                                    </Group>
                                ))}
                            </Stack>
                        )}

                        {/* --- PRICE RECAP / SUMMARY --- */}
                        <Paper withBorder p="md" bg="green.0" mt="xl" radius="md">
                            <Group justify="space-between">
                                <Box>
                                    <Text fw={600} c="green.9">{t('setupBuilder.estimated_total_price')}</Text>
                                    <Text size="xs" c="green.8">
                                        {t('setupBuilder.price_recap_details', { 
                                            count: includedStacks, 
                                            stackPrice: stackPrice.toLocaleString(), 
                                            auxPrice: totalAuxPrice.toLocaleString(), 
                                            currency: t('units.eur') 
                                        })}
                                    </Text>
                                </Box>
                                <Title order={3} c="green.9">{calculatedTotalPrice.toLocaleString()} {t('units.eur')}</Title>
                            </Group>
                        </Paper>

                        <Group grow mt="md">
                            {editingId && (
                                <Button variant="light" color="red" size="lg" onClick={resetForm}>
                                    {t('setupBuilder.cancel_edit')}
                                </Button>
                            )}
                            <Button 
                                size="lg" 
                                color={editingId ? "blue" : "green"} 
                                onClick={handleSaveSetup} 
                                disabled={!setupName.trim()}
                                leftSection={<IconDeviceFloppy />}
                            >
                                {editingId ? t('setupBuilder.update_setup') : t('setupBuilder.save_complete_setup')}
                            </Button>
                        </Group>
                    </Card>
                </Grid.Col>

                {/* --- RIGHT COLUMN: INVENTORY LIST --- */}
                <Grid.Col span={{ base: 12, md: 5 }}>
                    <Title order={3} mb="md">{t('setupBuilder.saved_configurations')}</Title>
                    {savedSetups.length === 0 ? (
                        <Text c="dimmed">{t('setupBuilder.no_setups_title')}</Text>
                    ) : (
                        <ScrollArea h={800} offsetScrollbars type="auto">
                            <Stack gap="md" pr="sm">
                                {savedSetups.map(setup => (
                                    <Card 
                                        key={setup.id} 
                                        withBorder 
                                        shadow="sm" 
                                        radius="md"
                                        style={editingId === setup.id ? { borderColor: 'var(--mantine-color-blue-5)', borderWidth: '2px' } : {}}
                                    >
                                        <Group justify="space-between" mb="xs" align="flex-start">
                                            <Box>
                                                <Title order={5}>{setup.name}</Title>
                                                <Badge color="green" mt={4} variant="light">{setup.type}</Badge>
                                            </Box>
                                            <Group gap="xs">
                                                <ActionIcon color="blue" variant="light" title={t('setupBuilder.edit_setup_tooltip')} onClick={() => handleEditSetup(setup)}>
                                                    <IconPencil size={16} />
                                                </ActionIcon>
                                                <ActionIcon color="red" variant="light" title={t('setupBuilder.delete_setup_tooltip')} onClick={() => handleDeleteSetup(setup.id)}>
                                                    <IconTrash size={16} />
                                                </ActionIcon>
                                            </Group>
                                        </Group>
                                        
                                        <Divider my="sm" />
                                        
                                        <Grid gutter="xs">
                                            <Grid.Col span={6}><Text size="xs" c="dimmed" tt="uppercase">{t('setupBuilder.total_capex')}</Text><Text fw={700} c="dark.8">{setup.price.toLocaleString()} {t('units.eur')}</Text></Grid.Col>
                                            <Grid.Col span={6}><Text size="xs" c="dimmed" tt="uppercase">{t('setupBuilder.power')}</Text><Text fw={700} c="dark.8">{setup.power} {t('units.power_kw')}</Text></Grid.Col>
                                            <Grid.Col span={6}><Text size="xs" c="dimmed" tt="uppercase">{t('setupBuilder.energy_consumption')}</Text><Text fw={700} c="dark.8">{setup.energy_consumption_kwh_per_kg} {t('units.kwh_per_kg')}</Text></Grid.Col>
                                            <Grid.Col span={6}><Text size="xs" c="dimmed" tt="uppercase">{t('setupBuilder.bop_consumption')}</Text><Text fw={700} c="dark.8">{setup.total_auxiliary_consumption} {t('units.power_kw')}</Text></Grid.Col>
                                            <Grid.Col span={12}><Text size="xs" c="dimmed" tt="uppercase">{t('setupBuilder.total_water_consumption')}</Text><Text fw={700} c="dark.8">{setup.water_consumption_l_per_h} {t('units.l_per_h')}</Text></Grid.Col>
                                        </Grid>
                                    </Card>
                                ))}
                            </Stack>
                        </ScrollArea>
                    )}
                </Grid.Col>
            </Grid>
        </Container>
    );
}