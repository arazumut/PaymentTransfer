import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  Paper, 
  Button, 
  Text, 
  Title, 
  Group, 
  Stack, 
  Loader, 
  Box, 
  Alert, 
  Card,
  NumberInput,
  TextInput,
  ActionIcon,
  Divider,
  Modal
} from '@mantine/core';
import { 
  IconScan, 
  IconCheck, 
  IconX, 
  IconAlertCircle, 
  IconInfoCircle,
  IconArrowRight,
  IconShield,
  IconCopy,
  IconQrcode 
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';

interface QrScannerProps {
  onSuccess?: (data: any) => void;
}

const QrScanner = ({ onSuccess }: QrScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const qrContainerRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // QR tarayıcıyı başlat
  const startScanner = () => {
    if (!qrContainerRef.current) return;

    const qrScanner = new Html5Qrcode("qr-reader");
    scannerRef.current = qrScanner;
    setIsScanning(true);
    setError(null);

    qrScanner.start(
      { facingMode: "environment" },
      {
        fps: 10,
        qrbox: { width: 250, height: 250 }
      },
      (decodedText) => {
        // Başarıyla tarandı
        stopScanner();
        
        try {
          // QR tokenını çıkar
          if (onSuccess) {
            onSuccess(decodedText);
          }
        } catch (err) {
          setError('Geçersiz QR kod formatı');
        }
      },
      (errorMessage) => {
        // Hata olduğunda (normal tarama sürecinde bu çok tetiklenir)
        console.log(errorMessage);
      }
    )
    .catch(err => {
      setError(`Kamera açılamadı: ${err.message}`);
      setIsScanning(false);
    });
  };

  // QR tarayıcıyı durdur
  const stopScanner = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop()
        .then(() => {
          setIsScanning(false);
        })
        .catch(err => {
          console.error("Scanner durdurulamadı:", err);
        });
    }
  };

  // Component temizlendiğinde tarayıcıyı kapat
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <Paper p="md" withBorder>
      <Stack>
        <Title order={3} ta="center">QR Kod Tara</Title>
        
        {error && (
          <Alert color="red" title="Hata" icon={<IconAlertCircle />}>
            {error}
          </Alert>
        )}
        
        <Box 
          ref={qrContainerRef}
          id="qr-reader"
          style={{ 
            width: '100%', 
            maxWidth: '500px', 
            margin: '0 auto',
            height: '300px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f8f9fa'
          }}
        >
          {!isScanning && !error && (
            <Text color="dimmed" ta="center">
              <IconScan size={48} style={{ display: 'block', margin: '0 auto', marginBottom: '12px' }} />
              Kamerayı açmak için taramayı başlatın
            </Text>
          )}
          
          {isScanning && !error && (
            <Loader size="lg" />
          )}
        </Box>
        
        <Group justify="center">
          {!isScanning ? (
            <Button 
              leftSection={<IconScan size={16} />}
              color="blue"
              onClick={startScanner}
            >
              Taramayı Başlat
            </Button>
          ) : (
            <Button 
              leftSection={<IconX size={16} />}
              color="red"
              onClick={stopScanner}
            >
              Durdur
            </Button>
          )}
        </Group>
        
        <Text size="sm" align="center" color="dimmed">
          <IconInfoCircle size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
          QR kodu kameraya doğru tutun. Otomatik olarak taranacaktır.
        </Text>
      </Stack>
    </Paper>
  );
};

export default function QrTransfer() {
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isCheckingQr, setIsCheckingQr] = useState(false);
  const [qrData, setQrData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amount, setAmount] = useState<number | ''>(0);
  const [description, setDescription] = useState('');
  const [generatedQr, setGeneratedQr] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Şu an için demo amaçlı sabit bir kullanıcı ID
  const currentUserId = 1;

  // QR kodu tarandığında
  const handleQrSuccess = async (qrToken: string) => {
    setIsCheckingQr(true);
    
    try {
      // QR token doğrulama
      const response = await fetch('http://localhost:3000/api/qr/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          qrToken,
          senderId: currentUserId
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setQrData(data.data);
        notifications.show({
          title: 'Başarılı',
          message: 'QR kod doğrulandı',
          color: 'green'
        });
      } else {
        notifications.show({
          title: 'Hata',
          message: data.message || 'QR kod doğrulanamadı',
          color: 'red'
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Hata',
        message: 'QR kod doğrulanırken bir hata oluştu',
        color: 'red'
      });
    } finally {
      setIsCheckingQr(false);
      setIsQrModalOpen(false);
    }
  };

  // Transfer işlemi
  const handleTransfer = async () => {
    if (!qrData) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('http://localhost:3000/api/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          senderId: currentUserId,
          receiverId: qrData.receiverId,
          amount: qrData.amount || amount,
          description: qrData.description || description
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        notifications.show({
          title: 'Transfer Başarılı',
          message: 'Para transferi başarıyla tamamlandı',
          color: 'green'
        });
        
        // Başarılı transferden sonra bilgileri temizle
        setQrData(null);
        setAmount(0);
        setDescription('');
        
        // Ana sayfaya yönlendir
        navigate('/');
      } else {
        notifications.show({
          title: 'Transfer Başarısız',
          message: data.message || 'Para transferi sırasında bir hata oluştu',
          color: 'red'
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Hata',
        message: 'Para transferi sırasında bir hata oluştu',
        color: 'red'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // QR kod oluştur
  const generateQrCode = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/qr/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: currentUserId,
          amount: amount || undefined,
          description: description || undefined
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setGeneratedQr(data.data.token);
        notifications.show({
          title: 'QR Kod Oluşturuldu',
          message: 'QR kod başarıyla oluşturuldu',
          color: 'green'
        });
      } else {
        notifications.show({
          title: 'Hata',
          message: data.message || 'QR kod oluşturulamadı',
          color: 'red'
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Hata',
        message: 'QR kod oluşturulurken bir hata oluştu',
        color: 'red'
      });
    }
  };

  return (
    <Stack spacing="lg">
      <Title order={2}>QR Kod ile Para Transferi</Title>
      
      <Group grow>
        <Button 
          leftSection={<IconScan size={20} />} 
          size="lg"
          onClick={() => setIsQrModalOpen(true)}
        >
          QR Kod Tara
        </Button>
        
        <Button 
          leftSection={<IconQrcode size={20} />} 
          size="lg" 
          variant="outline"
          onClick={() => setIsGenerateModalOpen(true)}
        >
          QR Kod Oluştur
        </Button>
      </Group>
      
      {qrData && (
        <Card shadow="sm" padding="lg" withBorder>
          <Stack>
            <Title order={3}>Transfer Detayları</Title>
            
            <Group justify="apart">
              <Text fw={500}>Alıcı:</Text>
              <Text>{qrData.receiverName}</Text>
            </Group>
            
            {qrData.amount ? (
              <Group justify="apart">
                <Text fw={500}>Tutar:</Text>
                <Text>{qrData.amount} TL</Text>
              </Group>
            ) : (
              <NumberInput
                label="Tutar"
                placeholder="Gönderilecek tutarı girin"
                min={1}
                value={amount}
                onChange={setAmount}
                withAsterisk
              />
            )}
            
            {qrData.description ? (
              <Group justify="apart">
                <Text fw={500}>Açıklama:</Text>
                <Text>{qrData.description}</Text>
              </Group>
            ) : (
              <TextInput
                label="Açıklama"
                placeholder="Transfer açıklaması ekleyin"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            )}
            
            <Button
              leftSection={<IconArrowRight size={16} />}
              color="green"
              onClick={handleTransfer}
              loading={isSubmitting}
              disabled={!qrData.amount && !amount}
            >
              Transferi Tamamla
            </Button>
          </Stack>
        </Card>
      )}
      
      {/* QR Tarama Modalı */}
      <Modal
        opened={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        title="QR Kod Tara"
        size="lg"
        centered
      >
        <QrScanner onSuccess={handleQrSuccess} />
      </Modal>
      
      {/* QR Oluşturma Modalı */}
      <Modal
        opened={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        title="QR Kod Oluştur"
        size="lg"
        centered
      >
        <Stack spacing="md">
          <Text size="sm">
            Başkaları tarafından taranarak size para transferi yapılmasını sağlayan bir QR kod oluşturun. 
            Tutarı belirtirseniz, tarayanlar tam o tutarı gönderebilir.
          </Text>
          
          <NumberInput
            label="Tutar (opsiyonel)"
            description="Belli bir tutar için QR oluşturmak istiyorsanız doldurun"
            placeholder="Tutarı girin"
            min={0}
            value={amount}
            onChange={setAmount}
          />
          
          <TextInput
            label="Açıklama (opsiyonel)"
            placeholder="Transfer açıklaması ekleyin"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          
          <Button 
            onClick={generateQrCode}
            leftSection={<IconQrcode size={16} />}
          >
            QR Kod Oluştur
          </Button>
          
          {generatedQr && (
            <>
              <Divider label="QR Kodunuz" labelPosition="center" />
              
              <Box ta="center">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${generatedQr}`} 
                  alt="QR Code" 
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
                
                <Text size="sm" mt="xs">
                  Bu QR kod 15 dakika boyunca geçerlidir.
                </Text>
                
                <Group justify="center" mt="md">
                  <Button 
                    variant="outline" 
                    leftSection={<IconCopy size={16} />}
                    onClick={() => {
                      navigator.clipboard.writeText(generatedQr);
                      notifications.show({
                        title: 'Kopyalandı',
                        message: 'QR token kopyalandı',
                        color: 'green'
                      });
                    }}
                  >
                    Token'ı Kopyala
                  </Button>
                </Group>
              </Box>
            </>
          )}
          
          <Alert icon={<IconShield size={16} />} color="blue">
            <Text size="sm">
              Güvenlik Notu: Bu QR kodu sadece güvendiğiniz kişilerle paylaşın. QR kodun süresi 15 dakika sonra dolar.
            </Text>
          </Alert>
        </Stack>
      </Modal>
    </Stack>
  );
}
