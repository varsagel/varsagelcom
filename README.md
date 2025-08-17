# Varsagel - Alıcı-Talep Platformu

**Varsagel**, kullanıcıların satın almak istedikleri ürün veya hizmetleri ilan olarak ekleyip, diğer kullanıcıların bu ilanlara teklif verebildiği modern bir e-ticaret platformudur.

## 🚀 Özellikler

- **İlan Yönetimi**: Kullanıcılar ihtiyaçlarını ilan olarak paylaşabilir
- **Teklif Sistemi**: Satıcılar ilanlara teklif verebilir
- **Mesajlaşma**: Gerçek zamanlı mesajlaşma sistemi
- **Bildirimler**: Anlık bildirim sistemi
- **Kategori Filtreleme**: Gelişmiş arama ve filtreleme
- **Güvenli Ödeme**: Güvenli ödeme altyapısı
- **Admin Paneli**: Kapsamlı yönetim paneli
- **Responsive Tasarım**: Mobil uyumlu arayüz

## 🛠️ Teknolojiler

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Next.js API Routes, tRPC
- **Database**: Supabase (PostgreSQL), Prisma ORM
- **Authentication**: JWT
- **Styling**: Tailwind CSS, Radix UI
- **Deployment**: Vercel, Supabase, Docker

## 📦 Kurulum

### Gereksinimler
- Node.js 18+
- PostgreSQL
- npm veya bun

### Geliştirme Ortamı

1. **Repository'yi klonlayın**
   ```bash
   git clone https://github.com/yourusername/varsagel.git
   cd varsagel
   ```

2. **Bağımlılıkları yükleyin**
   ```bash
   npm install
   # veya
   bun install
   ```

3. **Environment dosyasını oluşturun**
   ```bash
   cp .env.example .env
   ```
   `.env` dosyasını düzenleyip gerekli değişkenleri ayarlayın.

4. **Veritabanını hazırlayın**
   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

5. **Geliştirme sunucusunu başlatın**
   ```bash
   npm run dev
   ```

   [http://localhost:3000](http://localhost:3000) adresini tarayıcınızda açın.

## 🚀 Production Deployment

Detaylı deployment rehberi için [DEPLOYMENT.md](./DEPLOYMENT.md) dosyasına bakın.

### Hızlı Deployment Seçenekleri

#### Vercel (Önerilen)
```bash
npm run deploy:vercel
```

#### Docker
```bash
npm run deploy:docker
```

## 📝 Kullanılabilir Script'ler

- `npm run dev` - Geliştirme sunucusunu başlatır
- `npm run build` - Production build'i oluşturur
- `npm run start` - Production sunucusunu başlatır
- `npm run lint` - ESLint kontrolü yapar
- `npm run db:migrate` - Veritabanı migration'larını çalıştırır
- `npm run db:studio` - Prisma Studio'yu açar
- `npm run health-check` - Uygulama sağlık kontrolü

## 🔧 Konfigürasyon

### Environment Variables

```env
# Database - Supabase
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[SERVICE-ROLE-KEY]"

# Application
JWT_SECRET="your-secret-key"
NEXT_PUBLIC_APP_URL="https://varsagel.vercel.app"
```

Tüm environment variables için `.env.example` dosyasına bakın.

## 📊 Monitoring

- **Health Check**: `/api/health`
- **Metrics**: Production ortamında monitoring araçları
- **Logs**: Application ve server logları

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

- **Website**: [https://varsagel.com](https://varsagel.com)
- **Email**: admin@varsagel.com
- **Support**: support@varsagel.com

---

**Varsagel** - Güvenli ve modern alışveriş deneyimi
