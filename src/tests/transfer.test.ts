import request from 'supertest';
import app from '../index';
import prisma from '../utils/db';

// Her testten önce/sonra çalışacak fonksiyonlar
beforeAll(async () => {
  // Test veritabanı hazırlığı
  await prisma.idempotencyKey.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.user.deleteMany();

  // Test kullanıcıları oluştur
  await prisma.user.createMany({
    data: [
      { name: 'Test Gönderici', balance: 1000 },
      { name: 'Test Alıcı', balance: 500 },
      { name: 'Boş Bakiye', balance: 0 },
    ]
  });
});

afterAll(async () => {
  // Test sonrası temizlik
  await prisma.idempotencyKey.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

describe('Transfer İşlemleri', () => {
  let sender: any;
  let receiver: any;
  let emptyUser: any;

  beforeEach(async () => {
    // Her testten önce kullanıcıları veritabanından al
    sender = await prisma.user.findFirst({ where: { name: 'Test Gönderici' } });
    receiver = await prisma.user.findFirst({ where: { name: 'Test Alıcı' } });
    emptyUser = await prisma.user.findFirst({ where: { name: 'Boş Bakiye' } });
  });

  // Test 1: Başarılı para transferi
  test('Başarılı para transferi yapabilmeli', async () => {
    const response = await request(app)
      .post('/api/transfer')
      .send({
        senderId: sender?.id,
        receiverId: receiver?.id,
        amount: 100,
        description: 'Test transferi'
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    
    // Bakiyeleri kontrol et
    const updatedSender = await prisma.user.findUnique({ where: { id: sender?.id } });
    const updatedReceiver = await prisma.user.findUnique({ where: { id: receiver?.id } });
    
    expect(updatedSender?.balance).toBe(sender?.balance - 100);
    expect(updatedReceiver?.balance).toBe(receiver?.balance + 100);
  });

  // Test 2: Yetersiz bakiye durumu
  test('Yetersiz bakiye durumunda hata vermeli', async () => {
    const response = await request(app)
      .post('/api/transfer')
      .send({
        senderId: emptyUser?.id,
        receiverId: receiver?.id,
        amount: 100,
        description: 'Başarısız transfer'
      });

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Yetersiz bakiye');
  });
  
  // Test 3: Kendine transfer yapma durumu
  test('Kullanıcı kendine transfer yapamamalı', async () => {
    const response = await request(app)
      .post('/api/transfer')
      .send({
        senderId: sender?.id,
        receiverId: sender?.id,
        amount: 50,
        description: 'Kendine transfer'
      });

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('aynı kişi');
  });
  
  // Test 4: Zamanlı transfer
  test('Zamanlı transfer oluşturabilmeli', async () => {
    // Yarın için tarih
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const response = await request(app)
      .post('/api/transfer')
      .send({
        senderId: sender?.id,
        receiverId: receiver?.id,
        amount: 50,
        description: 'Zamanlı transfer',
        scheduledAt: tomorrow.toISOString()
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('pending');
    
    // Bakiyeler değişmemeli
    const updatedSender = await prisma.user.findUnique({ where: { id: sender?.id } });
    expect(updatedSender?.balance).toBe(sender?.balance);
  });
  
  // Test 5: İdempotent istek
  test('Aynı idempotency key ile ikinci istek aynı sonucu döndürmeli', async () => {
    const idempotencyKey = 'test-idempotency-key-' + Date.now();
    
    // İlk istek
    const firstResponse = await request(app)
      .post('/api/transfer')
      .set('Idempotency-Key', idempotencyKey)
      .send({
        senderId: sender?.id,
        receiverId: receiver?.id,
        amount: 75,
        description: 'İdempotent transfer'
      });
    
    expect(firstResponse.status).toBe(201);
    
    // Gönderici bakiyesini not al
    const senderAfterFirst = await prisma.user.findUnique({ where: { id: sender?.id } });
    
    // İkinci istek (aynı idempotency key)
    const secondResponse = await request(app)
      .post('/api/transfer')
      .set('Idempotency-Key', idempotencyKey)
      .send({
        senderId: sender?.id,
        receiverId: receiver?.id,
        amount: 75,
        description: 'İdempotent transfer'
      });
    
    expect(secondResponse.status).toBe(200);
    expect(secondResponse.body).toEqual(firstResponse.body);
    
    // İkinci istek sonrasında bakiye değişmemeli
    const senderAfterSecond = await prisma.user.findUnique({ where: { id: sender?.id } });
    expect(senderAfterSecond?.balance).toBe(senderAfterFirst?.balance);
  });
}); 