import { useState } from 'react';
import { 
  Menu, 
  ActionIcon, 
  Badge, 
  Text, 
  Group, 
  Stack, 
  ThemeIcon, 
  Paper,
  Indicator 
} from '@mantine/core';
import { 
  IconBell, 
  IconCheck, 
  IconAlertCircle, 
  IconInfoCircle,
  IconSettings
} from '@tabler/icons-react';

interface Notification {
  id: number;
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  type: 'success' | 'warning' | 'info';
}

const NotificationsMenu = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: 'Para Transferi Başarılı',
      message: 'Mehmet Demir\'e 500₺ transfer edildi.',
      date: '10 dakika önce',
      isRead: false,
      type: 'success'
    },
    {
      id: 2,
      title: 'Güvenlik Uyarısı',
      message: 'Hesabınızda şüpheli bir etkinlik tespit edildi.',
      date: '2 saat önce',
      isRead: false,
      type: 'warning'
    },
    {
      id: 3,
      title: 'Profil Güncellendi',
      message: 'Profil bilgileriniz başarıyla güncellendi.',
      date: '1 gün önce',
      isRead: true,
      type: 'info'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true } 
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const getIconForType = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <IconCheck size={16} />;
      case 'warning':
        return <IconAlertCircle size={16} />;
      case 'info':
        return <IconInfoCircle size={16} />;
      default:
        return <IconBell size={16} />;
    }
  };

  const getColorForType = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'green';
      case 'warning':
        return 'orange';
      case 'info':
        return 'blue';
      default:
        return 'gray';
    }
  };

  return (
    <Menu 
      position="bottom-end" 
      withArrow 
      width={320}
      shadow="md"
      offset={10}
      closeOnItemClick={false}
    >
      <Menu.Target>
        <Indicator disabled={unreadCount === 0} color="red" size={16}>
          <ActionIcon size="lg" color="gray" variant="subtle" radius="xl">
            <IconBell size={22} />
          </ActionIcon>
        </Indicator>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>
          <Group justify="space-between">
            <Text fw={600} size="md">Bildirimler</Text>
            {unreadCount > 0 && (
              <Badge color="red" size="xs" variant="filled">
                {unreadCount} yeni
              </Badge>
            )}
          </Group>
        </Menu.Label>
        <Menu.Divider />
        
        <div style={{ maxHeight: '300px', overflow: 'auto' }}>
          {notifications.length === 0 ? (
            <Text ta="center" c="dimmed" py="md">
              Bildirim bulunmuyor
            </Text>
          ) : (
            <Stack gap="xs" px="xs">
              {notifications.map((notification) => (
                <Paper 
                  key={notification.id} 
                  p="xs" 
                  withBorder={!notification.isRead}
                  bg={!notification.isRead ? 'var(--mantine-color-blue-0)' : undefined}
                  onClick={() => markAsRead(notification.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <Group align="flex-start" wrap="nowrap">
                    <ThemeIcon 
                      color={getColorForType(notification.type)} 
                      variant="light"
                      size="md"
                      radius="xl"
                    >
                      {getIconForType(notification.type)}
                    </ThemeIcon>
                    <div style={{ flex: 1 }}>
                      <Text size="sm" fw={500}>
                        {notification.title}
                      </Text>
                      <Text size="xs" c="dimmed" lineClamp={2}>
                        {notification.message}
                      </Text>
                      <Text size="xs" c="dimmed" fs="italic" mt={4}>
                        {notification.date}
                      </Text>
                    </div>
                  </Group>
                </Paper>
              ))}
            </Stack>
          )}
        </div>
        
        <Menu.Divider />
        <Menu.Item 
          color="blue" 
          leftSection={<IconCheck size={14} />}
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
        >
          Tümünü okundu işaretle
        </Menu.Item>
        <Menu.Item leftSection={<IconSettings size={14} />}>
          Bildirim Ayarları
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export default NotificationsMenu; 