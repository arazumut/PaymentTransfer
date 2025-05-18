# Para Transfer Servisi

Bu proje, kullanıcılar arasında para transferi yapmaya olanak sağlayan tam kapsamlı bir API ve web arayüzü servisidir. Node.js, Express, TypeScript, SQLite, Prisma ve React kullanılarak geliştirilmiştir.

## Özellikler

- Kullanıcılar arasında anlık para transferi
- Zamanlı transferler oluşturma
- İşlem geçmişi görüntüleme 
- Idempotent API desteği
- Transaction desteği ile atomik işlemler
- Modern ve kullanıcı dostu arayüz

## Teknoloji Stack

### Backend
- Node.js + TypeScript
- Express.js
- SQLite (Prisma ORM)
- Winston (Loglama)

### Frontend
- React + TypeScript
- React Router
- Mantine UI
- Axios

## Gereksinimler

- Node.js (v14 veya üzeri)
- npm veya yarn

## Kurulum

1. Projeyi klonlayın:
```bash
git clone <repo-url>
cd para-transfer-api
```

2. Backend bağımlılıkları yükleyin ve veritabanını oluşturun:
```bash
npm install
npx prisma migrate dev --name init
npm run seed
```

3. Frontend bağımlılıkları yükleyin:
```bash
cd client
npm install
```

## Çalıştırma

### Backend 
Geliştirme modunda başlatmak için:
```bash
# Ana klasörde
npm run dev
```

### Frontend
Geliştirme modunda başlatmak için:
```bash
# client klasöründe
npm run dev
```

Backend varsayılan olarak 3000 portunda, frontend ise 5173 portunda çalışır.

## API Endpointleri

### Kullanıcılar

#### Tüm kullanıcıları getir
```
GET /api/users
```

#### Kullanıcı detayı getir
```
GET /api/users/:id
```

#### Yeni kullanıcı oluştur
```
POST /api/users
```
```json
{
  "name": "Kullanıcı Adı",
  "balance": 1000
}
```

### Transferler

#### Para transferi yap
```
POST /api/transfer
```
```json
{
  "senderId": 1,
  "receiverId": 2,
  "amount": 500,
  "description": "Ödeme açıklaması",
  "scheduledAt": "2023-12-31T10:00:00Z" // Opsiyonel
}
```

Idempotency için:
```
POST /api/transfer
Idempotency-Key: unique-operation-id
```

#### İşlem geçmişi getir
```
GET /api/transactions?user_id=1
```

## Transfer Kuralları

- Gönderenin bakiyesi, transfer tutarı için yeterli olmalıdır
- Transfer tutarı 0'dan büyük olmalıdır
- Kullanıcı kendisine transfer yapamaz
- Zamanlı transferler, planlanan zamanda otomatik olarak gerçekleştirilir

## Ekran Görüntüleri

*[Ekran görüntüleri buraya eklenebilir]*

## Test

Backend testlerini çalıştırmak için:
```bash
# Ana klasörde
npm test
```

## Katkıda Bulunma

1. Bu repo'yu fork edin
2. Feature branch'i oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Add some amazing feature'`)
4. Branch'e push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## Lisans

Bu proje [MIT](LICENSE) lisansı altında lisanslanmıştır. 