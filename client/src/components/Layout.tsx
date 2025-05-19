import { Outlet, NavLink } from 'react-router-dom';
import { 
  AppShell, 
  NavLink as MantineNavLink, 
  Button, 
  Title, 
  Group, 
  Text, 
  Stack, 
  Avatar, 
  ActionIcon,
  Tooltip,
  Divider
} from '@mantine/core';
import { 
  IconHome, 
  IconCreditCard, 
  IconHistory, 
  IconLogout, 
  IconMoon, 
  IconSun, 
  IconUser,
  IconChevronRight,
  IconStar
} from '@tabler/icons-react';
import NotificationsMenu from './NotificationsMenu';

interface LayoutProps {
  toggleColorScheme: () => void;
  colorScheme: string;
}

const Layout = ({ toggleColorScheme, colorScheme }: LayoutProps) => {
  const navLinks = [
    { icon: <IconHome size={20} />, label: 'Ana Sayfa', to: '/' },
    { icon: <IconCreditCard size={20} />, label: 'Para Transferi', to: '/transfer' },
    { icon: <IconHistory size={20} />, label: 'İşlem Geçmişi', to: '/history' },
    { icon: <IconUser size={20} />, label: 'Profil Ayarları', to: '/profile' },
    { icon: <IconStar size={20} />, label: 'Favori Alıcılar', to: '/favorites' },
  ];

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 280, breakpoint: 'sm' }}
      padding="md"
    >
      <AppShell.Header p="md">
        <Group justify="space-between">
          <Group>
            <Title order={3} c="blue">Para Transfer</Title>
          </Group>
          <Group>
            <NotificationsMenu />
            <Tooltip label={colorScheme === 'dark' ? 'Aydınlık Mod' : 'Karanlık Mod'}>
              <ActionIcon 
                variant="subtle" 
                size="lg" 
                onClick={toggleColorScheme}
              >
                {colorScheme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
              </ActionIcon>
            </Tooltip>
            <Button variant="subtle" leftSection={<IconLogout size={16} />}>
              Çıkış
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack gap="xs">
          <Group mb="xs">
            <Avatar color="blue" radius="xl" size="md">UA</Avatar>
            <div style={{ flex: 1 }}>
              <Text fw={500}>Umut Araz</Text>
              <Text size="xs" c="dimmed">umut.araz@example.com</Text>
            </div>
            <ActionIcon variant="subtle" component={NavLink} to="/profile">
              <IconChevronRight size={16} />
            </ActionIcon>
          </Group>

          <Divider my="xs" />

          {navLinks.map((link) => (
            <MantineNavLink
              key={link.to}
              component={NavLink}
              to={link.to}
              label={link.label}
              leftSection={link.icon}
              active={link.to === window.location.pathname}
            />
          ))}
          
          <Divider my="xs" label="Hızlı Erişim" labelPosition="center" />
          
          <MantineNavLink
            label="Son Transfer Edilen"
            description="Ahmet Yılmaz"
            rightSection={<IconChevronRight size={16} />}
          />
          
          <MantineNavLink
            label="Favori Alıcılar"
            description="3 kişi"
            rightSection={<IconChevronRight size={16} />}
          />
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
};

export default Layout; 