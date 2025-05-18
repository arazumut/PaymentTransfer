import { Outlet, NavLink } from 'react-router-dom';
import { AppShell, NavLink as MantineNavLink, Button, Title, Group, Text, Stack, Avatar } from '@mantine/core';
import { IconHome, IconCreditCard, IconHistory, IconLogout } from '@tabler/icons-react';

const Layout = () => {
  const navLinks = [
    { icon: <IconHome size={20} />, label: 'Ana Sayfa', to: '/' },
    { icon: <IconCreditCard size={20} />, label: 'Para Transferi', to: '/transfer' },
    { icon: <IconHistory size={20} />, label: 'İşlem Geçmişi', to: '/history' },
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
            <Button variant="subtle" leftSection={<IconLogout size={16} />}>
              Çıkış
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack gap="xs">
          <Group mb="md">
            <Avatar color="blue" radius="xl">UA</Avatar>
            <div>
              <Text fw={500}>Hoşgeldiniz</Text>
              <Text size="xs" c="dimmed">Para Transfer Uygulaması</Text>
            </div>
          </Group>

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
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
};

export default Layout; 