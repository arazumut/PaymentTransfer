import cron from 'node-cron';
import { getPendingScheduledTransfers, executeTransfer } from './transferService';
import { logger } from '../utils/logger';

export const processScheduledTransfers = async () => {
  try {
    logger.info('Zamanlı transferler kontrol ediliyor...');
    
    // Zamanı gelmiş bekleyen transferleri getir
    const pendingTransfers = await getPendingScheduledTransfers();
    
    if (pendingTransfers.length === 0) {
      logger.info('İşlenecek zamanlı transfer yok');
      return;
    }
    
    logger.info(`${pendingTransfers.length} adet bekleyen transfer bulundu`);
    
    // Her bir transferi işle
    for (const transfer of pendingTransfers) {
      try {
        await executeTransfer(
          transfer.senderId,
          transfer.receiverId,
          transfer.amount,
          transfer.description || undefined
        );
        
        logger.info(`Zamanlı transfer başarıyla tamamlandı: #${transfer.id}`);
      } catch (error) {
        logger.error(`Zamanlı transfer işlenirken hata: #${transfer.id}`, error);
      }
    }
  } catch (error) {
    logger.error('Zamanlı transferleri işlerken hata:', error);
  }
};

export const scheduleTransfers = () => {
  // Her dakika çalışacak şekilde ayarla
  cron.schedule('* * * * *', async () => {
    await processScheduledTransfers();
  });
  
  logger.info('Zamanlı transfer işleme servisi başlatıldı');
}; 