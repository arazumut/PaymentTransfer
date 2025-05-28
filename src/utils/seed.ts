import prisma from './db';
import bcrypt from 'bcrypt';
import { logger } from './logger';

// Şifre hashleme fonksiyonu
const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

async function seedDatabase() {
  try {
    logger.info('Veritabanı seed işlemi başlatılıyor...');

    // Örnek kategoriler
    const categories = [
      { name: 'Market', color: '#4CAF50' },
      { name: 'Faturalar', color: '#F44336' },
      { name: 'Eğlence', color: '#9C27B0' },
      { name: 'Yemek', color: '#FF9800' },
      { name: 'Ulaşım', color: '#2196F3' },
      { name: 'Sağlık', color: '#E91E63' },
      { name: 'Giyim', color: '#795548' },
      { name: 'Seyahat', color: '#009688' },
      { name: 'Kira', color: '#607D8B' }
    ];

    for (const category of categories) {
      // Kategoriyi id olmadan ara, sadece isim üzerinden
      const existingCategory = await prisma.spendingCategory.findFirst({
        where: { name: category.name }
      });

      if (existingCategory) {
        // Varsa güncelle
        await prisma.spendingCategory.update({
          where: { id: existingCategory.id },
          data: { color: category.color }
        });
      } else {
        // Yoksa oluştur
        await prisma.spendingCategory.create({
          data: category
        });
      }
    }
    logger.info(`${categories.length} kategori eklendi veya güncellendi`);

    // Örnek kullanıcılar
    const users = [
      { 
        name: 'Ali Yılmaz', 
        email: 'ali@example.com', 
        password: await hashPassword('Password123'), 
        balance: 10000
      },
      { 
        name: 'Ayşe Demir', 
        email: 'ayse@example.com', 
        password: await hashPassword('Password123'), 
        balance: 5000
      },
      { 
        name: 'Mehmet Kaya', 
        email: 'mehmet@example.com', 
        password: await hashPassword('Password123'), 
        balance: 7500
      }
    ];

    for (const user of users) {
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email }
      });

      if (!existingUser) {
        await prisma.user.create({ data: user });
      }
    }
    logger.info(`${users.length} kullanıcı eklendi`);

    // Örnek transferler
    const ali = await prisma.user.findUnique({ where: { email: 'ali@example.com' } });
    const ayse = await prisma.user.findUnique({ where: { email: 'ayse@example.com' } });
    const mehmet = await prisma.user.findUnique({ where: { email: 'mehmet@example.com' } });

    if (ali && ayse && mehmet) {
      const transactions = [
        {
          senderId: ali.id,
          receiverId: ayse.id,
          amount: 250,
          description: 'Yemek parası',
          status: 'completed',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000 * 10) // 10 gün önce
        },
        {
          senderId: ayse.id,
          receiverId: mehmet.id,
          amount: 500,
          description: 'Kira',
          status: 'completed',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000 * 7) // 7 gün önce
        },
        {
          senderId: mehmet.id,
          receiverId: ali.id,
          amount: 150,
          description: 'Sinema bileti',
          status: 'completed',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000 * 5) // 5 gün önce
        },
        {
          senderId: ali.id,
          receiverId: mehmet.id,
          amount: 300,
          description: 'Fatura ödemesi',
          status: 'completed',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000 * 3) // 3 gün önce
        },
        {
          senderId: ayse.id,
          receiverId: ali.id,
          amount: 1000,
          description: 'Borç ödemesi',
          status: 'completed',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000 * 2) // 2 gün önce
        }
      ];

      for (const transaction of transactions) {
        const existingTransaction = await prisma.transaction.findFirst({
          where: {
            senderId: transaction.senderId,
            receiverId: transaction.receiverId,
            amount: transaction.amount,
            description: transaction.description
          }
        });

        if (!existingTransaction) {
          await prisma.transaction.create({ data: transaction });
        }
      }
      logger.info(`${transactions.length} transfer eklendi`);

      // Kategorize et
      const marketCategory = await prisma.spendingCategory.findFirst({ where: { name: 'Market' } });
      const faturaCategory = await prisma.spendingCategory.findFirst({ where: { name: 'Faturalar' } });
      const eglenceCategory = await prisma.spendingCategory.findFirst({ where: { name: 'Eğlence' } });
      const yemekCategory = await prisma.spendingCategory.findFirst({ where: { name: 'Yemek' } });
      const kiraCategory = await prisma.spendingCategory.findFirst({ where: { name: 'Kira' } });

      if (marketCategory && faturaCategory && eglenceCategory && yemekCategory && kiraCategory) {
        // Transactionları bul
        const transactions = await prisma.transaction.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' }
        });

        if (transactions.length >= 5) {
          // Yemek parası işlemi
          await prisma.transactionCategory.create({
            data: {
              transactionId: transactions[4].id,
              categoryId: yemekCategory.id
            }
          });

          // Kira işlemi
          await prisma.transactionCategory.create({
            data: {
              transactionId: transactions[3].id,
              categoryId: kiraCategory.id
            }
          });

          // Sinema bileti işlemi
          await prisma.transactionCategory.create({
            data: {
              transactionId: transactions[2].id,
              categoryId: eglenceCategory.id
            }
          });

          // Fatura ödemesi işlemi
          await prisma.transactionCategory.create({
            data: {
              transactionId: transactions[1].id,
              categoryId: faturaCategory.id
            }
          });

          logger.info('İşlemlere kategoriler eklendi');
        }
      }

      // Favoriler ekle
      // Ali'nin favorileri: Ayşe ve Mehmet
      await prisma.favorite.upsert({
        where: {
          userId_favoriteId: {
            userId: ali.id,
            favoriteId: ayse.id
          }
        },
        update: {},
        create: {
          userId: ali.id,
          favoriteId: ayse.id
        }
      });

      await prisma.favorite.upsert({
        where: {
          userId_favoriteId: {
            userId: ali.id,
            favoriteId: mehmet.id
          }
        },
        update: {},
        create: {
          userId: ali.id,
          favoriteId: mehmet.id
        }
      });

      // Ayşe'nin favorisi: Ali
      await prisma.favorite.upsert({
        where: {
          userId_favoriteId: {
            userId: ayse.id,
            favoriteId: ali.id
          }
        },
        update: {},
        create: {
          userId: ayse.id,
          favoriteId: ali.id
        }
      });

      logger.info('Favoriler eklendi');

      // Örnek planlı ödemeler
      const scheduledPayments = [
        {
          senderId: ali.id,
          receiverId: ayse.id,
          amount: 200,
          description: 'Aylık ödeme',
          frequency: 'monthly',
          nextExecutionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 gün sonra
          isActive: true
        },
        {
          senderId: mehmet.id,
          receiverId: ali.id,
          amount: 100,
          description: 'Haftalık ödeme',
          frequency: 'weekly',
          nextExecutionDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 gün sonra
          isActive: true
        }
      ];

      for (const payment of scheduledPayments) {
        const existingPayment = await prisma.scheduledPayment.findFirst({
          where: {
            senderId: payment.senderId,
            receiverId: payment.receiverId,
            amount: payment.amount,
            description: payment.description
          }
        });

        if (!existingPayment) {
          await prisma.scheduledPayment.create({ data: payment });
        }
      }
      logger.info(`${scheduledPayments.length} planlı ödeme eklendi`);
      
      // Sadakat puanları oluştur
      await prisma.loyaltyPoints.upsert({
        where: { userId: ali.id },
        update: { points: 1500 },
        create: { userId: ali.id, points: 1500 }
      });
      
      await prisma.loyaltyPoints.upsert({
        where: { userId: ayse.id },
        update: { points: 750 },
        create: { userId: ayse.id, points: 750 }
      });
      
      await prisma.loyaltyPoints.upsert({
        where: { userId: mehmet.id },
        update: { points: 1200 },
        create: { userId: mehmet.id, points: 1200 }
      });
      
      logger.info('Sadakat puanları eklendi');
    }

    logger.info('Veritabanı seed işlemi tamamlandı');
  } catch (error) {
    logger.error('Seed işlemi sırasında hata oluştu:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Script doğrudan çalıştırıldığında
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default seedDatabase; 