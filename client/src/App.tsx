import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import UserDetails from './pages/UserDetails';
import TransferMoney from './pages/TransferMoney';
import TransactionHistory from './pages/TransactionHistory';

const theme = createTheme({
  primaryColor: 'blue',
  defaultRadius: 'md',
  fontFamily: 'Poppins, sans-serif',
});

function App() {
  return (
    <MantineProvider theme={theme}>
      <Notifications position="top-right" />
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="users/:id" element={<UserDetails />} />
            <Route path="transfer" element={<TransferMoney />} />
            <Route path="history" element={<TransactionHistory />} />
          </Route>
        </Routes>
      </Router>
    </MantineProvider>
  );
}

export default App;
