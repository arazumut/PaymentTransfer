import { Outlet, NavLink, useNavigate } from 'react-router-dom';
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
  IconQrcode,
  IconArrowsExchange,
  IconCalendarEvent,
  IconChartPie,
  IconGift
} from '@tabler/icons-react';
import { useAuth } from '../contexts/AuthContext';
import NotificationsMenu from './NotificationsMenu';

interface LayoutProps {
  toggleColorScheme: () => void;
  colorScheme: string;
}

const Layout = ({ toggleColorScheme, colorScheme }: LayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const navLinks = [
    { icon: <IconHome size={20} />, label: 'Ana Sayfa', to: '/' },
    { icon: <IconCreditCard size={20} />, label: 'Para Transferi', to: '/transfer' },
    { icon: <IconQrcode size={20} />, label: 'QR ile Transfer', to: '/qr-transfer' },
    { icon: <IconQrcode size={20} />, label: 'QR Geçmişi', to: '/qr-history' },
    { icon: <IconQrcode size={20} />, label: 'Gelişmiş QR Oluştur', to: '/qr-generator' },
    { icon: <IconArrowsExchange size={20} />, label: 'Para İste', to: '/money-request' },
    { icon: <IconHistory size={20} />, label: 'İşlem Geçmişi', to: '/history' },
    { icon: <IconUser size={20} />, label: 'Profil Ayarları', to: '/profile' },
  ];
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
            <Button variant="subtle" leftSection={<IconLogout size={16} />} onClick={handleLogout}>
              Çıkış
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack gap="xs">
          <Group mb="xs">
            <Avatar color="blue" radius="xl" size="md">
              {user?.name?.substring(0, 2).toUpperCase() || 'UA'}
            </Avatar>
            <div style={{ flex: 1 }}>
              <Text fw={500}>{user?.name || 'Kullanıcı'}</Text>
              <Text size="xs" c="dimmed">{user?.email || 'kullanici@example.com'}</Text>
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