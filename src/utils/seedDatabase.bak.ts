import prisma from './db';
import { logger } from './logger';
import bcrypt from 'bcrypt';

const users = [
  { name: 'Ahmet Yılmaz', email: 'ahmet@example.com', password: 'password123', balance: 5000 },
  { name: 'Ayşe Demir', email: 'ayse@example.com', password: 'password123', balance: 3000 },
  { name: 'Mehmet Kaya', email: 'mehmet@example.com', password: 'password123', balance: 8000 },
  { name: 'Fatma Şahin', email: 'fatma@example.com', password: 'password123', balance: 2000 },
  { name: 'Mustafa Çelik', email: 'mustafa@example.com', password: 'password123', balance: 10000 },
];

async function seed() {
  try {
    logger.info('Veritabanı seed işlemi başlatılıyor...');

    // Önce veritabanını temizle (seed işlemi için)
    await prisma.transaction.deleteMany({});
    await prisma.favorite.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.moneyRequest.deleteMany({});
    await prisma.qrCodeToken.deleteMany({});
    await prisma.idempotencyKey.deleteMany({});
    await prisma.user.deleteMany({});
    
    // Kullanıcıları oluştur
    for (const userData of users) {
      // Şifreyi hashle
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      const user = await prisma.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          balance: userData.balance,
        },
      });
      logger.info(`Kullanıcı oluşturuldu: ${user.name}, Bakiye: ${user.balance}`);
    }

    // Bazı örnek transferler oluştur
    const firstUser = await prisma.user.findFirst({ where: { name: users[0].name } });
    const secondUser = await prisma.user.findFirst({ where: { name: users[1].name } });

    if (firstUser && secondUser) {
      // İlk transfer
      await prisma.transaction.create({
        data: {
          senderId: firstUser.id,
          receiverId: secondUser.id,
          amount: 500,
          description: 'Örnek transfer',
          status: 'completed',
          completedAt: new Date(),
        }
      });

      // Kullanıcı bakiyelerini güncelle
      await prisma.user.update({
        where: { id: firstUser.id },
        data: { balance: firstUser.balance - 500 }
      });

      await prisma.user.update({
        where: { id: secondUser.id },
        data: { balance: secondUser.balance + 500 }
      });

      logger.info(`${firstUser.name}'den ${secondUser.name}'e 500 TL transfer edildi.`);

      // Zamanlı transfer örneği
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      await prisma.transaction.create({
        data: {
          senderId: secondUser.id,
          receiverId: firstUser.id,
          amount: 200,
          description: 'Örnek zamanlı transfer',
          status: 'pending',
          scheduledAt: tomorrow,
        }
      });

      logger.info(`${secondUser.name}'den ${firstUser.name}'e yarın gerçekleşecek 200 TL transfer oluşturuldu.`);
    }

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