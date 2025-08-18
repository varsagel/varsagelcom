# Varsagel.com Kurulum Rehberi

Bu rehber, projeyi GitHub, Supabase ve Vercel ile kurmanız için gerekli tüm adımları içerir.

## 🚀 Hızlı Başlangıç

### 1. GitHub Repository Kurulumu

✅ **Tamamlandı!** Repository zaten oluşturuldu ve bağlandı.

```bash
# Repository klonlama (yeni geliştirici için)
git clone https://github.com/varsagel/varsagelcom.git
cd varsagelcom

# Bağımlılıkları yükleme
bun install
```

### 2. Supabase Kurulumu

#### 2.1 Supabase Projesi Oluşturma

1. [Supabase Dashboard](https://supabase.com/dashboard)'a gidin
2. "New Project" butonuna tıklayın
3. Proje bilgilerini doldurun:
   - **Name**: `varsagelcom`
   - **Database Password**: Güçlü bir şifre oluşturun (kaydedin!)
   - **Region**: Europe (Frankfurt) - en yakın bölge
4. "Create new project" butonuna tıklayın
5. Proje oluşturulmasını bekleyin (2-3 dakika)

#### 2.2 Environment Değişkenlerini Ayarlama

1. Supabase Dashboard'da projenize gidin
2. **Settings** > **API** sayfasına gidin
3. Aşağıdaki bilgileri kopyalayın:
   - **Project URL**
   - **Project API Keys** > **anon public**
   - **Project API Keys** > **service_role** (gizli tutun!)

4. `.env` dosyasını güncelleyin:

```env
# Database - Supabase PostgreSQL
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[YOUR-SERVICE-ROLE-KEY]"

# JWT Secret
JWT_SECRET="your-super-secure-jwt-secret-key-here-change-this-in-production"
```

#### 2.3 Veritabanı Migrasyonu

```bash
# Prisma client oluşturma
bun prisma generate

# Veritabanı migrasyonu
bun prisma db push

# Test verisi oluşturma (opsiyonel)
bun run db:seed
```

### 3. Vercel Deployment

#### 3.1 Vercel Projesi Oluşturma

1. [Vercel Dashboard](https://vercel.com/dashboard)'a gidin
2. "New Project" butonuna tıklayın
3. GitHub repository'nizi seçin: `varsagelcom`
4. Proje ayarlarını yapılandırın:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `bun run build`
   - **Output Directory**: `.next`
   - **Install Command**: `bun install`

#### 3.2 Environment Variables Ayarlama

1. Vercel Dashboard'da projenize gidin
2. **Settings** > **Environment Variables** sayfasına gidin
3. Aşağıdaki değişkenleri ekleyin:

```
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[ANON-KEY]
SUPABASE_SERVICE_ROLE_KEY=[SERVICE-ROLE-KEY]
JWT_SECRET=your-production-jwt-secret
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

#### 3.3 Deployment

```bash
# Vercel CLI kurulumu (global)
npm i -g vercel

# Vercel'e login
vercel login

# İlk deployment
vercel --prod
```

### 4. Domain Ayarlama (Opsiyonel)

1. Vercel Dashboard'da **Settings** > **Domains** sayfasına gidin
2. Custom domain ekleyin
3. DNS ayarlarını yapılandırın

## 🔧 Geliştirme Komutları

```bash
# Geliştirme sunucusu
bun run dev

# Production build
bun run build

# Production sunucusu
bun run start

# Veritabanı işlemleri
bun prisma studio          # Veritabanı yönetimi
bun prisma db push         # Schema değişikliklerini uygula
bun prisma generate        # Client yeniden oluştur

# Test verisi
bun run db:seed            # Test verisi oluştur
```

## 📝 Önemli Notlar

- **Güvenlik**: Production'da güçlü JWT secret kullanın
- **Backup**: Supabase otomatik backup yapar, ek backup planı yapın
- **Monitoring**: Vercel Analytics'i etkinleştirin
- **Performance**: Vercel Edge Functions kullanmayı düşünün

## 🆘 Sorun Giderme

### Veritabanı Bağlantı Sorunu
```bash
# Bağlantıyı test et
bun prisma db pull
```

### Build Hatası
```bash
# Cache temizle
bun run build --no-cache
```

### Environment Variables
```bash
# Değişkenleri kontrol et
echo $DATABASE_URL
```

## 📞 Destek

Sorun yaşarsanız:
1. Bu README'yi tekrar kontrol edin
2. GitHub Issues'da sorun bildirin
3. Vercel ve Supabase dokümantasyonlarını inceleyin

---

**Başarılı kurulum! 🎉**

Projeniz artık GitHub'da, Supabase'de ve Vercel'de çalışıyor.