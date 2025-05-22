import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  TextInput, 
  PasswordInput, 
  Text, 
  Paper, 
  Group, 
  Button, 
  Container, 
  Title, 
  Divider, 
  Stack,
  NumberInput
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { register } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      password: '',
      passwordConfirmation: '',
      initialBalance: 1000,
    },

    validate: {
      name: (value) => (value.trim().length < 2 ? 'İsim en az 2 karakter olmalıdır' : null),
      email: (value) => (/^\S+@\S+\.\S+$/.test(value) ? null : 'Geçerli bir email adresi giriniz'),
      password: (value) => (value.length < 6 ? 'Şifre en az 6 karakter olmalıdır' : null),
      passwordConfirmation: (value, values) => 
        value !== values.password ? 'Şifreler eşleşmiyor' : null,
      initialBalance: (value) => 
        value < 0 ? 'Başlangıç bakiyesi negatif olamaz' : null,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setLoading(true);
      
      const { passwordConfirmation, ...registerData } = values;
      
      const response = await register(registerData);
      
      // Context'e kullanıcı bilgisini ve token'ı kaydet
      authLogin(response.data.token, response.data.user);
      
      notifications.show({
        title: 'Başarılı',
        message: 'Hesabınız başarıyla oluşturuldu',
        color: 'green',
      });
      
      // Ana sayfaya yönlendir
      navigate('/');
    } catch (error: any) {
      notifications.show({
        title: 'Hata',
        message: error.response?.data?.message || 'Kayıt sırasında bir hata oluştu',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center" fw={900}>
        Para Transfer'e Hoş Geldiniz!
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Zaten hesabınız var mı?{' '}
        <Link to="/login" style={{ textDecoration: 'none', color: 'var(--mantine-primary-color)' }}>
          Giriş Yap
        </Link>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              required
              label="İsim"
              placeholder="Adınız Soyadınız"
              {...form.getInputProps('name')}
            />
            
            <TextInput
              required
              label="Email"
              placeholder="ornek@mail.com"
              {...form.getInputProps('email')}
            />

            <PasswordInput
              required
              label="Şifre"
              placeholder="Şifreniz"
              {...form.getInputProps('password')}
            />

            <PasswordInput
              required
              label="Şifre Tekrar"
              placeholder="Şifrenizi tekrar girin"
              {...form.getInputProps('passwordConfirmation')}
            />
            
            <NumberInput
              label="Başlangıç Bakiyesi (TL)"
              placeholder="1000"
              min={0}
              {...form.getInputProps('initialBalance')}
            />
          </Stack>

          <Group justify="space-between" mt="lg">
            <Text size="sm" c="dimmed">
              Kayıt olarak, <Link to="/terms" style={{ color: 'var(--mantine-primary-color)' }}>şartlar ve koşulları</Link> kabul etmiş olursunuz.
            </Text>
          </Group>

          <Button type="submit" fullWidth mt="xl" loading={loading}>
            Hesap Oluştur
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default Register;
