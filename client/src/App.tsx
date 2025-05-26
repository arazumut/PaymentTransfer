import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MantineProvider, createTheme, ColorSchemeScript } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { useLocalStorage } from '@mantine/hooks';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './contexts/AuthContext';
import Dashboard from './pages/Dashboard';
import UserDetails from './pages/UserDetails';
import TransferMoney from './pages/TransferMoney';
import TransactionHistory from './pages/TransactionHistory';
import ProfileSettings from './pages/ProfileSettings';
import QrTransfer from './pages/QrTransfer';
import QrHistory from './pages/QrHistory';
import QrGenerator from './pages/QrGenerator';
import MoneyRequest from './pages/MoneyRequest';
import ScheduledPayments from './pages/ScheduledPayments';
import BudgetTracker from './pages/BudgetTracker';
import LoyaltyDashboard from './pages/LoyaltyDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import LandingPage from './pages/LandingPage';

const theme = createTheme({
  primaryColor: 'blue',
  colors: {
    blue: [
      '#E6F7FF', '#BAE7FF', '#91D5FF', '#69C0FF', 
      '#40A9FF', '#1890FF', '#096DD9', '#0050B3', 
      '#003A8C', '#002766'
    ],
    green: [
      '#F6FFED', '#D9F7BE', '#B7EB8F', '#95DE64', 
      '#73D13D', '#52C41A', '#389E0D', '#237804', 
      '#135200', '#092B00'
    ],
  },
  defaultRadius: 'md',
  fontFamily: 'Poppins, sans-serif',
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
    },
  },
});

function App() {
  const [colorScheme, setColorScheme] = useLocalStorage({
    key: 'color-scheme',
    defaultValue: 'light' as 'light' | 'dark',
  });

  const toggleColorScheme = () => {
    setColorScheme(colorScheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <>
      <ColorSchemeScript />
      <MantineProvider theme={theme} defaultColorScheme={colorScheme}>
        <Notifications position="top-right" />
        <AuthProvider>
          <Router>
            <Routes>
              {/* Genel Sayfalar */}
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Korumalı Sayfalar */}
              <Route path="/" element={
                <PrivateRoute>
                  <Layout toggleColorScheme={toggleColorScheme} colorScheme={colorScheme} />
                </PrivateRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path="users/:id" element={<UserDetails />} />
                <Route path="transfer" element={<TransferMoney />} />
                <Route path="qr-transfer" element={<QrTransfer />} />
                <Route path="qr-history" element={<QrHistory />} />
                <Route path="qr-generator" element={<QrGenerator />} />
                <Route path="money-request" element={<MoneyRequest />} />
                <Route path="history" element={<TransactionHistory />} />
                <Route path="profile" element={<ProfileSettings />} />
                <Route path="scheduled-payments" element={<ScheduledPayments />} />
                <Route path="budget-tracker" element={<BudgetTracker />} />
                <Route path="loyalty" element={<LoyaltyDashboard />} />
              </Route>
              
              {/* Yönlendirme */}
              <Route path="*" element={<Navigate to="/landing" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </MantineProvider>
    </>
  );
}

export default App;
