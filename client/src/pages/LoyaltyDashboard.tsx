import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, Grid, Card, 
  CardContent, Divider, List, ListItem, ListItemText, 
  Chip, CircularProgress, Pagination, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Tab, Tabs } from '@mui/material';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { 
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Loyalty as LoyaltyIcon,
  CardGiftcard as CardGiftcardIcon,
  EmojiEvents as TrophyIcon,
  Timeline as TimelineIcon,
  ArrowUpward as UpgradeIcon,
  Stars as StarsIcon
} from '@mui/icons-material';
import api from '../services/api';
import { useSnackbar } from 'notistack';

const LoyaltyDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loyaltyData, setLoyaltyData] = useState(null);
  const [transactions, setTransactions] = useState({ transactions: [], pagination: {} });
  const [loading, setLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const { enqueueSnackbar } = useSnackbar();

  // Sadakat puanı durumunu getir
  useEffect(() => {
    const fetchLoyaltyStatus = async () => {
      try {
        setLoading(true);
        const response = await api.get('/loyalty/status');
        setLoyaltyData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Sadakat puanları alınırken hata:', error);
        enqueueSnackbar('Sadakat puanları yüklenemedi', { variant: 'error' });
        setLoading(false);
      }
    };

    fetchLoyaltyStatus();
  }, [enqueueSnackbar]);

  // Sadakat puanı işlemlerini getir
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setTransactionsLoading(true);
        const response = await api.get(`/loyalty/transactions?page=${page}&limit=10`);
        setTransactions(response.data);
        setTransactionsLoading(false);
      } catch (error) {
        console.error('Sadakat puanı işlemleri alınırken hata:', error);
        enqueueSnackbar('İşlem geçmişi yüklenemedi', { variant: 'error' });
        setTransactionsLoading(false);
      }
    };

    fetchTransactions();
  }, [page, enqueueSnackbar]);

  // Sayfa değişikliği
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // İşlem tipine göre simge
  const getTransactionIcon = (type) => {
    if (type === 'earn') {
      return <TrendingUpIcon fontSize="small" color="success" />;
    }
    return <TrendingDownIcon fontSize="small" color="error" />;
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Sadakat Puanları
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {/* Puan Kartı */}
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <LoyaltyIcon color="primary" fontSize="large" sx={{ mr: 1 }} />
                    <Typography variant="h6">
                      Toplam Puanlarınız
                    </Typography>
                  </Box>
                  <Typography variant="h3" color="primary" gutterBottom>
                    {loyaltyData?.currentPoints || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Her 100 TL transfer için 10 puan kazanırsınız.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Ödül Kartı */}
            <Grid item xs={12} md={8}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <CardGiftcardIcon color="primary" fontSize="large" sx={{ mr: 1 }} />
                    <Typography variant="h6">
                      Puanlarınızla Neler Yapabilirsiniz?
                    </Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                        <Typography variant="subtitle1" gutterBottom>
                          500 Puan
                        </Typography>
                        <Typography variant="body2">
                          5 TL transfer ücreti indirimi
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                        <Typography variant="subtitle1" gutterBottom>
                          1000 Puan
                        </Typography>
                        <Typography variant="body2">
                          10 TL transfer ücreti indirimi
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                        <Typography variant="subtitle1" gutterBottom>
                          2000 Puan
                        </Typography>
                        <Typography variant="body2">
                          25 TL değerinde hediye kuponu
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                        <Typography variant="subtitle1" gutterBottom>
                          5000 Puan
                        </Typography>
                        <Typography variant="body2">
                          Premium hesap özellikleri (1 ay)
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Son İşlemler */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Son İşlemler
                  </Typography>
                  <List sx={{ p: 0 }}>
                    {loyaltyData?.recentTransactions?.length > 0 ? (
                      loyaltyData.recentTransactions.map((transaction) => (
                        <React.Fragment key={transaction.id}>
                          <ListItem 
                            sx={{ 
                              px: 0,
                              py: 1.5,
                              display: 'flex',
                              justifyContent: 'space-between'
                            }}
                          >
                            <ListItemText
                              primary={transaction.description}
                              secondary={format(
                                new Date(transaction.createdAt),
                                'dd.MM.yyyy HH:mm',
                                { locale: tr }
                              )}
                              sx={{ mr: 2 }}
                            />
                            <Box display="flex" alignItems="center">
                              {getTransactionIcon(transaction.type)}
                              <Typography 
                                variant="body1" 
                                color={transaction.points > 0 ? 'success.main' : 'error.main'}
                                sx={{ ml: 0.5 }}
                              >
                                {transaction.points > 0 ? '+' : ''}{transaction.points}
                              </Typography>
                            </Box>
                          </ListItem>
                          <Divider />
                        </React.Fragment>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                        Henüz işlem bulunmuyor
                      </Typography>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Tüm İşlemler */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Tüm Puan İşlemleri
                  </Typography>
                  
                  {transactionsLoading ? (
                    <Box display="flex" justifyContent="center" my={2}>
                      <CircularProgress size={30} />
                    </Box>
                  ) : transactions.transactions.length > 0 ? (
                    <>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Tarih</TableCell>
                              <TableCell>Açıklama</TableCell>
                              <TableCell>Tür</TableCell>
                              <TableCell align="right">Puan</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {transactions.transactions.map((transaction) => (
                              <TableRow key={transaction.id}>
                                <TableCell>
                                  {format(
                                    new Date(transaction.createdAt),
                                    'dd.MM.yyyy HH:mm',
                                    { locale: tr }
                                  )}
                                </TableCell>
                                <TableCell>{transaction.description}</TableCell>
                                <TableCell>
                                  <Chip 
                                    label={transaction.type === 'earn' ? 'Kazanım' : 'Harcama'} 
                                    color={transaction.type === 'earn' ? 'success' : 'error'}
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell align="right">
                                  <Typography 
                                    color={transaction.points > 0 ? 'success.main' : 'error.main'}
                                  >
                                    {transaction.points > 0 ? '+' : ''}{transaction.points}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                      
                      {transactions.pagination && transactions.pagination.pages > 1 && (
                        <Box display="flex" justifyContent="center" mt={3}>
                          <Pagination 
                            count={transactions.pagination.pages} 
                            page={page}
                            onChange={handlePageChange}
                            color="primary"
                          />
                        </Box>
                      )}
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                      Henüz işlem bulunmuyor
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default LoyaltyDashboard;
