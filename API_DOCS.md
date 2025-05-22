# Para Transfer Sistemi - API Dökümantasyonu

## Genel Bilgiler

- Tüm API endpoint'leri `/api` prefix'i ile başlar.
- Standart başarılı yanıtlar: `{ success: true, data: { ... } }` şeklindedir.
- Hata yanıtları: `{ success: false, message: 'Hata mesajı' }` şeklindedir.
- Yetkilendirme gerektiren işlemler için JWT token kullanılır.
- Token, HTTP isteklerinde `Authorization: Bearer {token}` şeklinde header olarak gönderilmelidir.

## Kimlik Doğrulama API'leri

### Kayıt Olma

Yeni bir kullanıcı hesabı oluşturur.

- **URL**: `/api/auth/register`
- **Metot**: `POST`
- **Yetkilendirme**: Gerekmiyor
- **İstek Gövdesi**:
  ```json
  {
    "name": "Kullanıcı Adı",
    "email": "kullanici@example.com",
    "password": "sifre123",
    "initialBalance": 1000
  }
  ```
- **Başarılı Yanıt** (201):
  ```json
  {
    "success": true,
    "message": "Kullanıcı başarıyla oluşturuldu",
    "data": {
      "user": {
        "id": 1,
        "name": "Kullanıcı Adı",
        "email": "kullanici@example.com",
        "balance": 1000,
        "createdAt": "2025-05-22T12:00:00.000Z"
      },
      "token": "jwt-token-string"
    }
  }
  ```
- **Hata Yanıtları**:
  - `400`: Email zaten kullanımda / Validasyon hatası
  - `500`: Sunucu hatası

### Giriş Yapma

Var olan bir kullanıcı hesabıyla giriş yapar.

- **URL**: `/api/auth/login`
- **Metot**: `POST`
- **Yetkilendirme**: Gerekmiyor
- **İstek Gövdesi**:
  ```json
  {
    "email": "kullanici@example.com",
    "password": "sifre123"
  }
  ```
- **Başarılı Yanıt** (200):
  ```json
  {
    "success": true,
    "message": "Giriş başarılı",
    "data": {
      "user": {
        "id": 1,
        "name": "Kullanıcı Adı",
        "email": "kullanici@example.com",
        "balance": 1000,
        "createdAt": "2025-05-22T12:00:00.000Z"
      },
      "token": "jwt-token-string"
    }
  }
  ```
- **Hata Yanıtları**:
  - `401`: Geçersiz email veya şifre
  - `500`: Sunucu hatası

## Demo Hesapları

Test amaçlı oluşturulan hesaplar aşağıdaki gibidir:

1. **Demo Kullanıcı**:
   - Email: `demo@example.com`
   - Şifre: `demo123`
   - Bakiye: 2500 TL

2. **Ahmet Yılmaz**:
   - Email: `ahmet@example.com`
   - Şifre: `password123`
   - Bakiye: 4500 TL

3. **Ayşe Demir**:
   - Email: `ayse@example.com`
   - Şifre: `password123`
   - Bakiye: 3500 TL

## Güvenlik Hatırlatmaları

- Gerçek uygulamada JWT_SECRET değerini güvenli bir şekilde saklamayı unutmayın.
- Şifreler her zaman hash'lenerek veritabanına kaydedilir (bcrypt).
- Hassas API'ler için rate limiting uygulanmalıdır.
- HTTPS kullanımı production ortamında zorunludur.
