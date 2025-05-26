import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, Paper, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Chip, 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, 
  MenuItem, FormControl, InputLabel, Select } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import api from '../services/api';
import { useSnackbar } from 'notistack';

const ScheduledPayments = () => {
  const [payments, setPayments] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editPaymentId, setEditPaymentId] = useState(null);
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    receiverId: '',
    amount: '',
    description: '',
    frequency: 'monthly',
    startDate: new Date(),
    endDate: null
  });
  const { enqueueSnackbar } = useSnackbar();

  // Planlı ödemeleri getir
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const response = await api.get('/scheduled-payments');
        setPayments(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Planlı ödemeler alınırken hata:', error);
        enqueueSnackbar('Planlı ödemeler yüklenemedi', { variant: 'error' });
        setLoading(false);
      }
    };

    const fetchRecipients = async () => {
      try {
        const response = await api.get('/favorites');
        setRecipients(response.data);
      } catch (error) {
        console.error('Alıcılar alınırken hata:', error);
      }
    };

    fetchPayments();
    fetchRecipients();
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

  // Yeni planlı ödeme oluştur
  const handleSubmit = async () => {
    try {
      await api.post('/scheduled-payments', formData);
      setDialogOpen(false);
      
      // Formu sıfırla
      setFormData({
        receiverId: '',
        amount: '',
        description: '',
        frequency: 'monthly',
        startDate: new Date(),
        endDate: null
      });
      
      // Listeyi güncelle
      const response = await api.get('/scheduled-payments');
      setPayments(response.data);
      
      enqueueSnackbar('Planlı ödeme başarıyla oluşturuldu', { variant: 'success' });
    } catch (error) {
      console.error('Planlı ödeme oluşturma hatası:', error);
      enqueueSnackbar(error.response?.data?.message || 'Planlı ödeme oluşturulamadı', { variant: 'error' });
    }
  };

  // Planlı ödemeyi düzenle
  const handleEditClick = (payment) => {
    setEditPaymentId(payment.id);
    setFormData({
      receiverId: payment.receiverId,
      amount: payment.amount,
      description: payment.description || '',
      frequency: payment.frequency,
      startDate: new Date(payment.nextExecutionDate),
      endDate: payment.endDate ? new Date(payment.endDate) : null
    });
    setEditDialogOpen(true);
  };

  // Düzenlemeyi kaydet
  const handleEditSubmit = async () => {
    try {
      await api.put(`/scheduled-payments/${editPaymentId}`, {
        amount: formData.amount,
        description: formData.description,
        frequency: formData.frequency,
        endDate: formData.endDate
      });
      
      setEditDialogOpen(false);
      
      // Listeyi güncelle
      const response = await api.get('/scheduled-payments');
      setPayments(response.data);
      
      enqueueSnackbar('Planlı ödeme başarıyla güncellendi', { variant: 'success' });
    } catch (error) {
      console.error('Planlı ödeme güncelleme hatası:', error);
      enqueueSnackbar(error.response?.data?.message || 'Planlı ödeme güncellenemedi', { variant: 'error' });
    }
  };

  // Planlı ödemeyi iptal et
  const handleDelete = async (id) => {
    if (window.confirm('Bu planlı ödemeyi iptal etmek istediğinize emin misiniz?')) {
      try {
        await api.delete(`/scheduled-payments/${id}`);
        
        // Listeyi güncelle
        const updatedPayments = payments.filter(payment => payment.id !== id);
        setPayments(updatedPayments);
        
        enqueueSnackbar('Planlı ödeme başarıyla iptal edildi', { variant: 'success' });
      } catch (error) {
        console.error('Planlı ödeme iptal hatası:', error);
        enqueueSnackbar(error.response?.data?.message || 'Planlı ödeme iptal edilemedi', { variant: 'error' });
      }
    }
  };

  // Frekans adını formatla
  const formatFrequency = (frequency) => {
    const map = {
      daily: 'Günlük',
      weekly: 'Haftalık',
      monthly: 'Aylık',
      yearly: 'Yıllık'
    };
    return map[frequency] || frequency;
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1" gutterBottom>
            Planlı Ödemeler
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
          >
            Yeni Planlı Ödeme
          </Button>
        </Box>

        {loading ? (
          <Typography>Yükleniyor...</Typography>
        ) : payments.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1">Henüz planlı ödemeniz bulunmuyor.</Typography>
            <Button 
              variant="outlined" 
              sx={{ mt: 2 }}
              onClick={() => setDialogOpen(true)}
            >
              İlk Planlı Ödemenizi Oluşturun
            </Button>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Alıcı</TableCell>
                  <TableCell>Tutar</TableCell>
                  <TableCell>Açıklama</TableCell>
                  <TableCell>Frekans</TableCell>
                  <TableCell>Sonraki Ödeme</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.receiver.name}</TableCell>
                    <TableCell>{payment.amount} TL</TableCell>
                    <TableCell>{payment.description || '-'}</TableCell>
                    <TableCell>{formatFrequency(payment.frequency)}</TableCell>
                    <TableCell>
                      {format(new Date(payment.nextExecutionDate), 'dd.MM.yyyy', { locale: tr })}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        color={payment.isActive ? 'success' : 'error'} 
                        label={payment.isActive ? 'Aktif' : 'İptal Edildi'} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Button
                          startIcon={<EditIcon />}
                          size="small"
                          onClick={() => handleEditClick(payment)}
                        >
                          Düzenle
                        </Button>
                        <Button
                          startIcon={<DeleteIcon />}
                          color="error"
                          size="small"
                          onClick={() => handleDelete(payment.id)}
                        >
                          İptal Et
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Yeni Planlı Ödeme Oluşturma Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Yeni Planlı Ödeme Oluştur</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="recipient-label">Alıcı</InputLabel>
              <Select
                labelId="recipient-label"
                name="receiverId"
                value={formData.receiverId}
                onChange={handleChange}
                label="Alıcı"
                required
              >
                {recipients.map(recipient => (
                  <MenuItem key={recipient.favorite.id} value={recipient.favorite.id}>
                    {recipient.favorite.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              margin="normal"
              name="amount"
              label="Tutar (TL)"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              required
              InputProps={{
                inputProps: { min: 0 }
              }}
            />

            <TextField
              fullWidth
              margin="normal"
              name="description"
              label="Açıklama"
              value={formData.description}
              onChange={handleChange}
            />

            <FormControl fullWidth margin="normal">
              <InputLabel id="frequency-label">Ödeme Sıklığı</InputLabel>
              <Select
                labelId="frequency-label"
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                label="Ödeme Sıklığı"
                required
              >
                <MenuItem value="daily">Günlük</MenuItem>
                <MenuItem value="weekly">Haftalık</MenuItem>
                <MenuItem value="monthly">Aylık</MenuItem>
                <MenuItem value="yearly">Yıllık</MenuItem>
              </Select>
            </FormControl>

            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
              <Box sx={{ mt: 2 }}>
                <DatePicker
                  label="İlk Ödeme Tarihi"
                  value={formData.startDate}
                  onChange={(date) => handleDateChange('startDate', date)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Box>

              <Box sx={{ mt: 2 }}>
                <DatePicker
                  label="Bitiş Tarihi (Opsiyonel)"
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
            disabled={!formData.receiverId || !formData.amount || !formData.frequency}
          >
            Oluştur
          </Button>
        </DialogActions>
      </Dialog>

      {/* Planlı Ödeme Düzenleme Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Planlı Ödemeyi Düzenle</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              margin="normal"
              name="amount"
              label="Tutar (TL)"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              required
              InputProps={{
                inputProps: { min: 0 }
              }}
            />

            <TextField
              fullWidth
              margin="normal"
              name="description"
              label="Açıklama"
              value={formData.description}
              onChange={handleChange}
            />

            <FormControl fullWidth margin="normal">
              <InputLabel id="frequency-label">Ödeme Sıklığı</InputLabel>
              <Select
                labelId="frequency-label"
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                label="Ödeme Sıklığı"
                required
              >
                <MenuItem value="daily">Günlük</MenuItem>
                <MenuItem value="weekly">Haftalık</MenuItem>
                <MenuItem value="monthly">Aylık</MenuItem>
                <MenuItem value="yearly">Yıllık</MenuItem>
              </Select>
            </FormControl>

            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
              <Box sx={{ mt: 2 }}>
                <DatePicker
                  label="Bitiş Tarihi (Opsiyonel)"
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
    </Container>
  );
};

export default ScheduledPayments;
