import { useState } from 'react';
import { 
  Stack, 
  Title, 
  Text, 
  Paper, 
  TextInput, 
  Button, 
  Group, 
  Avatar, 
  Divider, 
  SimpleGrid, 
  Switch,
  Tabs,
  Select,
  PasswordInput
} from '@mantine/core';
import { 
  IconUser, 
  IconLock, 
  IconBell, 
  IconUserCircle, 
  IconShield, 
  IconUpload 
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

const ProfileSettings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: 'Umut Araz',
    email: 'umut.araz@example.com',
    phone: '+90 555 123 4567',
    language: 'tr',
    notifications: {
      email: true,
      push: true,
      sms: false,
      transactions: true
    }
  });

  const handleProfileUpdate = () => {
    setLoading(true);
    
    // Simülasyon: API çağrısı
    setTimeout(() => {
      setLoading(false);
      notifications.show({
        title: 'Başarılı',
        message: 'Profil bilgileriniz güncellendi',
        color: 'green',
      });
    }, 1000);
  };

  const handlePasswordUpdate = () => {
    setLoading(true);
    
    // Simülasyon: API çağrısı
    setTimeout(() => {
      setLoading(false);
      notifications.show({
        title: 'Başarılı',
        message: 'Şifreniz başarıyla güncellendi',
        color: 'green',
      });
    }, 1000);
  };

  const handleNotificationUpdate = (key: string, value: boolean) => {
    setProfileData({
      ...profileData,
      notifications: {
        ...profileData.notifications,
        [key]: value
      }
    });
  };

  return (
    <Stack gap="xl">
      <Group justify="space-between">
        <Title order={2}>Profil Ayarları</Title>
      </Group>

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List mb="md">
          <Tabs.Tab value="profile" leftSection={<IconUserCircle size={16} />}>
            Profil Bilgileri
          </Tabs.Tab>
          <Tabs.Tab value="security" leftSection={<IconShield size={16} />}>
            Güvenlik
          </Tabs.Tab>
          <Tabs.Tab value="notifications" leftSection={<IconBell size={16} />}>
            Bildirimler
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="profile">
          <Paper p="md" withBorder>
            <Group align="flex-start" mb="xl">
              <Avatar 
                size={120} 
                radius="md" 
                color="blue"
                src={null}
              >
                {profileData.name.split(' ').map(n => n[0]).join('')}
              </Avatar>
              <Stack gap="xs">
                <Title order={4}>Profil Fotoğrafı</Title>
                <Text size="sm" c="dimmed">PNG, JPG veya GIF formatında, maksimum 1MB.</Text>
                <Button variant="light" leftSection={<IconUpload size={16} />} size="sm">
                  Yükle
                </Button>
              </Stack>
            </Group>

            <Divider my="md" />

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <TextInput
                label="Ad Soyad"
                value={profileData.name}
                onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                leftSection={<IconUser size={16} />}
              />
              <TextInput
                label="E-posta"
                value={profileData.email}
                onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                disabled
              />
              <TextInput
                label="Telefon"
                value={profileData.phone}
                onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
              />
              <Select
                label="Dil"
                value={profileData.language}
                onChange={(val) => setProfileData({...profileData, language: val || 'tr'})}
                data={[
                  { value: 'tr', label: 'Türkçe' },
                  { value: 'en', label: 'İngilizce' },
                ]}
              />
            </SimpleGrid>

            <Group justify="flex-end" mt="xl">
              <Button variant="outline">İptal</Button>
              <Button onClick={handleProfileUpdate} loading={loading}>Kaydet</Button>
            </Group>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="security">
          <Paper p="md" withBorder>
            <Title order={4} mb="md">Şifre Değiştir</Title>
            
            <Stack gap="md">
              <PasswordInput
                label="Mevcut Şifre"
                placeholder="Mevcut şifrenizi girin"
                leftSection={<IconLock size={16} />}
              />
              <PasswordInput
                label="Yeni Şifre"
                placeholder="Yeni şifrenizi girin"
                leftSection={<IconLock size={16} />}
              />
              <PasswordInput
                label="Şifre Tekrar"
                placeholder="Yeni şifrenizi tekrar girin"
                leftSection={<IconLock size={16} />}
              />
            </Stack>

            <Group justify="flex-end" mt="xl">
              <Button variant="outline">İptal</Button>
              <Button onClick={handlePasswordUpdate} loading={loading}>Şifreyi Güncelle</Button>
            </Group>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="notifications">
          <Paper p="md" withBorder>
            <Title order={4} mb="md">Bildirim Tercihleri</Title>
            
            <Stack gap="md">
              <Group justify="space-between">
                <div>
                  <Text>E-posta Bildirimleri</Text>
                  <Text size="xs" c="dimmed">İşlemler ve güncellemeler hakkında e-posta alın</Text>
                </div>
                <Switch 
                  checked={profileData.notifications.email}
                  onChange={(e) => handleNotificationUpdate('email', e.currentTarget.checked)}
                  size="md"
                />
              </Group>

              <Divider />

              <Group justify="space-between">
                <div>
                  <Text>Push Bildirimleri</Text>
                  <Text size="xs" c="dimmed">Uygulama bildirimleri alın</Text>
                </div>
                <Switch 
                  checked={profileData.notifications.push}
                  onChange={(e) => handleNotificationUpdate('push', e.currentTarget.checked)}
                  size="md"
                />
              </Group>

              <Divider />

              <Group justify="space-between">
                <div>
                  <Text>SMS Bildirimleri</Text>
                  <Text size="xs" c="dimmed">Cep telefonunuza bildirimler alın</Text>
                </div>
                <Switch 
                  checked={profileData.notifications.sms}
                  onChange={(e) => handleNotificationUpdate('sms', e.currentTarget.checked)}
                  size="md"
                />
              </Group>

              <Divider />

              <Group justify="space-between">
                <div>
                  <Text>İşlem Bildirimleri</Text>
                  <Text size="xs" c="dimmed">Her para transferi işleminden sonra bildirim alın</Text>
                </div>
                <Switch 
                  checked={profileData.notifications.transactions}
                  onChange={(e) => handleNotificationUpdate('transactions', e.currentTarget.checked)}
                  size="md"
                />
              </Group>
            </Stack>

            <Group justify="flex-end" mt="xl">
              <Button>Ayarları Kaydet</Button>
            </Group>
          </Paper>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
};

export default ProfileSettings; 