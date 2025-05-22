import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Title, 
  Image, 
  Text, 
  Button, 
  Stack, 
  Group, 
  Card,
  SimpleGrid,
  ThemeIcon
} from '@mantine/core';
import { 
  IconCreditCard, 
  IconShieldCheck, 
  IconChartBar, 
  IconArrowRight,
  IconDeviceMobile 
} from '@tabler/icons-react';
import { useAuth } from '../contexts/AuthContext';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Kullanıcı zaten giriş yapmışsa ana sayfaya yönlendir
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  const features = [
    {
      icon: <IconCreditCard size={24} />,
      title: 'Hızlı Para Transferi',
      description: 'Saniyeler içinde güvenli para transferi yapın. Komisyon ödemeden, anında transferler.'
    },
    {
      icon: <IconShieldCheck size={24} />,
      title: 'Güvenli İşlemler',
      description: 'End-to-end şifreleme ve güvenli altyapı ile tüm işlemleriniz koruma altında.'
    },
    {
      icon: <IconChartBar size={24} />,
      title: 'Finansal Takip',
      description: 'Tüm işlemlerinizi takip edin, raporlar alın ve finansal durumunuzu analiz edin.'
    },
    {
      icon: <IconDeviceMobile size={24} />,
      title: 'QR ile Kolay Ödeme',
      description: 'QR kodu ile saniyeler içinde para gönderin veya alın, kart veya IBAN\'a gerek yok.'
    }
  ];

  return (
    <Container size="lg">
      <Stack spacing={50} py={50}>
        {/* Hero Section */}
        <Stack align="center" spacing="xl" py={50}>
          <Title order={1} ta="center" size={48}>
            Para Transferlerini <Text component="span" c="blue" inherit>Kolay ve Güvenli</Text> Hale Getiriyoruz
          </Title>
          
          <Text size="xl" c="dimmed" maw={600} ta="center">
            Para Transfer uygulaması ile tüm finansal işlemlerinizi hızlı, güvenli ve komisyonsuz gerçekleştirin.
          </Text>
          
          <Group>
            <Button 
              size="lg" 
              component={Link} 
              to="/register" 
              rightSection={<IconArrowRight size={18} />}
            >
              Hemen Başla
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              component={Link} 
              to="/login"
            >
              Giriş Yap
            </Button>
          </Group>
        </Stack>
        
        {/* Features */}
        <Card withBorder shadow="md" radius="lg" p="xl">
          <Title order={2} ta="center" mb="xl">Özellikler</Title>
          
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl">
            {features.map((feature, index) => (
              <Group key={index} wrap="nowrap" align="flex-start">
                <ThemeIcon size={50} radius="md" variant="light">
                  {feature.icon}
                </ThemeIcon>
                
                <div>
                  <Text fw={700} size="lg" mb={7}>{feature.title}</Text>
                  <Text c="dimmed">{feature.description}</Text>
                </div>
              </Group>
            ))}
          </SimpleGrid>
        </Card>
        
        {/* Call to Action */}
        <Stack align="center" spacing="md" py={30}>
          <Title order={3} ta="center">
            Finansal özgürlüğünüz bir tık uzakta
          </Title>
          
          <Text c="dimmed" ta="center" maw={600}>
            Para Transfer ile hemen tanışın ve finansal işlemlerinizi kolaylaştırın.
            Basit, güvenli ve hızlı çözümlerle tanışmak için hemen kaydolun.
          </Text>
          
          <Button 
            size="lg" 
            mt="md" 
            component={Link} 
            to="/register" 
            rightSection={<IconArrowRight size={18} />}
          >
            Hesap Oluştur
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
};

export default LandingPage;
