'use client'

import Link from 'next/link'
import { 
  ArrowRight, 
  Search, 
  ShoppingBag, 
  Shield, 
  CheckCircle, 
  Star, 
  Zap, 
  Globe, 
  Smartphone,
  TrendingUp,
  Users,
  Award,
  Clock,
  Heart,
  Filter,
  CreditCard,
  Truck,
  Sparkles
} from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-blue-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-blue-100 border border-blue-200 rounded-full px-4 py-2 mb-8">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-800">🚀 Yeni Nesil E-Ticaret Deneyimi</span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              İhtiyacınızı Paylaşın,
              <span className="block text-blue-600 mt-2">Teklifleri Alın</span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Geleneksel alışverişi tersine çeviren platform. Siz ihtiyacınızı belirtin, satıcılar size teklif getirsin.
            </p>
            
            {/* Arama Çubuğu */}
            <div className="max-w-2xl mx-auto mb-10">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ne arıyorsunuz? (örn: iPhone 15, laptop, mobilya...)"
                  className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 shadow-sm"
                />
                <button className="absolute right-2 top-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200">
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/alim-ilan-sayfasi" 
                className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <ShoppingBag className="w-5 h-5" />
                İhtiyaç İlanı Ver
              </Link>
              
              <Link 
                href="/products" 
                className="bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold border-2 border-gray-200 hover:border-blue-300 hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Search className="w-5 h-5" />
                Teklifleri İncele
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Aktif İlan', value: '2.5K+', icon: '📊', color: 'blue' },
                { label: 'Günlük Teklif', value: '850+', icon: '💰', color: 'green' },
                { label: 'Mutlu Müşteri', value: '15K+', icon: '😊', color: 'purple' },
                { label: 'Başarılı Satış', value: '8.2K+', icon: '🎯', color: 'orange' }
              ].map((stat, index) => (
                <div key={stat.label} className="text-center group">
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2">
                    <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">{stat.icon}</div>
                    <div className={`text-3xl md:text-4xl font-bold mb-2 text-${stat.color}-600`}>{stat.value}</div>
                    <div className="text-gray-600 text-sm font-medium">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Popüler Kategoriler
              </h2>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                En çok tercih edilen kategorilerde binlerce ürün sizi bekliyor
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {[
                { name: 'Elektronik', icon: '📱', count: '2.5K+', gradient: 'from-blue-400 to-blue-600' },
                { name: 'Moda & Giyim', icon: '👕', count: '1.8K+', gradient: 'from-pink-400 to-pink-600' },
                { name: 'Ev & Yaşam', icon: '🏠', count: '1.2K+', gradient: 'from-green-400 to-green-600' },
                { name: 'Spor & Outdoor', icon: '⚽', count: '950+', gradient: 'from-orange-400 to-orange-600' },
                { name: 'Kitap & Hobi', icon: '📚', count: '750+', gradient: 'from-purple-400 to-purple-600' },
                { name: 'Otomotiv', icon: '🚗', count: '650+', gradient: 'from-red-400 to-red-600' }
              ].map((category, index) => (
                <Link
                  key={category.name}
                  href={`/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className="group bg-white rounded-2xl p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-transparent text-center transform hover:-translate-y-2"
                >
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${category.gradient} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300`}>
                    {category.icon}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 text-sm group-hover:text-blue-600 transition-colors duration-200">
                    {category.name}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">{category.count} ürün</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Latest Listings */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Son İlanlar
              </h2>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                En yeni eklenen ürün ilanlarını keşfedin
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  id: 1,
                  title: 'iPhone 15 Pro Max 256GB',
                  price: 45000,
                  originalPrice: 52000,
                  image: '/next.svg',
                  category: 'Elektronik',
                  location: 'İstanbul, Kadıköy',
                  timeAgo: '2 saat önce',
                  isNew: true,
                  discount: 13
                },
                {
                  id: 2,
                  title: 'MacBook Air M2 13"',
                  price: 28000,
                  image: '/vercel.svg',
                  category: 'Bilgisayar',
                  location: 'Ankara, Çankaya',
                  timeAgo: '4 saat önce',
                  isNew: true
                },
                {
                  id: 3,
                  title: 'Sony WH-1000XM5 Kulaklık',
                  price: 8500,
                  originalPrice: 10000,
                  image: '/file.svg',
                  category: 'Elektronik',
                  location: 'İzmir, Bornova',
                  timeAgo: '6 saat önce',
                  discount: 15
                },
                {
                  id: 4,
                  title: 'Samsung Galaxy S24 Ultra',
                  price: 42000,
                  image: '/globe.svg',
                  category: 'Elektronik',
                  location: 'Bursa, Nilüfer',
                  timeAgo: '8 saat önce',
                  isNew: true
                }
              ].map((product, index) => (
                <Link
                  key={product.id}
                  href={`/ilan/${product.id}`}
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 transform hover:-translate-y-2"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      {product.isNew && (
                        <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                          YENİ
                        </span>
                      )}
                      {product.discount && (
                        <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                          %{product.discount}
                        </span>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                        {product.category}
                      </span>
                      <span className="text-xs text-gray-500 font-medium">{product.timeAgo}</span>
                    </div>
                    
                    <h3 className="font-bold text-gray-900 mb-3 text-base line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                      {product.title}
                    </h3>
                    
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xl font-bold text-gray-900">
                        ₺{product.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          ₺{product.originalPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="mr-1">📍</span>
                      {product.location}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            <div className="text-center mt-16">
              <Link
                href="/products"
                className="inline-flex items-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Tüm İlanları Görüntüle
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Hemen Başlayın!
            </h2>
            <p className="text-lg md:text-xl mb-10 opacity-90 max-w-2xl mx-auto leading-relaxed">
              Ücretsiz hesap oluşturun ve binlerce ürün arasından alışverişe başlayın
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link 
                href="/auth/register" 
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Users className="w-5 h-5" />
                Ücretsiz Kayıt Ol
              </Link>
              
              <Link 
                href="/products" 
                className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-blue-600 transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Search className="w-5 h-5" />
                Ürünleri Keşfet
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
