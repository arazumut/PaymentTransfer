import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MantineProvider, createTheme, ColorSchemeScript } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { useLocalStorage } from '@mantine/hooks';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import UserDetails from './pages/UserDetails';
import TransferMoney from './pages/TransferMoney';
import TransactionHistory from './pages/TransactionHistory';
import ProfileSettings from './pages/ProfileSettings';
import QrTransfer from './pages/QrTransfer';
import MoneyRequest from './pages/MoneyRequest';

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
        <Router>
          <Routes>
            <Route path="/" element={<Layout toggleColorScheme={toggleColorScheme} colorScheme={colorScheme} />}>
              <Route index element={<Dashboard />} />
              <Route path="users/:id" element={<UserDetails />} />
              <Route path="transfer" element={<TransferMoney />} />
              <Route path="qr-transfer" element={<QrTransfer />} />
              <Route path="money-request" element={<MoneyRequest />} />
              <Route path="history" element={<TransactionHistory />} />
              <Route path="profile" element={<ProfileSettings />} />
            </Route>
          </Routes>
        </Router>
      </MantineProvider>
    </>
  );
}

export default App;
