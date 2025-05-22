import prisma from './db';
import { logger } from './logger';
import bcrypt from 'bcrypt';

async function seed() {
  try {
    logger.info('Veritabanı seed işlemi başlatılıyor...');

    // Mevcut tüm verileri temizle
    await prisma.transaction.deleteMany({});
    await prisma.user.deleteMany({});
    
    // Demo kullanıcıları oluştur
    const demoSalt = await bcrypt.genSalt(10);
    const demoHashedPassword = await bcrypt.hash('password123', demoSalt);
    
    // Ahmet kullanıcısı
    const ahmet = await prisma.user.create({
      data: {
        name: 'Ahmet Yılmaz',
        email: 'ahmet@example.com',
        password: demoHashedPassword,
        balance: 5000,
      },
    });
    logger.info(`Kullanıcı oluşturuldu: ${ahmet.name}, Bakiye: ${ahmet.balance}`);
    
    // Ayşe kullanıcısı
    const ayse = await prisma.user.create({
      data: {
        name: 'Ayşe Demir',
        email: 'ayse@example.com',
        password: demoHashedPassword,
        balance: 3000,
      },
    });
    logger.info(`Kullanıcı oluşturuldu: ${ayse.name}, Bakiye: ${ayse.balance}`);
    
    // İlk transfer
    await prisma.transaction.create({
      data: {
        senderId: ahmet.id,
        receiverId: ayse.id,
        amount: 500,
        description: 'Örnek transfer',
        status: 'completed',
        completedAt: new Date(),
      }
    });

    // Kullanıcı bakiyelerini güncelle
    await prisma.user.update({
      where: { id: ahmet.id },
      data: { balance: ahmet.balance - 500 }
    });

    await prisma.user.update({
      where: { id: ayse.id },
      data: { balance: ayse.balance + 500 }
    });

    logger.info(`${ahmet.name}'den ${ayse.name}'e 500 TL transfer edildi.`);

    // Demo kullanıcısı oluştur
    await prisma.user.create({
      data: {
        name: 'Demo Kullanıcı',
        email: 'demo@example.com',
        password: demoHashedPassword,
        balance: 2500,
      },
    });
    logger.info('Demo kullanıcısı oluşturuldu: demo@example.com / password123');
    
    logger.info('Veritabanı seed işlemi başarıyla tamamlandı.');
  } catch (error) {
    logger.error('Seed işlemi sırasında hata oluştu:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Doğrudan çalıştırılırsa seed işlemini başlat
if (require.main === module) {
  seed()
    .then(() => {
      logger.info('Seed işlemi tamamlandı. Çıkış yapılıyor.');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Seed işlemi sırasında hata:', error);
      process.exit(1);
    });
}

export default seed;
