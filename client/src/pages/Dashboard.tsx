import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Title, Text, Grid, Badge, Group, Button, Paper, Stack, Loader, Table } from '@mantine/core';
import { IconCreditCard, IconArrowRight } from '@tabler/icons-react';
import { getUsers } from '../services/api';
import type { User, ApiResponse } from '../types';

const Dashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await getUsers() as ApiResponse<User[]>;
        if (response.success) {
          setUsers(response.data);
        }
      } catch (error) {
        console.error('Kullanıcılar getirilirken hata oluştu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <Stack gap="lg">
      <Title order={2} mb="md">Hoş Geldiniz</Title>

      <Paper p="md" shadow="xs" radius="md" withBorder>
        <Title order={3} mb="sm">Hızlı İşlemler</Title>
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder component={Link} to="/transfer" style={{ textDecoration: 'none' }}>
              <Group>
                <IconCreditCard size={24} color="blue" />
                <Text fw={500} size="lg">Para Transferi</Text>
              </Group>
              <Text mt="sm" c="dimmed" size="sm">
                Hesaplar arası para transferi yapabilirsiniz
              </Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder component={Link} to="/history" style={{ textDecoration: 'none' }}>
              <Group>
                <IconCreditCard size={24} color="green" />
                <Text fw={500} size="lg">İşlem Geçmişi</Text>
              </Group>
              <Text mt="sm" c="dimmed" size="sm">
                Tüm işlem geçmişinizi görüntüleyin
              </Text>
            </Card>
          </Grid.Col>
        </Grid>
      </Paper>

      <Paper p="md" shadow="xs" radius="md" withBorder>
        <Group justify="space-between" mb="md">
          <Title order={3}>Kullanıcılar</Title>
        </Group>
        
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Kullanıcı ID</Table.Th>
              <Table.Th>Ad</Table.Th>
              <Table.Th>Bakiye</Table.Th>
              <Table.Th>İşlemler</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {users.map((user) => (
              <Table.Tr key={user.id}>
                <Table.Td>{user.id}</Table.Td>
                <Table.Td>{user.name}</Table.Td>
                <Table.Td>
                  <Badge color={user.balance > 0 ? 'green' : 'red'} variant="light">
                    {formatCurrency(user.balance)}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group>
                    <Button 
                      component={Link}
                      to={`/users/${user.id}`}
                      variant="light" 
                      size="xs"
                      rightSection={<IconArrowRight size={14} />}
                    >
                      Detay
                    </Button>
                    <Button 
                      component={Link}
                      to={`/transfer?receiverId=${user.id}`}
                      variant="light" 
                      color="blue"
                      size="xs"
                    >
                      Transfer
                    </Button>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>
    </Stack>
  );
};

export default Dashboard; 