import { useState } from 'react';
import { 
  Paper, 
  Title, 
  Stack, 
  TextInput, 
  NumberInput, 
  Button, 
  Group, 
  Select, 
  Card,
  Text,
  Switch,
  Divider,
  Box,
  Stepper,
  Loader,
  Alert,
  ActionIcon,
  CopyButton,
  Tooltip
} from '@mantine/core';
import { 
  IconQrcode, 
  IconArrowRight, 
  IconCheck, 
  IconCopy, 
  IconShare,
  IconInfoCircle,
  IconAlertCircle
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../contexts/AuthContext';

// QR kod tipleri
const qrTypes = [
  { value: 'standard', label: 'Standart (Tek Kullanım)' },
  { value: 'fixed', label: 'Sabit Tutarlı' },
  { value: 'open', label: 'Açık Tutarlı (Alıcı tutar girebilir)' },
  { value: 'recurring', label: 'Tekrarlı Ödeme' }
];

// Tekrarlı ödeme aralık seçenekleri
const recurringIntervals = [
  { value: 'daily', label: 'Günlük' },
  { value: 'weekly', label: 'Haftalık' },
  { value: 'monthly', label: 'Aylık' }
];

export default function QrGenerator() {
  const [amount, setAmount] = useState<number | ''>(0);
  const [description, setDescription] = useState('');
  const [qrType, setQrType] = useState('standard');
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedQr, setGeneratedQr] = useState<any>(null);
  const [recurringInterval, setRecurringInterval] = useState<string | null>(null);
  const [maxUsageCount, setMaxUsageCount] = useState<number | ''>(1);
  const [limitUsage, setLimitUsage] = useState(false);
  
  const navigate = useNavigate();
  const { user } = useAuth();

  // QR kod oluştur
  const generateQrCode = async () => {
    if (!user) {
      notifications.show({
        title: 'Giriş Gerekli',
        message: 'Bu özelliği kullanmak için giriş yapmalısınız',
        color: 'red'
      });
      navigate('/login');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const payload: any = {
        userId: user.id,
        type: qrType
      };
      
      // Sabit tutarlıysa veya standart QR ise tutar ekle
      if (qrType === 'fixed' || qrType === 'standard') {
        if (!amount) {
          setError('Tutar belirtmelisiniz');
          setLoading(false);
          return;
        }
        payload.amount = amount;
      }
      
      // Açıklama varsa ekle
      if (description.trim()) {
        payload.description = description.trim();
      }
      
      // Tekrarlı ödemeyse interval ekle
      if (qrType === 'recurring' && recurringInterval) {
        payload.recurringInterval = recurringInterval;
      }
      
      // Kullanım limiti varsa ekle
      if (limitUsage && maxUsageCount && maxUsageCount > 0) {
        payload.maxUsageCount = maxUsageCount;
      }
      
      const response = await fetch('http://localhost:3000/api/qr/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setGeneratedQr(data.data);
        notifications.show({
          title: 'Başarılı',
          message: 'QR kod başarıyla oluşturuldu',
          color: 'green'
        });
        
        // Bir sonraki adıma geç
        setActiveStep(1);
      } else {
        setError(data.message || 'QR kod oluşturulamadı');
      }
    } catch (err) {
      setError('QR kod oluşturulurken bir hata oluştu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // QR kod paylaşma URL'i oluştur
  const getShareableUrl = (token: string) => {
    return `${window.location.origin}/transfer/qr/${token}`;
  };

  return (
    <Stack gap="lg">
      <Title order={2}>Gelişmiş QR Kod Oluşturucu</Title>
      
      <Stepper active={activeStep} onStepClick={setActiveStep} breakpoint="sm">
        <Stepper.Step
          label="Ayarlar"
          description="QR kod ayarları"
          icon={<IconQrcode size={18} />}
        >
          <Paper p="lg" withBorder mt="md">
            <Stack gap="md">
              <Select
                label="QR Kod Tipi"
                placeholder="Tip seçin"
                data={qrTypes}
                value={qrType}
                onChange={(val) => {
                  if (val) {
                    setQrType(val);
                    // Seçime göre bazı alanları sıfırla
                    if (val !== 'recurring') {
                      setRecurringInterval(null);
                    }
                  }
                }}
                required
              />
              
              {(qrType === 'standard' || qrType === 'fixed') && (
                <NumberInput
                  label="Tutar"
                  description="Alıcıya gönderilecek sabit tutar"
                  placeholder="Tutarı girin"
                  min={1}
                  value={amount}
                  onChange={(val) => setAmount(val)}
                  required
                />
              )}
              
              <TextInput
                label="Açıklama"
                description="Transfer için açıklama (isteğe bağlı)"
                placeholder="Ör: Yemek ödemesi"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              
              {qrType === 'recurring' && (
                <Select
                  label="Tekrarlı Ödeme Aralığı"
                  description="Ödemenin hangi sıklıkta tekrarlanacağı"
                  placeholder="Aralık seçin"
                  data={recurringIntervals}
                  value={recurringInterval}
                  onChange={(val) => setRecurringInterval(val)}
                  required
                />
              )}
              
              <Switch
                label="Kullanım sayısını sınırla"
                checked={limitUsage}
                onChange={(e) => setLimitUsage(e.currentTarget.checked)}
              />
              
              {limitUsage && (
                <NumberInput
                  label="Maksimum Kullanım Sayısı"
                  description="Bu QR kod en fazla kaç kez kullanılabilir"
                  placeholder="Ör: 5"
                  min={1}
                  value={maxUsageCount}
                  onChange={(val) => setMaxUsageCount(val)}
                  required
                />
              )}
              
              {qrType === 'open' && (
                <Alert icon={<IconInfoCircle size={16} />} color="blue">
                  Açık tutarlı QR kodlarda alıcı istediği tutarı girebilir. Dikkatli kullanın!
                </Alert>
              )}
              
              {qrType === 'recurring' && (
                <Alert icon={<IconInfoCircle size={16} />} color="yellow">
                  Tekrarlı ödeme QR kodları her kullanımda yeni bir transfer oluşturur. Belirtilen aralıkta tekrar kullanılabilir.
                </Alert>
              )}
              
              {error && (
                <Alert icon={<IconAlertCircle size={16} />} color="red">
                  {error}
                </Alert>
              )}
              
              <Group position="right" mt="md">
                <Button 
                  leftSection={<IconArrowRight size={18} />}
                  onClick={generateQrCode}
                  loading={loading}
                >
                  QR Kod Oluştur
                </Button>
              </Group>
            </Stack>
          </Paper>
        </Stepper.Step>
        
        <Stepper.Step
          label="QR Kod"
          description="Oluşturulan QR"
          icon={<IconCheck size={18} />}
        >
          {generatedQr ? (
            <Paper p="lg" withBorder mt="md">
              <Stack gap="md" align="center">
                <Title order={3}>QR Kodunuz Hazır</Title>
                
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${generatedQr.token}`} 
                  alt="QR Code" 
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
                
                <Card withBorder p="md" style={{ width: '100%' }}>
                  <Stack gap="sm">
                    <Group position="apart">
                      <Text fw={500}>Tip:</Text>
                      <Text>{qrTypes.find(t => t.value === qrType)?.label || qrType}</Text>
                    </Group>
                    
                    {amount && (
                      <Group position="apart">
                        <Text fw={500}>Tutar:</Text>
                        <Text>{amount} TL</Text>
                      </Group>
                    )}
                    
                    {description && (
                      <Group position="apart">
                        <Text fw={500}>Açıklama:</Text>
                        <Text>{description}</Text>
                      </Group>
                    )}
                    
                    {recurringInterval && (
                      <Group position="apart">
                        <Text fw={500}>Tekrarlı Ödeme:</Text>
                        <Text>{recurringIntervals.find(i => i.value === recurringInterval)?.label}</Text>
                      </Group>
                    )}
                    
                    {limitUsage && maxUsageCount && (
                      <Group position="apart">
                        <Text fw={500}>Maksimum Kullanım:</Text>
                        <Text>{maxUsageCount} kez</Text>
                      </Group>
                    )}
                    
                    <Group position="apart">
                      <Text fw={500}>Son Geçerlilik:</Text>
                      <Text>{new Date(generatedQr.expiresAt).toLocaleString('tr-TR')}</Text>
                    </Group>
                  </Stack>
                </Card>
                
                <Divider label="Paylaşım Seçenekleri" labelPosition="center" style={{ width: '100%' }} />
                
                <Group grow style={{ width: '100%' }}>
                  <CopyButton value={generatedQr.token} timeout={2000}>
                    {({ copied, copy }) => (
                      <Button
                        color={copied ? 'teal' : 'blue'}
                        leftSection={copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                        onClick={copy}
                        variant="outline"
                      >
                        {copied ? 'Kopyalandı' : 'Token Kopyala'}
                      </Button>
                    )}
                  </CopyButton>
                  
                  <CopyButton value={getShareableUrl(generatedQr.token)} timeout={2000}>
                    {({ copied, copy }) => (
                      <Button
                        color={copied ? 'teal' : 'blue'}
                        leftSection={copied ? <IconCheck size={16} /> : <IconShare size={16} />}
                        onClick={copy}
                      >
                        {copied ? 'Kopyalandı' : 'Paylaşım Linki'}
                      </Button>
                    )}
                  </CopyButton>
                </Group>
                
                <Alert icon={<IconInfoCircle size={16} />} color="blue" style={{ width: '100%' }}>
                  <Text size="sm">
                    Bu QR kod 15 dakika içinde kullanılmazsa geçerliliğini yitirecektir. QR geçmişinden durumunu kontrol edebilirsiniz.
                  </Text>
                </Alert>
                
                <Group position="apart" style={{ width: '100%' }}>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setActiveStep(0);
                      setGeneratedQr(null);
                    }}
                  >
                    Yeni QR Oluştur
                  </Button>
                  
                  <Button 
                    onClick={() => navigate('/qr-history')}
                  >
                    QR Geçmişine Git
                  </Button>
                </Group>
              </Stack>
            </Paper>
          ) : (
            <Box p="xl" ta="center">
              <Loader size="md" />
              <Text mt="md">QR kod bilgileri yükleniyor...</Text>
            </Box>
          )}
        </Stepper.Step>
      </Stepper>
    </Stack>
  );
}
