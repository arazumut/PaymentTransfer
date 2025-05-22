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
  Anchor,
  Checkbox
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { login } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
      rememberMe: false,
    },

    validate: {
      email: (value) => (/^\S+@\S+\.\S+$/.test(value) ? null : 'Geçerli bir email adresi giriniz'),
      password: (value) => (value.length === 0 ? 'Şifre alanı boş bırakılamaz' : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setLoading(true);
      
      const { rememberMe, ...loginData } = values;
      
      const response = await login(loginData);
      
      // Context'e kullanıcı bilgisini ve token'ı kaydet
      authLogin(response.data.token, response.data.user);
      
      notifications.show({
        title: 'Başarılı',
        message: 'Giriş başarılı',
        color: 'green',
      });
      
      // Ana sayfaya yönlendir
      navigate('/');
    } catch (error: any) {
      notifications.show({
        title: 'Hata',
        message: error.response?.data?.message || 'Giriş yapılırken bir hata oluştu',
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
        Hesabınız yok mu?{' '}
        <Link to="/register" style={{ textDecoration: 'none', color: 'var(--mantine-primary-color)' }}>
          Kayıt Ol
        </Link>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
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
          </Stack>

          <Group justify="space-between" mt="md">
            <Checkbox 
              label="Beni hatırla" 
              {...form.getInputProps('rememberMe', { type: 'checkbox' })}
            />
            <Anchor component={Link} to="/forgot-password" size="sm">
              Şifremi unuttum
            </Anchor>
          </Group>

          <Button type="submit" fullWidth mt="xl" loading={loading}>
            Giriş Yap
          </Button>
        </form>
        
        <Divider my="md" label="Demo Erişimi" labelPosition="center" />
        
        <Button 
          variant="light" 
          fullWidth 
          onClick={() => {
            form.setValues({
              email: 'demo@example.com',
              password: 'demo123',
              rememberMe: false
            });
          }}
        >
          Demo Hesaba Giriş Yap
        </Button>
      </Paper>
    </Container>
  );
};

export default Login;
