import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Paper, Title, Select, TextInput, NumberInput, Button, Group, Switch, Loader, Divider } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';
import { v4 as uuidv4 } from 'uuid';
import { getUsers, createTransfer } from '../services/api';
import type { User, ApiResponse, Transaction } from '../types';

import '@mantine/dates/styles.css';

const TransferMoney = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const form = useForm({
    initialValues: {
      senderId: '',
      receiverId: '',
      amount: 0,
      description: '',
      scheduledAt: new Date(),
    },
    validate: {
      senderId: (value) => (value ? null : 'Gönderici seçilmelidir'),
      receiverId: (value) => (value ? null : 'Alıcı seçilmelidir'),
      amount: (value) => (value <= 0 ? 'Tutar pozitif olmalıdır' : null),
    },
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await getUsers() as ApiResponse<User[]>;
        if (response.success) {
          setUsers(response.data);
          
          // URL'den receiverId parametresini al
          const params = new URLSearchParams(location.search);
          const receiverId = params.get('receiverId');
          
          if (receiverId) {
            form.setFieldValue('receiverId', receiverId);
          }
        }
      } catch (error) {
        console.error('Kullanıcılar getirilirken hata oluştu:', error);
        notifications.show({
          title: 'Hata',
          message: 'Kullanıcılar yüklenirken bir hata oluştu',
          color: 'red',
          icon: <IconX />,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [location.search]);

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setSubmitting(true);
      
      if (values.senderId === values.receiverId) {
        form.setFieldError('receiverId', 'Gönderici ve alıcı aynı olamaz');
        return;
      }

      // Idempotency key üret
      const idempotencyKey = uuidv4();
      
      const transferData = {
        senderId: parseInt(values.senderId),
        receiverId: parseInt(values.receiverId),
        amount: values.amount,
        description: values.description,
        ...(isScheduled && { scheduledAt: values.scheduledAt.toISOString() }),
      };

      const response = await createTransfer(transferData, idempotencyKey) as ApiResponse<Transaction>;
      
      if (response.success) {
        notifications.show({
          title: 'Başarılı',
          message: response.message || 'Transfer başarıyla tamamlandı',
          color: 'green',
          icon: <IconCheck />,
        });
        
        // Form temizle
        form.reset();
        
        // Ana sayfaya yönlendir
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (error: unknown) {
      console.error('Transfer işlemi sırasında hata:', error);
      
      const errorMessage = 
        error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'data' in error.response && 
        error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data
          ? String(error.response.data.message)
          : 'Transfer işlemi sırasında bir hata oluştu';
      
      notifications.show({
        title: 'Hata',
        message: errorMessage,
        color: 'red',
        icon: <IconX />,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const userOptions = users.map((user) => ({
    value: user.id.toString(),
    label: `${user.name} (${user.id}) - Bakiye: ₺${user.balance.toFixed(2)}`,
  }));

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <Paper p="xl" shadow="md" radius="md" withBorder style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Title order={2} mb="lg">Para Transferi</Title>
      
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Select
          label="Gönderici"
          placeholder="Gönderici hesabı seçin"
          data={userOptions}
          searchable
          required
          mb="md"
          {...form.getInputProps('senderId')}
        />
        
        <Select
          label="Alıcı"
          placeholder="Alıcı hesabı seçin"
          data={userOptions}
          searchable
          required
          mb="md"
          {...form.getInputProps('receiverId')}
        />
        
        <NumberInput
          label="Tutar (₺)"
          placeholder="Transfer tutarını girin"
          required
          min={0.01}
          step={0.01}
          decimalScale={2}
          mb="md"
          {...form.getInputProps('amount')}
        />
        
        <TextInput
          label="Açıklama"
          placeholder="Transfer açıklaması"
          mb="lg"
          {...form.getInputProps('description')}
        />
        
        <Divider my="md" />
        
        <Group mb="md">
          <Switch
            label="Zamanlı Transfer"
            checked={isScheduled}
            onChange={(event) => setIsScheduled(event.currentTarget.checked)}
          />
        </Group>
        
        {isScheduled && (
          <DateTimePicker
            label="Transfer Tarihi ve Saati"
            placeholder="Transfer ne zaman yapılsın?"
            required
            minDate={new Date()}
            mb="md"
            valueFormat="DD/MM/YYYY HH:mm"
            {...form.getInputProps('scheduledAt')}
          />
        )}
        
        <Group justify="flex-end" mt="xl">
          <Button type="button" variant="outline" onClick={() => navigate('/')}>
            İptal
          </Button>
          <Button type="submit" loading={submitting}>
            {isScheduled ? 'Zamanlı Transfer Oluştur' : 'Şimdi Transfer Et'}
          </Button>
        </Group>
      </form>
    </Paper>
  );
};

export default TransferMoney; 