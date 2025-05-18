import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Paper, Title, Text, Group, Badge, Button, Divider, Loader, Card, Grid, List, ThemeIcon, ActionIcon } from '@mantine/core';
import { IconArrowLeft, IconWallet, IconCalendar, IconCreditCard, IconCircleCheck, IconUserCircle } from '@tabler/icons-react';
import { getUserById, getTransactionHistory } from '../services/api';
import type { User, Transaction, ApiResponse } from '../types';

const UserDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const userId = parseInt(id);
        
        // Kullanıcı detaylarını getir
        const userResponse = await getUserById(userId) as ApiResponse<User>;
        if (userResponse.success) {
          setUser(userResponse.data);
        }
        
        // Kullanıcının işlemlerini getir
        const transactionsResponse = await getTransactionHistory(userId) as ApiResponse<Transaction[]>;
        if (transactionsResponse.success) {
          // Son 5 işlemi al
          setTransactions(transactionsResponse.data.slice(0, 5));
        }
      } catch (error) {
        console.error('Kullanıcı detayları getirilirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

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

  if (!user) {
    return (
      <Paper p="md" shadow="md" radius="md" withBorder>
        <Title order={2} mb="lg">Kullanıcı Bulunamadı</Title>
        <Text c="dimmed">İstenen kullanıcı detayları bulunamadı.</Text>
        <Button
          leftSection={<IconArrowLeft size={16} />}
          mt="lg"
          onClick={() => navigate('/')}
        >
          Ana Sayfaya Dön
        </Button>
      </Paper>
    );
  }

  return (
    <div>
      <Group mb="md">
        <ActionIcon 
          variant="subtle" 
          size="lg" 
          onClick={() => navigate('/')}
          aria-label="Geri dön"
        >
          <IconArrowLeft size={20} />
        </ActionIcon>
        <Title order={2}>Kullanıcı Detayları</Title>
      </Group>

      <Grid>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder mb="md">
            <Group mb="md" wrap="nowrap">
              <ThemeIcon size="xl" radius="xl" color="blue">
                <IconUserCircle size={28} />
              </ThemeIcon>
              <div>
                <Title order={3}>{user.name}</Title>
                <Text size="sm" c="dimmed">Kullanıcı ID: {user.id}</Text>
              </div>
            </Group>

            <List spacing="sm">
              <List.Item
                icon={
                  <ThemeIcon color="blue" size="lg" radius="xl">
                    <IconWallet size={20} />
                  </ThemeIcon>
                }
              >
                <Text fw={500}>Bakiye:</Text>
                <Badge size="lg" variant="light" color={user.balance > 0 ? 'green' : 'red'}>
                  {formatCurrency(user.balance)}
                </Badge>
              </List.Item>
              
              <List.Item
                icon={
                  <ThemeIcon color="green" size="lg" radius="xl">
                    <IconCalendar size={20} />
                  </ThemeIcon>
                }
              >
                <Text fw={500}>Kayıt Tarihi:</Text> {formatDate(user.createdAt)}
              </List.Item>
            </List>

            <Group justify="flex-end" mt="xl">
              <Button
                component={Link}
                to={`/transfer?receiverId=${user.id}`}
                leftSection={<IconCreditCard size={16} />}
                color="blue"
              >
                Bu Kullanıcıya Para Gönder
              </Button>
            </Group>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" mb="xs">
              <Title order={4}>Son İşlemler</Title>
              <Button 
                variant="subtle" 
                size="xs" 
                component={Link} 
                to={`/history?user_id=${user.id}`} 
                rightSection={<IconArrowLeft size={14} style={{ transform: 'rotate(180deg)' }} />}
              >
                Tümünü Gör
              </Button>
            </Group>
            
            <Divider mb="md" />
            
            {transactions.length > 0 ? (
              <List spacing="sm">
                {transactions.map((transaction) => (
                  <List.Item
                    key={transaction.id}
                    icon={
                      <ThemeIcon 
                        color={transaction.status === 'completed' ? 'green' : transaction.status === 'pending' ? 'yellow' : 'red'} 
                        size="md" 
                        radius="xl"
                      >
                        <IconCircleCheck size={16} />
                      </ThemeIcon>
                    }
                  >
                    <Group justify="space-between" wrap="nowrap">
                      <div>
                        <Text size="sm">
                          {transaction.senderId === user.id 
                            ? `Gönderim: ${transaction.receiver?.name || `Kullanıcı #${transaction.receiverId}`}`
                            : `Alım: ${transaction.sender?.name || `Kullanıcı #${transaction.senderId}`}`}
                        </Text>
                        <Text size="xs" c="dimmed">{formatDate(transaction.createdAt)}</Text>
                      </div>
                      <Badge 
                        color={transaction.senderId === user.id ? 'red' : 'green'}
                      >
                        {transaction.senderId === user.id ? '-' : '+'}{formatCurrency(transaction.amount)}
                      </Badge>
                    </Group>
                  </List.Item>
                ))}
              </List>
            ) : (
              <Text c="dimmed" ta="center" py="lg">İşlem geçmişi bulunamadı.</Text>
            )}
          </Card>
        </Grid.Col>
      </Grid>
    </div>
  );
};

export default UserDetails; 