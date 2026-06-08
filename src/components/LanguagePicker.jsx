import { useState, useEffect } from 'react';
import { Menu, Group, Image, UnstyledButton, Box } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

// Flags
import frenchFlag from '../assets/flags/french.png';
import englishFlag from '../assets/flags/english.png';
import germanFlag from '../assets/flags/german.png';

const languages = [
  { code: 'en', label: 'English', image: englishFlag },
  { code: 'de', label: 'Deutsch', image: germanFlag },
  { code: 'fr', label: 'Français', image: frenchFlag },
];

export function LanguagePicker() {
  const { i18n } = useTranslation();

  const [opened, setOpened] = useState(false);

  const [selected, setSelected] = useState(
    languages.find((lang) => i18n.language?.startsWith(lang.code)) || languages[0]
  );

  useEffect(() => {
    const current =
      languages.find((lang) => i18n.language?.startsWith(lang.code)) || languages[0];

    setSelected(current);
  }, [i18n.language]);

  const handleLanguageChange = (lang) => {
    setSelected(lang);
    i18n.changeLanguage(lang.code);
  };

  const items = languages.map((item) => (
    <Menu.Item
      key={item.code}
      leftSection={
        <Image
          src={item.image}
          width={18}
          height={18}
          alt={item.label}
        />
      }
      onClick={() => handleLanguageChange(item)}
    >
      {item.label}
    </Menu.Item>
  ));

  return (
    <Menu
      onOpen={() => setOpened(true)}
      onClose={() => setOpened(false)}
      radius="md"
      width="flex"
      withinPortal
    >
      <Menu.Target>
        <UnstyledButton
            style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '6px 10px',
            borderRadius: 'var(--mantine-radius-md)',
            border:
                '1px solid light-dark(var(--mantine-color-gray-2), var(--mantine-color-dark-6))',
            transition: 'background-color 150ms ease',
            backgroundColor: opened
                ? 'light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-5))'
                : 'light-dark(var(--mantine-color-white), var(--mantine-color-dark-6))',
            gap: 6,
            }}
        >
            <Image
            src={selected.image}
            w={22}
            h={22}
            alt={selected.label}
            />

            <IconChevronDown
            size={14}
            stroke={1.5}
            style={{
                transition: 'transform 150ms ease',
                transform: opened ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
            />
        </UnstyledButton>
        </Menu.Target>

      <Menu.Dropdown>
        {items}
      </Menu.Dropdown>
    </Menu>
  );
}