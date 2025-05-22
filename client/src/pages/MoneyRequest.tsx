import { useState, useEffect } from 'react';
import { 
  Paper, 
  Title, 
  Text, 
  Stack, 
  Group, 
  Button, 
  Select, 
  NumberInput, 
  TextInput, 
  Card, 
  Badge,
  ActionIcon,
  Loader,
  Alert,
  Box,
  Divider,
  Avatar,
  Modal,
  Tabs
} from '@mantine/core';
import { 
  IconCashBanknote, 
  IconCheck, 
  IconX, 
  IconClock, 
  IconAlertTriangle,
  IconArrowRight,
  IconArrowLeft,
  IconUsers
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';

interface User {
  id: number;
  name: string;
  balance?: number;
}

interface MoneyRequest {
  id: number;
  amount: number;
  description?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  requester: {
    id: number;
    name: string;
  };
  requested: {
    id: number;
    name: string;
  };
  createdAt: string;
  completedAt?: string;
}

export default function MoneyRequestPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | ''>(0);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sentRequests, setSentRequests] = useState<MoneyRequest[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<MoneyRequest[]>([]);
  const [isOpenDetailModal, setIsOpenDetailModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MoneyRequest | null>(null);
  const navigate = useNavigate();
  
  // Şu an için demo amaçlı sabit bir kullanıcı ID
  const currentUserId = 1;

  // Kullanıcıları getir
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/users');
        const data = await response.json();
        
        if (data.success) {
          // Kendisi hariç kullanıcıları filtrele
          const filteredUsers = data.data.filter((user: User) => user.id !== currentUserId);
          setUsers(filteredUsers);
        }
      } catch (error) {
        console.error('Kullanıcılar getirilirken hata:', error);
        notifications.show({
          title: 'Hata',
          message: 'Kullanıcılar getirilirken bir hata oluştu',
          color: 'red'
        });
      }
    };
    
    const fetchRequests = async () => {
      try {
        // Gönderilen istekler
        const sentResponse = await fetch(`http://localhost:3000/api/money-requests/user/${currentUserId}?type=sent`);
        const sentData = await sentResponse.json();
        
        if (sentData.success) {
          setSentRequests(sentData.data);
        }
        
        // Alınan istekler
        const receivedResponse = await fetch(`http://localhost:3000/api/money-requests/user/${currentUserId}?type=received`);
        const receivedData = await receivedResponse.json();
        
        if (receivedData.success) {
          setReceivedRequests(receivedData.data);
        }
      } catch (error) {
        console.error('Para istekleri getirilirken hata:', error);
        notifications.show({
          title: 'Hata',
          message: 'Para istekleri getirilirken bir hata oluştu',
          color: 'red'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
    fetchRequests();
  }, [currentUserId]);

  // Para isteği oluştur
  const handleCreateRequest = async () => {
    if (!selectedUser || !amount) {
      notifications.show({
        title: 'Eksik Bilgi',
        message: 'Lütfen alıcı ve tutar bilgilerini eksiksiz doldurun',
        color: 'yellow'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('http://localhost:3000/api/money-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requesterId: currentUserId,
          requestedId: parseInt(selectedUser),
          amount,
          description
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        notifications.show({
          title: 'Başarılı',
          message: 'Para isteği başarıyla oluşturuldu',
          color: 'green'
        });
        
        // Başarılı istekten sonra bilgileri temizle
        setSelectedUser(null);
        setAmount(0);
        setDescription('');
        
        // İstek listesini güncelle
        setSentRequests([data.data, ...sentRequests]);
      } else {
        notifications.show({
          title: 'Hata',
          message: data.message || 'Para isteği oluşturulurken bir hata oluştu',
          color: 'red'
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Hata',
        message: 'Para isteği oluşturulurken bir hata oluştu',
        color: 'red'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Para isteğine yanıt ver
  const respondToRequest = async (requestId: number, action: 'approve' | 'reject' | 'cancel') => {
    try {
      const response = await fetch(`http://localhost:3000/api/money-requests/${requestId}/respond`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action })
      });
      
      const data = await response.json();
      
      if (data.success) {
        notifications.show({
          title: 'Başarılı',
          message: data.message || 'İşlem başarıyla tamamlandı',
          color: 'green'
        });
        
        // İstek listelerini güncelle
        const updateRequests = (requests: MoneyRequest[]) => {
          return requests.map(req => 
            req.id === requestId 
              ? { 
                  ...req, 
                  status: action === 'approve' 
                    ? 'approved' 
                    : action === 'reject' 
                    ? 'rejected' 
                    : 'cancelled',
                  completedAt: new Date().toISOString()
                } 
              : req
          );
        };
        
        setSentRequests(updateRequests(sentRequests));
        setReceivedRequests(updateRequests(receivedRequests));
        
        // Modal'ı kapat
        if (isOpenDetailModal) {
          setIsOpenDetailModal(false);
        }
      } else {
        notifications.show({
          title: 'Hata',
          message: data.message || 'İşlem sırasında bir hata oluştu',
          color: 'red'
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Hata',
        message: 'İşlem sırasında bir hata oluştu',
        color: 'red'
      });
    }
  };

  // Para isteği detaylarını göster
  const showRequestDetails = (request: MoneyRequest) => {
    setSelectedRequest(request);
    setIsOpenDetailModal(true);
  };

  // Tarih formatı
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Duruma göre renk ve ikon
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { color: 'yellow', icon: <IconClock size={16} />, text: 'Bekliyor' };
      case 'approved':
        return { color: 'green', icon: <IconCheck size={16} />, text: 'Onaylandı' };
      case 'rejected':
        return { color: 'red', icon: <IconX size={16} />, text: 'Reddedildi' };
      case 'cancelled':
        return { color: 'gray', icon: <IconX size={16} />, text: 'İptal Edildi' };
      default:
        return { color: 'gray', icon: null, text: status };
    }
  };

  // Para formatı
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
        <Loader size="xl" />
      </Box>
    );
  }

  return (
    <Stack spacing="xl">
      <Title order={2}>Para İstekleri</Title>
      
      <Paper p="md" withBorder>
        <Title order={3} mb="md">Yeni Para İsteği Oluştur</Title>
        
        <Stack spacing="md">
          <Select
            label="Kimden İsteniyor"
            placeholder="Para isteyeceğiniz kişiyi seçin"
            data={users.map(user => ({ value: user.id.toString(), label: user.name }))}
            value={selectedUser}
            onChange={setSelectedUser}
            searchable
            clearable
            icon={<IconUsers size={16} />}
            withAsterisk
          />
          
          <NumberInput
            label="Tutar"
            placeholder="İstenilen tutarı girin"
            min={1}
            value={amount}
            onChange={setAmount}
            icon={<IconCashBanknote size={16} />}
            withAsterisk
          />
          
          <TextInput
            label="Açıklama"
            placeholder="İsteğiniz için bir açıklama ekleyin (isteğe bağlı)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          
          <Button
            onClick={handleCreateRequest}
            loading={isSubmitting}
            disabled={!selectedUser || !amount}
          >
            Para İsteği Gönder
          </Button>
        </Stack>
      </Paper>
      
      <Tabs defaultValue="received">
        <Tabs.List>
          <Tabs.Tab value="received" leftSection={<IconArrowLeft size={16} />}>
            Gelen İstekler {receivedRequests.filter(r => r.status === 'pending').length > 0 && (
              <Badge size="xs" color="red" variant="filled" ml={5}>
                {receivedRequests.filter(r => r.status === 'pending').length}
              </Badge>
            )}
          </Tabs.Tab>
          <Tabs.Tab value="sent" leftSection={<IconArrowRight size={16} />}>
            Gönderilen İstekler
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="received" pt="xs">
          <Stack mt="md">
            {receivedRequests.length === 0 ? (
              <Alert color="gray" title="Bilgi">
                Henüz gelen para isteği bulunmuyor.
              </Alert>
            ) : (
              receivedRequests.map(request => {
                const status = getStatusInfo(request.status);
                
                return (
                  <Card key={request.id} withBorder shadow="sm">
                    <Group position="apart">
                      <Group>
                        <Avatar color="blue" radius="xl">
                          {request.requester.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <div>
                          <Text fw={500}>{request.requester.name}</Text>
                          <Text size="xs" color="dimmed">
                            {formatDate(request.createdAt)}
                          </Text>
                        </div>
                      </Group>
                      <Badge color={status.color} leftSection={status.icon}>{status.text}</Badge>
                    </Group>
                    
                    <Group position="apart" mt="md">
                      <Text size="xl" fw={700}>
                        {formatCurrency(request.amount)}
                      </Text>
                      
                      {request.status === 'pending' && (
                        <Group spacing="xs">
                          <Button
                            size="xs"
                            color="green"
                            onClick={() => respondToRequest(request.id, 'approve')}
                            leftSection={<IconCheck size={16} />}
                          >
                            Onayla
                          </Button>
                          <Button
                            size="xs"
                            color="red"
                            variant="outline"
                            onClick={() => respondToRequest(request.id, 'reject')}
                            leftSection={<IconX size={16} />}
                          >
                            Reddet
                          </Button>
                        </Group>
                      )}
                    </Group>
                    
                    {request.description && (
                      <Text size="sm" mt="xs" color="dimmed">
                        {request.description}
                      </Text>
                    )}
                  </Card>
                );
              })
            )}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="sent" pt="xs">
          <Stack mt="md">
            {sentRequests.length === 0 ? (
              <Alert color="gray" title="Bilgi">
                Henüz gönderilen para isteği bulunmuyor.
              </Alert>
            ) : (
              sentRequests.map(request => {
                const status = getStatusInfo(request.status);
                
                return (
                  <Card key={request.id} withBorder shadow="sm">
                    <Group position="apart">
                      <Group>
                        <Avatar color="blue" radius="xl">
                          {request.requested.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <div>
                          <Text fw={500}>{request.requested.name}</Text>
                          <Text size="xs" color="dimmed">
                            {formatDate(request.createdAt)}
                          </Text>
                        </div>
                      </Group>
                      <Badge color={status.color} leftSection={status.icon}>{status.text}</Badge>
                    </Group>
                    
                    <Group position="apart" mt="md">
                      <Text size="xl" fw={700}>
                        {formatCurrency(request.amount)}
                      </Text>
                      
                      {request.status === 'pending' && (
                        <Button
                          size="xs"
                          color="gray"
                          onClick={() => respondToRequest(request.id, 'cancel')}
                        >
                          İptal Et
                        </Button>
                      )}
                    </Group>
                    
                    {request.description && (
                      <Text size="sm" mt="xs" color="dimmed">
                        {request.description}
                      </Text>
                    )}
                  </Card>
                );
              })
            )}
          </Stack>
        </Tabs.Panel>
      </Tabs>
      
      {/* İstek Detay Modalı */}
      <Modal
        opened={isOpenDetailModal}
        onClose={() => setIsOpenDetailModal(false)}
        title="Para İsteği Detayı"
        centered
      >
        {selectedRequest && (
          <Stack>
            <Group position="apart">
              <Text fw={500}>Durum:</Text>
              <Badge color={getStatusInfo(selectedRequest.status).color}>
                {getStatusInfo(selectedRequest.status).text}
              </Badge>
            </Group>
            
            <Group position="apart">
              <Text fw={500}>İsteyen:</Text>
              <Text>{selectedRequest.requester.name}</Text>
            </Group>
            
            <Group position="apart">
              <Text fw={500}>İstenen:</Text>
              <Text>{selectedRequest.requested.name}</Text>
            </Group>
            
            <Group position="apart">
              <Text fw={500}>Tutar:</Text>
              <Text>{formatCurrency(selectedRequest.amount)}</Text>
            </Group>
            
            {selectedRequest.description && (
              <Group position="apart">
                <Text fw={500}>Açıklama:</Text>
                <Text>{selectedRequest.description}</Text>
              </Group>
            )}
            
            <Group position="apart">
              <Text fw={500}>Oluşturulma Tarihi:</Text>
              <Text>{formatDate(selectedRequest.createdAt)}</Text>
            </Group>
            
            {selectedRequest.completedAt && (
              <Group position="apart">
                <Text fw={500}>Tamamlanma Tarihi:</Text>
                <Text>{formatDate(selectedRequest.completedAt)}</Text>
              </Group>
            )}
            
            {selectedRequest.status === 'pending' && (
              <Group position="right" mt="md">
                {selectedRequest.requester.id === currentUserId ? (
                  <Button
                    color="gray"
                    onClick={() => respondToRequest(selectedRequest.id, 'cancel')}
                  >
                    İsteği İptal Et
                  </Button>
                ) : (
                  <>
                    <Button
                      color="green"
                      onClick={() => respondToRequest(selectedRequest.id, 'approve')}
                    >
                      Onayla ve Gönder
                    </Button>
                    <Button
                      color="red"
                      variant="outline"
                      onClick={() => respondToRequest(selectedRequest.id, 'reject')}
                    >
                      Reddet
                    </Button>
                  </>
                )}
              </Group>
            )}
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}
