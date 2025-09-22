# VarsaGel.com E-Ticaret Sitesi Dokümantasyonu

## Proje Genel Bakış

VarsaGel.com, Next.js 15.5.3 ve React 19.1.0 tabanlı modern bir e-ticaret platformudur. Kullanıcıların ürün listeleyebileceği, satın alabileceği ve yönetebileceği kapsamlı bir marketplace çözümüdür.

## Teknoloji Yığını

### Frontend
- **Next.js 15.5.3** - App Router ile
- **React 19.1.0** - Modern hooks ve bileşenler
- **TypeScript** - Tip güvenliği
- **Tailwind CSS** - Styling framework
- **Radix UI** - Accessible UI bileşenleri
- **Framer Motion** - Animasyonlar
- **Lucide React** - İkon kütüphanesi

### Backend & Database
- **Prisma ORM** - Veritabanı yönetimi
- **SQLite** - Development veritabanı
- **bcryptjs** - Şifre hashleme
- **jsonwebtoken** - JWT authentication
- **Zod** - Schema validation

### Form & State Management
- **React Hook Form** - Form yönetimi
- **@hookform/resolvers** - Zod entegrasyonu
- **Sonner** - Toast notifications

## Veritabanı Şeması

### User Modeli
```prisma
model User {
  id                     String   @id @default(cuid())
  email                  String   @unique
  firstName              String
  lastName               String
  password               String
  phone                  String?
  avatar                 String?
  role                   String   @default("USER") // USER, ADMIN
  isActive               Boolean  @default(true)
  passwordResetToken     String?
  passwordResetExpiresAt DateTime?
  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt
  
  // Relations
  listings               Listing[]
  buyerListings          BuyerListing[]
  sellerOffers           Offer[]  @relation("SellerOffers")
  buyerOffers            Offer[]  @relation("BuyerOffers")
  sentMessages           Message[] @relation("SentMessages")
  receivedMessages       Message[] @relation("ReceivedMessages")
  askedQuestions         Question[] @relation("AskedQuestions")
  favorites              Favorite[]
  notifications          Notification[]
}
```

### Listing Modeli
```prisma
model Listing {
  id                    String   @id @default(cuid())
  title                 String
  description           String
  price                 Float
  location              String
  categoryId            String
  subCategoryId         String
  categorySpecificData  String   // JSON string for category-specific fields
  images                String   // JSON array of image URLs
  status                String   @default("active") // active, sold, inactive
  views                 Int      @default(0)
  userId                String
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  // Relations
  user                  User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

## Sayfa Yapısı

### Ana Sayfalar
- `/` - Ana sayfa (ürün listesi)
- `/auth` - Giriş/Kayıt sayfaları
- `/profile` - Kullanıcı profili
- `/create-listing` - Yeni ürün ekleme
- `/categories` - Kategori sayfaları
- `/messages` - Mesajlaşma sistemi
- `/notifications` - Bildirimler
- `/admin` - Admin paneli (kullanıcı ve ilan yönetimi)

### API Endpoints
- `/api/auth/*` - Kimlik doğrulama API'leri
- `/api/listings/*` - Ürün yönetimi API'leri
- `/api/users/*` - Kullanıcı yönetimi API'leri
- `/api/messages/*` - Mesajlaşma API'leri
- `/api/notifications/*` - Bildirim API'leri
- `/api/offers/*` - Teklif sistemi API'leri
- `/api/admin/*` - Admin paneli API'leri

## Bileşen Yapısı

### Ana Bileşenler
- `Header.tsx` - Site başlığı ve navigasyon
- `AuthContext.tsx` - Kimlik doğrulama context'i
- `ui/` klasörü - Yeniden kullanılabilir UI bileşenleri

### Hooks
- `useAuth.ts` - Kimlik doğrulama hook'u
- `use-toast.ts` - Toast notification hook'u

## İş Mantığı

### Kullanıcı Kimlik Doğrulama
1. Kullanıcı kayıt/giriş
2. JWT token oluşturma
3. Password reset işlemleri
4. Session yönetimi

### Ürün Listeleme
1. Ürün oluşturma (başlık, açıklama, fiyat, kategori)
2. Resim yükleme ve yönetimi
3. Kategori-spesifik alanlar (JSON formatında)
4. Ürün durumu yönetimi (aktif, satıldı, pasif)

### Kategori Sistemi
- Ana kategoriler ve alt kategoriler
- Kategori-spesifik form alanları
- Dinamik form oluşturma

### Mesajlaşma Sistemi
- Kullanıcılar arası gerçek zamanlı mesajlaşma
- Konuşma listesi ve mesaj geçmişi
- Mesaj durumu takibi (okundu/okunmadı)

### Bildirim Sistemi
- Sistem bildirimleri (yeni teklifler, mesajlar)
- Bildirim durumu yönetimi
- Gerçek zamanlı bildirim güncellemeleri

### Teklif Sistemi
- İlanlar için teklif verme
- Teklif kabul/red işlemleri
- Teklif geçmişi ve durumu

### Admin Paneli
- Kullanıcı yönetimi (aktif/pasif durumu)
- İlan yönetimi ve moderasyon
- Sistem aktivite takibi
- İstatistikler ve raporlama

## Güvenlik

### Authentication
- JWT tabanlı kimlik doğrulama
- bcryptjs ile şifre hashleme
- Password reset token sistemi

### Validation
- Zod schema validation
- Form validation (React Hook Form)
- API endpoint validation

## Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Veritabanı Migration
```bash
npx prisma migrate dev
npx prisma generate
```

## Önemli Dosyalar

- `next.config.ts` - Next.js konfigürasyonu
- `tailwind.config.ts` - Tailwind CSS konfigürasyonu
- `prisma/schema.prisma` - Veritabanı şeması
- `src/lib/auth.ts` - Authentication utilities
- `src/lib/prisma.ts` - Prisma client
- `src/data/categories.ts` - Kategori verileri
- `src/data/car-brands.ts` - Araç markaları verisi

## API Kullanım Örnekleri

### Yeni Ürün Oluşturma
```typescript
const createListing = async (data: ListingData) => {
  const response = await fetch('/api/listings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  return response.json();
};
```

### Kullanıcı Kimlik Doğrulama
```typescript
const login = async (email: string, password: string) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return response.json();
};
```

Bu dokümantasyon, VarsaGel.com e-ticaret sitesinin teknik yapısını ve kullanım şekillerini kapsamlı bir şekilde açıklamaktadır.