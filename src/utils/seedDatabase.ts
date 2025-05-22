import prisma from './db';
import { logger } from './logger';

const users = [
  { name: 'Ahmet Yılmaz', email: 'ahmet@example.com', balance: 5000 },
  { name: 'Ayşe Demir', email: 'ayse@example.com', balance: 3000 },
  { name: 'Mehmet Kaya', email: 'mehmet@example.com', balance: 8000 },
  { name: 'Fatma Şahin', email: 'fatma@example.com', balance: 2000 },
  { name: 'Mustafa Çelik', email: 'mustafa@example.com', balance: 10000 },
];

async function seed() {
  try {
    logger.info('Veritabanı seed işlemi başlatılıyor...');

    // Kullanıcıları oluştur
    for (const userData of users) {
      const user = await prisma.user.create({
        data: userData,
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