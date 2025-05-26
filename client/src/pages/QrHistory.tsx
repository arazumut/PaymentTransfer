import { useEffect, useState } from 'react';
import { 
  Paper, 
  Title, 
  Stack, 
  Table, 
  Text, 
  Badge, 
  Button, 
  Group,
  ActionIcon,
  Modal,
  Alert,
  Loader,
  Card,
  Divider
} from '@mantine/core';
import { 
  IconClock, 
  IconCheck, 
  IconX, 
  IconQrcode, 
  IconTrash, 
  IconEye,
  IconShare,
  IconCopy
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../contexts/AuthContext';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/tr';

// dayjs ayarları
dayjs.extend(relativeTime);
dayjs.locale('tr');

// QR Kod tipi renkleri
const qrTypeColors = {
  'standard': 'blue',
  'fixed': 'green',
  'open': 'yellow',
  'recurring': 'violet'
};

// QR Kod tipi açıklamaları
const qrTypeLabels = {
  'standard': 'Standart (Tek Kullanım)',
  'fixed': 'Sabit Tutarlı',
  'open': 'Açık Tutarlı',
  'recurring': 'Tekrarlı Ödeme'
};

export default function QrHistory() {
  const [qrCodes, setQrCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQr, setSelectedQr] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Kullanıcı giriş yapmamışsa yönlendir
  useEffect(() => {
    if (!user) {
      notifications.show({
        title: 'Giriş Gerekli',
        message: 'Bu özelliği kullanmak için giriş yapmalısınız',
        color: 'red'
      });
      navigate('/login');
    } else {
      fetchQrHistory();
    }
  }, [user, navigate]);

  // QR kod geçmişini getir
  const fetchQrHistory = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:3000/api/qr/history', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setQrCodes(data.data);
      } else {
        setError(data.message || 'QR kod geçmişi alınamadı');
      }
    } catch (err) {
      setError('QR kod geçmişi alınırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // QR kodu sil
  const deleteQrCode = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/qr/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        notifications.show({
          title: 'Başarılı',
          message: 'QR kod başarıyla silindi',
          color: 'green'
        });
        
        // Listeyi güncelle
        setQrCodes(qrCodes.filter(qr => qr.id !== id));
        
        // Modal açıksa kapat
        if (selectedQr?.id === id) {
          setIsModalOpen(false);
        }
      } else {
        notifications.show({
          title: 'Hata',
          message: data.message || 'QR kod silinemedi',
          color: 'red'
        });
      }
    } catch (err) {
      notifications.show({
        title: 'Hata',
        message: 'QR kod silinirken bir hata oluştu',
        color: 'red'
      });
    }
  };

  // QR kodu görüntüle
  const viewQrCode = (qrCode: any) => {
    setSelectedQr(qrCode);
    setIsModalOpen(true);
  };

  // QR kod paylaşma URL'i oluştur
  const getShareableUrl = (token: string) => {
    return `${window.location.origin}/transfer/qr/${token}`;
  };

  return (
    <Stack gap="lg">
      <Group position="apart">
        <Title order={2}>QR Kod Geçmişi</Title>
        
        <Button 
          leftSection={<IconQrcode size={20} />}
          onClick={() => navigate('/qr-transfer')}
        >
          Yeni QR Kod Oluştur
        </Button>
      </Group>
      
      {loading ? (
        <Paper p="xl" withBorder>
          <Stack align="center" spacing="md">
            <Loader size="lg" />
            <Text color="dimmed">QR kod geçmişi yükleniyor...</Text>
          </Stack>
        </Paper>
      ) : error ? (
        <Alert color="red" title="Hata">
          {error}
        </Alert>
      ) : qrCodes.length === 0 ? (
        <Paper p="xl" withBorder>
          <Stack align="center" spacing="md">
            <IconQrcode size={48} opacity={0.5} />
            <Text size="lg" weight={500}>Henüz hiç QR kod oluşturmamışsınız</Text>
            <Text color="dimmed" size="sm" align="center">
              Para transferi almak için QR kod oluşturun.
            </Text>
            <Button 
              leftSection={<IconQrcode size={16} />}
              onClick={() => navigate('/qr-transfer')}
            >
              QR Kod Oluştur
            </Button>
          </Stack>
        </Paper>
      ) : (
        <Paper p="md" withBorder>
          <Table striped highlightOnHover>
            <thead>
              <tr>
                <th>Oluşturulma Tarihi</th>
                <th>Tür</th>
                <th>Tutar</th>
                <th>Kullanım</th>
                <th>Durum</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {qrCodes.map((qr) => (
                <tr key={qr.id}>
                  <td>
                    <Text size="sm">
                      {dayjs(qr.createdAt).format('DD.MM.YYYY HH:mm')}
                    </Text>
                    <Text size="xs" color="dimmed">
                      {dayjs(qr.createdAt).fromNow()}
                    </Text>
                  </td>
                  <td>
                    <Badge color={qrTypeColors[qr.type as keyof typeof qrTypeColors] || 'gray'}>
                      {qrTypeLabels[qr.type as keyof typeof qrTypeLabels] || qr.type}
                    </Badge>
                  </td>
                  <td>
                    {qr.amount ? (
                      <Text weight={500}>{qr.amount} TL</Text>
                    ) : (
                      <Text size="sm" color="dimmed">Belirtilmemiş</Text>
                    )}
                  </td>
                  <td>
                    <Text size="sm">
                      {qr.usageCount} / {qr.maxUsageCount || '∞'}
                    </Text>
                  </td>
                  <td>
                    {qr.isActive && new Date(qr.expiresAt) > new Date() ? (
                      <Badge color="green">Aktif</Badge>
                    ) : (
                      <Badge color="red">Pasif</Badge>
                    )}
                  </td>
                  <td>
                    <Group spacing={8}>
                      <ActionIcon 
                        color="blue" 
                        variant="subtle"
                        onClick={() => viewQrCode(qr)}
                      >
                        <IconEye size={18} />
                      </ActionIcon>
                      
                      <ActionIcon 
                        color="red" 
                        variant="subtle"
                        onClick={() => deleteQrCode(qr.id)}
                        disabled={!qr.isActive}
                      >
                        <IconTrash size={18} />
                      </ActionIcon>
                    </Group>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Paper>
      )}
      
      {/* QR Kod Detay Modalı */}
      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="QR Kod Detayları"
        size="lg"
        centered
      >
        {selectedQr && (
          <Stack>
            <Card withBorder>
              <Stack>
                <Group position="apart">
                  <Text weight={500}>Tür:</Text>
                  <Badge color={qrTypeColors[selectedQr.type as keyof typeof qrTypeColors] || 'gray'}>
                    {qrTypeLabels[selectedQr.type as keyof typeof qrTypeLabels] || selectedQr.type}
                  </Badge>
                </Group>
                
                <Group position="apart">
                  <Text weight={500}>Oluşturulma:</Text>
                  <Text>{dayjs(selectedQr.createdAt).format('DD.MM.YYYY HH:mm')}</Text>
                </Group>
                
                <Group position="apart">
                  <Text weight={500}>Son Geçerlilik:</Text>
                  <Text>
                    {dayjs(selectedQr.expiresAt).format('DD.MM.YYYY HH:mm')}
                    {' '}
                    <Text span color={new Date(selectedQr.expiresAt) > new Date() ? 'green' : 'red'} size="sm">
                      ({new Date(selectedQr.expiresAt) > new Date() ? 'Aktif' : 'Süresi Dolmuş'})
                    </Text>
                  </Text>
                </Group>
                
                <Group position="apart">
                  <Text weight={500}>Tutar:</Text>
                  <Text>{selectedQr.amount ? `${selectedQr.amount} TL` : 'Belirtilmemiş'}</Text>
                </Group>
                
                {selectedQr.description && (
                  <Group position="apart">
                    <Text weight={500}>Açıklama:</Text>
                    <Text>{selectedQr.description}</Text>
                  </Group>
                )}
                
                <Group position="apart">
                  <Text weight={500}>Kullanım:</Text>
                  <Text>{selectedQr.usageCount} / {selectedQr.maxUsageCount || '∞'}</Text>
                </Group>
                
                <Group position="apart">
                  <Text weight={500}>Durum:</Text>
                  <Badge color={selectedQr.isActive ? 'green' : 'red'}>
                    {selectedQr.isActive ? 'Aktif' : 'Pasif'}
                  </Badge>
                </Group>
              </Stack>
            </Card>
            
            <Divider label="QR Kod" labelPosition="center" />
            
            <Stack align="center">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${selectedQr.id}`} 
                alt="QR Code" 
                style={{ maxWidth: '100%', height: 'auto' }}
              />
              
              <Group>
                <Button 
                  leftSection={<IconCopy size={16} />}
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedQr.id);
                    notifications.show({
                      title: 'Kopyalandı',
                      message: 'QR token kopyalandı',
                      color: 'green'
                    });
                  }}
                >
                  Token'ı Kopyala
                </Button>
                
                <Button 
                  leftSection={<IconShare size={16} />}
                  variant="outline"
                  onClick={() => {
                    const shareUrl = getShareableUrl(selectedQr.id);
                    navigator.clipboard.writeText(shareUrl);
                    notifications.show({
                      title: 'Kopyalandı',
                      message: 'Paylaşım linki kopyalandı',
                      color: 'green'
                    });
                  }}
                >
                  Paylaşım Linki
                </Button>
              </Group>
            </Stack>
            
            <Group position="right">
              <Button 
                color="red" 
                leftSection={<IconTrash size={16} />}
                onClick={() => {
                  deleteQrCode(selectedQr.id);
                }}
                disabled={!selectedQr.isActive}
              >
                QR Kodu Sil
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}
