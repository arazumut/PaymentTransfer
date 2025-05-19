import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Card, 
  Title, 
  Text, 
  Grid, 
  Badge, 
  Group, 
  Button, 
  Paper, 
  Stack, 
  Loader, 
  Table, 
  RingProgress, 
  SimpleGrid,
  ThemeIcon,
  rem,
  Progress
} from '@mantine/core';
import { 
  IconCreditCard, 
  IconArrowRight, 
  IconChartBar, 
  IconCoin, 
  IconUsers,
  IconStar,
  IconUserCircle
} from '@tabler/icons-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer
} from 'recharts';
import { getUsers } from '../services/api';
import type { User, ApiResponse } from '../types';

// Örnek veri
const transactionData = [
  { name: 'Pzt', gelir: 4000, gider: 2400 },
  { name: 'Sal', gelir: 3000, gider: 1398 },
  { name: 'Çar', gelir: 2000, gider: 3800 },
  { name: 'Per', gelir: 2780, gider: 3908 },
  { name: 'Cum', gelir: 1890, gider: 4800 },
  { name: 'Cmt', gelir: 2390, gider: 3800 },
  { name: 'Paz', gelir: 3490, gider: 4300 },
];

const Dashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBalance: 0,
    totalUsers: 0,
    totalTransactions: 48,
    successRate: 94,
    recentTransactions: [
      { id: 1, from: "Ahmet Kaya", to: "Mehmet Demir", amount: 250, date: "2023-09-10" },
      { id: 2, from: "Zeynep Şahin", to: "Ali Yılmaz", amount: 500, date: "2023-09-09" },
      { id: 3, from: "Mustafa Can", to: "Ayşe Öztürk", amount: 120, date: "2023-09-08" },
    ]
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await getUsers() as ApiResponse<User[]>;
        if (response.success) {
          setUsers(response.data);
          
          // İstatistikler için hesaplamalar
          const totalBalance = response.data.reduce((sum, user) => sum + user.balance, 0);
          setStats(prev => ({
            ...prev,
            totalBalance,
            totalUsers: response.data.length
          }));
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
      <Title order={2} mb="md">Finansal Genel Bakış</Title>

      <SimpleGrid cols={{ base: 1, md: 2, lg: 4 }} spacing="lg">
        <Paper withBorder radius="md" p="md">
          <Group>
            <ThemeIcon color="blue" variant="light" size="xl" radius="md">
              <IconCoin size={rem(24)} />
            </ThemeIcon>
            <div>
              <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                Toplam Bakiye
              </Text>
              <Text fw={700} size="xl">
                {formatCurrency(stats.totalBalance)}
              </Text>
            </div>
          </Group>
        </Paper>

        <Paper withBorder radius="md" p="md">
          <Group>
            <ThemeIcon color="green" variant="light" size="xl" radius="md">
              <IconUsers size={rem(24)} />
            </ThemeIcon>
            <div>
              <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                Toplam Kullanıcı
              </Text>
              <Text fw={700} size="xl">
                {stats.totalUsers}
              </Text>
            </div>
          </Group>
        </Paper>

        <Paper withBorder radius="md" p="md">
          <Group>
            <ThemeIcon color="violet" variant="light" size="xl" radius="md">
              <IconChartBar size={rem(24)} />
            </ThemeIcon>
            <div>
              <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                İşlem Sayısı
              </Text>
              <Text fw={700} size="xl">
                {stats.totalTransactions}
              </Text>
            </div>
          </Group>
        </Paper>

        <Paper withBorder radius="md" p="md">
          <Group>
            <RingProgress
              size={80}
              roundCaps
              thickness={8}
              sections={[{ value: stats.successRate, color: 'green' }]}
              label={
                <Text ta="center" fw={700} size="lg">
                  {stats.successRate}%
                </Text>
              }
            />
            <div>
              <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                Başarılı İşlemler
              </Text>
              <Progress value={stats.successRate} mt={5} size="sm" color="green" />
            </div>
          </Group>
        </Paper>
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
        <Paper p="md" shadow="xs" radius="md" withBorder>
          <Title order={4} mb={20}>Haftalık İşlem Aktivitesi</Title>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart
              data={transactionData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip />
              <Line type="monotone" dataKey="gelir" stroke="#8884d8" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="gider" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </Paper>

        <Paper p="md" shadow="xs" radius="md" withBorder>
          <Title order={4} mb={20}>Son İşlemler</Title>
          <Stack gap="md">
            {stats.recentTransactions.map((transaction) => (
              <Paper key={transaction.id} shadow="xs" p="md" withBorder>
                <Group justify="space-between">
                  <div>
                    <Text size="sm" fw={500}>{transaction.from} → {transaction.to}</Text>
                    <Text size="xs" c="dimmed">{transaction.date}</Text>
                  </div>
                  <Badge color="green">{formatCurrency(transaction.amount)}</Badge>
                </Group>
              </Paper>
            ))}
            <Button 
              component={Link} 
              to="/history" 
              variant="subtle" 
              rightSection={<IconArrowRight size={14} />} 
              size="sm"
            >
              Tüm İşlemleri Görüntüle
            </Button>
          </Stack>
        </Paper>
      </SimpleGrid>

      <Paper p="md" shadow="xs" radius="md" withBorder>
        <Title order={3} mb="sm">Hızlı İşlemler</Title>
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
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
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder component={Link} to="/history" style={{ textDecoration: 'none' }}>
              <Group>
                <IconChartBar size={24} color="green" />
                <Text fw={500} size="lg">İşlem Geçmişi</Text>
              </Group>
              <Text mt="sm" c="dimmed" size="sm">
                Tüm işlem geçmişinizi görüntüleyin
              </Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder component={Link} to="/profile" style={{ textDecoration: 'none' }}>
              <Group>
                <IconUserCircle size={24} color="violet" />
                <Text fw={500} size="lg">Profil Ayarları</Text>
              </Group>
              <Text mt="sm" c="dimmed" size="sm">
                Hesap bilgilerinizi yönetin
              </Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder style={{ textDecoration: 'none' }}>
              <Group>
                <IconStar size={24} color="orange" />
                <Text fw={500} size="lg">Favori Alıcılar</Text>
              </Group>
              <Text mt="sm" c="dimmed" size="sm">
                Sık kullanılan alıcılarınıza hızlıca erişin
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