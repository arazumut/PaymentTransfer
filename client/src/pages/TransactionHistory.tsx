import { useState, useEffect } from 'react';
import { Badge, Paper, Select, Table, Title, Text, Loader, Group, Card } from '@mantine/core';
import { getUsers, getTransactionHistory } from '../services/api';
import type { User, Transaction, ApiResponse } from '../types';

const TransactionHistory = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

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

  useEffect(() => {
    if (selectedUserId) {
      fetchTransactions(parseInt(selectedUserId));
    }
  }, [selectedUserId]);

  const fetchTransactions = async (userId: number) => {
    try {
      setTransactionsLoading(true);
      const response = await getTransactionHistory(userId) as ApiResponse<Transaction[]>;
      if (response.success) {
        setTransactions(response.data);
      }
    } catch (error) {
      console.error('İşlem geçmişi getirilirken hata oluştu:', error);
      setTransactions([]);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    let color = 'blue';
    
    switch (status) {
      case 'completed':
        color = 'green';
        break;
      case 'pending':
        color = 'yellow';
        break;
      case 'failed':
        color = 'red';
        break;
    }
    
    const label = status === 'completed' ? 'Tamamlandı' : status === 'pending' ? 'Beklemede' : 'Başarısız';
    
    return <Badge color={color}>{label}</Badge>;
  };

  const userOptions = users.map((user) => ({
    value: user.id.toString(),
    label: `${user.name} (${user.id})`,
  }));

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <Paper p="md">
      <Title order={2} mb="lg">İşlem Geçmişi</Title>
      
      <Card mb="lg" withBorder shadow="sm" radius="md" p="md">
        <Text mb="sm">Kullanıcı işlem geçmişini görüntülemek için bir kullanıcı seçin:</Text>
        <Select
          placeholder="Kullanıcı seçin"
          data={userOptions}
          searchable
          value={selectedUserId}
          onChange={setSelectedUserId}
          style={{ maxWidth: '400px' }}
        />
      </Card>
      
      {transactionsLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '30px' }}>
          <Loader size="md" />
        </div>
      ) : selectedUserId ? (
        transactions.length > 0 ? (
          <Table striped withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>İşlem ID</Table.Th>
                <Table.Th>Tarih</Table.Th>
                <Table.Th>Gönderen</Table.Th>
                <Table.Th>Alıcı</Table.Th>
                <Table.Th>Tutar</Table.Th>
                <Table.Th>Durum</Table.Th>
                <Table.Th>Açıklama</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {transactions.map((transaction) => (
                <Table.Tr key={transaction.id}>
                  <Table.Td>{transaction.id}</Table.Td>
                  <Table.Td>{formatDate(transaction.createdAt)}</Table.Td>
                  <Table.Td>{transaction.sender?.name || transaction.senderId}</Table.Td>
                  <Table.Td>{transaction.receiver?.name || transaction.receiverId}</Table.Td>
                  <Table.Td>{formatCurrency(transaction.amount)}</Table.Td>
                  <Table.Td>{getStatusBadge(transaction.status)}</Table.Td>
                  <Table.Td>{transaction.description || '-'}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        ) : (
          <Group py="xl" justify="center">
            <Text c="dimmed">Bu kullanıcının işlem geçmişi bulunamadı.</Text>
          </Group>
        )
      ) : (
        <Group py="xl" justify="center">
          <Text c="dimmed">İşlem geçmişini görüntülemek için bir kullanıcı seçin.</Text>
        </Group>
      )}
    </Paper>
  );
};

export default TransactionHistory; 