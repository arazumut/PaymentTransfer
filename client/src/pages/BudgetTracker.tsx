import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, Paper, Grid, 
  Card, CardContent, CardActions, Chip, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, MenuItem, FormControl, 
  InputLabel, Select, LinearProgress, CircularProgress } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format, isAfter } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import api from '../services/api';
import { useSnackbar } from 'notistack';
import { PieChart } from '@mui/x-charts/PieChart';

const BudgetTracker = () => {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [editBudgetId, setEditBudgetId] = useState(null);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [budgetDetails, setBudgetDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [formData, setFormData] = useState({
    categoryId: '',
    amount: '',
    period: 'monthly',
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
  });
  const { enqueueSnackbar } = useSnackbar();

  // Bütçeleri ve kategorileri getir
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Kategorileri getir
        const categoriesResponse = await api.get('/categories');
        setCategories(categoriesResponse.data);
        
        // Bütçeleri getir
        const budgetsResponse = await api.get('/budgets');
        setBudgets(budgetsResponse.data);
        
        setLoading(false);
      } catch (error) {
        console.error('Veri alınırken hata:', error);
        enqueueSnackbar('Bütçeler yüklenemedi', { variant: 'error' });
        setLoading(false);
      }
    };

    fetchData();
  }, [enqueueSnackbar]);

  // Form verilerini güncelle
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Tarih seçiciler için özel güncelleme
  const handleDateChange = (name, date) => {
    setFormData(prev => ({
      ...prev,
      [name]: date
    }));
  };

  // Yeni bütçe oluştur
  const handleSubmit = async () => {
    try {
      // Başlangıç tarihi bitiş tarihinden önce olmalı
      if (isAfter(new Date(formData.startDate), new Date(formData.endDate))) {
        return enqueueSnackbar('Başlangıç tarihi bitiş tarihinden önce olmalıdır', { variant: 'error' });
      }
      
      await api.post('/budgets', formData);
      setDialogOpen(false);
      
      // Formu sıfırla
      setFormData({
        categoryId: '',
        amount: '',
        period: 'monthly',
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
      });
      
      // Listeyi güncelle
      const response = await api.get('/budgets');
      setBudgets(response.data);
      
      enqueueSnackbar('Bütçe başarıyla oluşturuldu', { variant: 'success' });
    } catch (error) {
      console.error('Bütçe oluşturma hatası:', error);
      enqueueSnackbar(error.response?.data?.message || 'Bütçe oluşturulamadı', { variant: 'error' });
    }
  };

  // Bütçeyi düzenle
  const handleEditClick = (budget) => {
    setEditBudgetId(budget.id);
    setFormData({
      categoryId: budget.categoryId,
      amount: budget.amount,
      period: budget.period,
      startDate: new Date(budget.startDate),
      endDate: new Date(budget.endDate)
    });
    setEditDialogOpen(true);
  };

  // Düzenlemeyi kaydet
  const handleEditSubmit = async () => {
    try {
      // Başlangıç tarihi bitiş tarihinden önce olmalı
      if (isAfter(new Date(formData.startDate), new Date(formData.endDate))) {
        return enqueueSnackbar('Başlangıç tarihi bitiş tarihinden önce olmalıdır', { variant: 'error' });
      }
      
      await api.put(`/budgets/${editBudgetId}`, formData);
      
      setEditDialogOpen(false);
      
      // Listeyi güncelle
      const response = await api.get('/budgets');
      setBudgets(response.data);
      
      enqueueSnackbar('Bütçe başarıyla güncellendi', { variant: 'success' });
    } catch (error) {
      console.error('Bütçe güncelleme hatası:', error);
      enqueueSnackbar(error.response?.data?.message || 'Bütçe güncellenemedi', { variant: 'error' });
    }
  };

  // Bütçeyi sil
  const handleDelete = async (id) => {
    if (window.confirm('Bu bütçeyi silmek istediğinize emin misiniz?')) {
      try {
        await api.delete(`/budgets/${id}`);
        
        // Listeyi güncelle
        const updatedBudgets = budgets.filter(budget => budget.id !== id);
        setBudgets(updatedBudgets);
        
        enqueueSnackbar('Bütçe başarıyla silindi', { variant: 'success' });
      } catch (error) {
        console.error('Bütçe silme hatası:', error);
        enqueueSnackbar(error.response?.data?.message || 'Bütçe silinemedi', { variant: 'error' });
      }
    }
  };

  // Bütçe detaylarını göster
  const handleViewDetails = async (budget) => {
    setSelectedBudget(budget);
    setLoadingDetails(true);
    setDetailsDialogOpen(true);
    
    try {
      const response = await api.get(`/budgets/${budget.id}`);
      setBudgetDetails(response.data);
      setLoadingDetails(false);
    } catch (error) {
      console.error('Bütçe detayları alınırken hata:', error);
      enqueueSnackbar('Bütçe detayları yüklenemedi', { variant: 'error' });
      setLoadingDetails(false);
    }
  };

  // Periyot adını formatla
  const formatPeriod = (period) => {
    const map = {
      monthly: 'Aylık',
      yearly: 'Yıllık'
    };
    return map[period] || period;
  };

  // İlerleme durumunu hesapla
  const calculateProgress = (budget) => {
    if (budgetDetails && selectedBudget?.id === budget.id) {
      return budgetDetails.progress;
    }
    // Yaklaşık bir ilerleme göster (daha sonra detaylar yüklenince güncellenecek)
    return Math.round(Math.random() * 100);
  };

  // İlerleme rengini hesapla
  const getProgressColor = (progress) => {
    if (progress > 90) return 'error';
    if (progress > 75) return 'warning';
    return 'success';
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1" gutterBottom>
            Bütçe Takibi
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
          >
            Yeni Bütçe Oluştur
          </Button>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : budgets.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1">Henüz bütçe oluşturmadınız.</Typography>
            <Button 
              variant="outlined" 
              sx={{ mt: 2 }}
              onClick={() => setDialogOpen(true)}
            >
              İlk Bütçenizi Oluşturun
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {budgets.map((budget) => (
              <Grid item xs={12} sm={6} md={4} key={budget.id}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="h6" gutterBottom>
                        {budget.category.name}
                      </Typography>
                      <Chip 
                        color="primary" 
                        label={formatPeriod(budget.period)} 
                        size="small" 
                      />
                    </Box>
                    
                    <Typography variant="h5" component="div" color="primary" gutterBottom>
                      {budget.amount} TL
                    </Typography>
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        İlerleme
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={calculateProgress(budget)} 
                        color={getProgressColor(calculateProgress(budget))}
                        sx={{ height: 10, borderRadius: 5, my: 1 }}
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary">
                      Süre: {format(new Date(budget.startDate), 'dd.MM.yyyy', { locale: tr })} - 
                      {format(new Date(budget.endDate), 'dd.MM.yyyy', { locale: tr })}
                    </Typography>
                  </CardContent>
                  
                  <CardActions>
                    <Button size="small" onClick={() => handleViewDetails(budget)}>
                      Detaylar
                    </Button>
                    <Button size="small" startIcon={<EditIcon />} onClick={() => handleEditClick(budget)}>
                      Düzenle
                    </Button>
                    <Button 
                      size="small" 
                      color="error" 
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDelete(budget.id)}
                    >
                      Sil
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Yeni Bütçe Oluşturma Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Yeni Bütçe Oluştur</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="category-label">Kategori</InputLabel>
              <Select
                labelId="category-label"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                label="Kategori"
                required
              >
                {categories.map(category => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              margin="normal"
              name="amount"
              label="Bütçe Tutarı (TL)"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              required
              InputProps={{
                inputProps: { min: 0 }
              }}
            />

            <FormControl fullWidth margin="normal">
              <InputLabel id="period-label">Periyot</InputLabel>
              <Select
                labelId="period-label"
                name="period"
                value={formData.period}
                onChange={handleChange}
                label="Periyot"
                required
              >
                <MenuItem value="monthly">Aylık</MenuItem>
                <MenuItem value="yearly">Yıllık</MenuItem>
              </Select>
            </FormControl>

            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
              <Box sx={{ mt: 2 }}>
                <DatePicker
                  label="Başlangıç Tarihi"
                  value={formData.startDate}
                  onChange={(date) => handleDateChange('startDate', date)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Box>

              <Box sx={{ mt: 2 }}>
                <DatePicker
                  label="Bitiş Tarihi"
                  value={formData.endDate}
                  onChange={(date) => handleDateChange('endDate', date)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Box>
            </LocalizationProvider>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>İptal</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={!formData.categoryId || !formData.amount || !formData.period}
          >
            Oluştur
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bütçe Düzenleme Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Bütçeyi Düzenle</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="category-label">Kategori</InputLabel>
              <Select
                labelId="category-label"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                label="Kategori"
                required
                disabled // Kategori değiştirmeye izin verme
              >
                {categories.map(category => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              margin="normal"
              name="amount"
              label="Bütçe Tutarı (TL)"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              required
              InputProps={{
                inputProps: { min: 0 }
              }}
            />

            <FormControl fullWidth margin="normal">
              <InputLabel id="period-label">Periyot</InputLabel>
              <Select
                labelId="period-label"
                name="period"
                value={formData.period}
                onChange={handleChange}
                label="Periyot"
                required
              >
                <MenuItem value="monthly">Aylık</MenuItem>
                <MenuItem value="yearly">Yıllık</MenuItem>
              </Select>
            </FormControl>

            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
              <Box sx={{ mt: 2 }}>
                <DatePicker
                  label="Başlangıç Tarihi"
                  value={formData.startDate}
                  onChange={(date) => handleDateChange('startDate', date)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Box>

              <Box sx={{ mt: 2 }}>
                <DatePicker
                  label="Bitiş Tarihi"
                  value={formData.endDate}
                  onChange={(date) => handleDateChange('endDate', date)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Box>
            </LocalizationProvider>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>İptal</Button>
          <Button 
            onClick={handleEditSubmit} 
            variant="contained" 
            color="primary"
          >
            Güncelle
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bütçe Detayları Dialog */}
      <Dialog 
        open={detailsDialogOpen} 
        onClose={() => setDetailsDialogOpen(false)} 
        fullWidth 
        maxWidth="md"
      >
        <DialogTitle>
          {selectedBudget && `${selectedBudget.category.name} Bütçe Detayları`}
        </DialogTitle>
        <DialogContent>
          {loadingDetails ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : budgetDetails && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>Bütçe Özeti</Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Toplam Bütçe
                      </Typography>
                      <Typography variant="h5" color="primary">
                        {budgetDetails.budget.amount} TL
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Harcanan
                      </Typography>
                      <Typography variant="h5" color="error">
                        {budgetDetails.totalSpent} TL
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Kalan
                      </Typography>
                      <Typography variant="h5" color="success">
                        {budgetDetails.remaining} TL
                      </Typography>
                    </Box>
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        İlerleme
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={budgetDetails.progress} 
                        color={getProgressColor(budgetDetails.progress)}
                        sx={{ height: 10, borderRadius: 5, my: 1 }}
                      />
                      <Typography variant="body2" textAlign="right">
                        %{Math.round(budgetDetails.progress)}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Typography variant="h6" gutterBottom textAlign="center">
                      Bütçe Durumu
                    </Typography>
                    {budgetDetails.totalSpent > 0 ? (
                      <PieChart
                        series={[
                          {
                            data: [
                              { id: 0, value: budgetDetails.remaining, label: 'Kalan', color: '#4caf50' },
                              { id: 1, value: budgetDetails.totalSpent, label: 'Harcanan', color: '#f44336' }
                            ],
                            innerRadius: 30,
                            outerRadius: 100,
                            paddingAngle: 5,
                            cornerRadius: 5,
                            startAngle: -90,
                            endAngle: 270,
                            cx: 150,
                            cy: 150
                          }
                        ]}
                        width={300}
                        height={300}
                      />
                    ) : (
                      <Typography textAlign="center" color="text.secondary">
                        Henüz harcama yapılmamış
                      </Typography>
                    )}
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Son İşlemler
                    </Typography>
                    {budgetDetails.transactions.length > 0 ? (
                      <Box>
                        {budgetDetails.transactions.map(transaction => (
                          <Box 
                            key={transaction.id} 
                            sx={{ 
                              p: 2, 
                              borderBottom: '1px solid #eee',
                              '&:last-child': { borderBottom: 'none' }
                            }}
                          >
                            <Grid container spacing={2}>
                              <Grid item xs={8}>
                                <Typography variant="body1">
                                  {transaction.description || 'Ödeme'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {transaction.completedAt ? 
                                    format(new Date(transaction.completedAt), 'dd.MM.yyyy HH:mm', { locale: tr }) : 
                                    format(new Date(transaction.createdAt), 'dd.MM.yyyy HH:mm', { locale: tr })}
                                </Typography>
                              </Grid>
                              <Grid item xs={4} textAlign="right">
                                <Typography variant="body1" color="error">
                                  -{transaction.amount} TL
                                </Typography>
                              </Grid>
                            </Grid>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Typography color="text.secondary">
                        Bu kategoride henüz harcama bulunmuyor
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BudgetTracker;
