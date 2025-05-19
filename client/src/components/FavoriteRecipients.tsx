import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Paper, Title, Text, Group, Avatar, Stack, ActionIcon, Tooltip, Badge, Divider } from '@mantine/core';
import { IconStar, IconStarFilled, IconUser, IconSend } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

interface Recipient {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  isFavorite: boolean;
  lastTransactionAmount?: number;
  lastTransactionDate?: string;
}

const FavoriteRecipients = () => {
  const [recipients, setRecipients] = useState<Recipient[]>([
    { 
      id: 1, 
      name: 'Ahmet Yılmaz', 
      email: 'ahmet@example.com', 
      isFavorite: true,
      lastTransactionAmount: 500,
      lastTransactionDate: '2023-08-15'
    },
    { 
      id: 2, 
      name: 'Zeynep Kaya', 
      email: 'zeynep@example.com', 
      isFavorite: true,
      lastTransactionAmount: 250,
      lastTransactionDate: '2023-09-01'
    },
    { 
      id: 3, 
      name: 'Mehmet Demir', 
      email: 'mehmet@example.com', 
      isFavorite: true,
      lastTransactionAmount: 1000,
      lastTransactionDate: '2023-09-10'
    },
    { 
      id: 4, 
      name: 'Ayşe Öztürk', 
      email: 'ayse@example.com', 
      isFavorite: false
    },
  ]);

  const toggleFavorite = (id: number) => {
    setRecipients(prev => 
      prev.map(recipient => 
        recipient.id === id 
          ? { ...recipient, isFavorite: !recipient.isFavorite } 
          : recipient
      )
    );

    const recipient = recipients.find(r => r.id === id);
    
    if (recipient) {
      const action = recipient.isFavorite ? 'çıkarıldı' : 'eklendi';
      notifications.show({
        title: 'Favoriler',
        message: `${recipient.name} favorilerden ${action}`,
        color: recipient.isFavorite ? 'red' : 'green',
      });
    }
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined) return '---';
    
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '---';
    
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Paper p="md" shadow="xs" radius="md" withBorder>
      <Group justify="space-between" mb="md">
        <Title order={3}>Favori Alıcılar</Title>
        <Button variant="light" size="xs">Tümünü Gör</Button>
      </Group>

      <Stack gap="md">
        {recipients
          .filter(recipient => recipient.isFavorite)
          .map(recipient => (
            <Paper key={recipient.id} p="md" withBorder>
              <Group justify="space-between">
                <Group>
                  <Avatar color="blue" radius="xl">
                    {recipient.name.split(' ').map(n => n[0]).join('')}
                  </Avatar>
                  <div>
                    <Text fw={500}>{recipient.name}</Text>
                    <Text size="xs" c="dimmed">{recipient.email}</Text>
                    {recipient.lastTransactionDate && (
                      <Text size="xs">
                        Son işlem: {formatDate(recipient.lastTransactionDate)}
                      </Text>
                    )}
                  </div>
                </Group>
                <Group>
                  {recipient.lastTransactionAmount && (
                    <Badge color="green" variant="light">
                      {formatCurrency(recipient.lastTransactionAmount)}
                    </Badge>
                  )}
                  <Group gap="xs">
                    <Tooltip label="Favorilerden Çıkar">
                      <ActionIcon 
                        color="yellow" 
                        variant="light"
                        onClick={() => toggleFavorite(recipient.id)}
                      >
                        <IconStarFilled size={18} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Para Gönder">
                      <ActionIcon 
                        component={Link}
                        to={`/transfer?receiverId=${recipient.id}`}
                        color="blue" 
                        variant="light"
                      >
                        <IconSend size={18} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Group>
              </Group>
            </Paper>
          ))}

        <Divider label="Diğer Kişiler" labelPosition="center" />

        {recipients
          .filter(recipient => !recipient.isFavorite)
          .map(recipient => (
            <Paper key={recipient.id} p="md" withBorder>
              <Group justify="space-between">
                <Group>
                  <Avatar color="gray" radius="xl">
                    {recipient.name.split(' ').map(n => n[0]).join('')}
                  </Avatar>
                  <div>
                    <Text fw={500}>{recipient.name}</Text>
                    <Text size="xs" c="dimmed">{recipient.email}</Text>
                  </div>
                </Group>
                <Group gap="xs">
                  <Tooltip label="Favorilere Ekle">
                    <ActionIcon 
                      color="gray" 
                      variant="light"
                      onClick={() => toggleFavorite(recipient.id)}
                    >
                      <IconStar size={18} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Para Gönder">
                    <ActionIcon 
                      component={Link}
                      to={`/transfer?receiverId=${recipient.id}`}
                      color="blue" 
                      variant="light"
                    >
                      <IconSend size={18} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Group>
            </Paper>
          ))}

        <Button 
          variant="outline" 
          leftSection={<IconUser size={16} />}
          component={Link}
          to="/transfer"
          fullWidth
        >
          Yeni Alıcıya Transfer
        </Button>
      </Stack>
    </Paper>
  );
};

export default FavoriteRecipients; 