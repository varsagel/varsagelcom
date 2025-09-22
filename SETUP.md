# VarsaGel E-Commerce Platform - Kurulum Rehberi

Bu rehber, projeyi yeni bir bilgisayarda çalıştırmak için gerekli tüm adımları içerir.

## 🔧 Gereksinimler

### Sistem Gereksinimleri
- **Node.js**: v18.0.0 veya üzeri
- **npm**: v8.0.0 veya üzeri
- **Git**: En son sürüm
- **İşletim Sistemi**: Windows, macOS, Linux

### Kurulması Gerekenler

1. **Node.js ve npm**
   - [Node.js resmi sitesinden](https://nodejs.org/) indirin
   - LTS sürümünü tercih edin
   - Kurulum sonrası terminal/cmd'de kontrol edin:
   ```bash
   node --version
   npm --version
   ```

2. **Git**
   - [Git resmi sitesinden](https://git-scm.com/) indirin
   - Kurulum sonrası kontrol edin:
   ```bash
   git --version
   ```

## 📥 Proje Kurulumu

### 1. Repository'yi Klonlama
```bash
git clone https://github.com/varsagel/varsagelcom.git
cd varsagelcom
```

### 2. Bağımlılıkları Yükleme
```bash
npm install
```

### 3. Ortam Değişkenlerini Ayarlama
Proje kök dizininde `.env` dosyası oluşturun:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-this"

# Email Configuration (İsteğe bağlı - şifre sıfırlama için)
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_FROM="your-email@gmail.com"
```

**Önemli:** `NEXTAUTH_SECRET` değerini güvenli bir değerle değiştirin.

### 4. Veritabanını Kurma
```bash
# Prisma client'ı oluştur
npx prisma generate

# Veritabanını oluştur ve migrasyonları çalıştır
npx prisma migrate dev

# (İsteğe bağlı) Veritabanını görüntülemek için
npx prisma studio
```

### 5. Projeyi Başlatma
```bash
npm run dev
```

Proje `http://localhost:3000` adresinde çalışacaktır.

## 🗄️ Veritabanı Bilgileri

- **Veritabanı Türü**: SQLite
- **Dosya Konumu**: `prisma/dev.db`
- **ORM**: Prisma

### Test Verisi Ekleme (İsteğe bağlı)
```bash
node create-test-user.js
```

## 🚀 Üretim Ortamı için

### Build Alma
```bash
npm run build
```

### Üretim Modunda Çalıştırma
```bash
npm start
```

## 📁 Proje Yapısı

```
varsagelcom/
├── src/
│   ├── app/                 # Next.js App Router
│   ├── components/          # React bileşenleri
│   ├── lib/                 # Yardımcı kütüphaneler
│   └── data/                # Statik veriler
├── prisma/                  # Veritabanı şeması ve migrasyonlar
├── public/                  # Statik dosyalar
└── docs/                    # Dokümantasyon
```

## 🔧 Geliştirme Araçları

### Faydalı Komutlar
```bash
# Veritabanını sıfırla
npx prisma migrate reset

# Prisma Studio'yu aç
npx prisma studio

# TypeScript kontrolü
npm run type-check

# Linting
npm run lint

# Formatting
npm run format
```

## 🐛 Sorun Giderme

### Yaygın Sorunlar

1. **Port 3000 kullanımda**
   ```bash
   # Farklı port kullan
   npm run dev -- -p 3001
   ```

2. **Veritabanı bağlantı sorunu**
   ```bash
   # Veritabanını yeniden oluştur
   npx prisma migrate reset
   npx prisma migrate dev
   ```

3. **Node modules sorunu**
   ```bash
   # Node modules'ı temizle ve yeniden yükle
   rm -rf node_modules package-lock.json
   npm install
   ```

## 📞 Destek

Sorun yaşarsanız:
1. GitHub Issues'da sorun bildirin
2. Dokümantasyonu kontrol edin
3. Log dosyalarını inceleyin

## 🔐 Güvenlik Notları

- `.env` dosyasını asla Git'e commit etmeyin
- Üretim ortamında güçlü şifreler kullanın
- NEXTAUTH_SECRET değerini mutlaka değiştirin
- Email konfigürasyonunda app password kullanın