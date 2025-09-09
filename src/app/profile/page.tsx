'use client';

import { useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Edit3, Save, X, Camera, Shield, Package, Heart, CreditCard, Bell, Settings, LogOut, Star, Eye, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  joinDate: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  stats: {
    totalOrders: number;
    totalSpent: number;
    favoriteItems: number;
    reviewsGiven: number;
  };
}

interface Order {
  id: string;
  date: string;
  status: 'delivered' | 'shipping' | 'processing' | 'cancelled';
  total: number;
  items: {
    id: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
  }[];
}

const mockUser: UserProfile = {
  id: '1',
  name: 'Ahmet Yılmaz',
  email: 'ahmet.yilmaz@email.com',
  phone: '+90 555 123 4567',
  avatar: '/api/placeholder/150/150',
  joinDate: '2023-01-15',
  address: {
    street: 'Atatürk Caddesi No: 123',
    city: 'İstanbul',
    postalCode: '34000',
    country: 'Türkiye'
  },
  stats: {
    totalOrders: 24,
    totalSpent: 12450,
    favoriteItems: 18,
    reviewsGiven: 15
  }
};

const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    date: '2024-01-15',
    status: 'delivered',
    total: 299,
    items: [
      {
        id: '1',
        name: 'Premium Bluetooth Kulaklık',
        image: '/api/placeholder/80/80',
        price: 299,
        quantity: 1
      }
    ]
  },
  {
    id: 'ORD-002',
    date: '2024-01-10',
    status: 'shipping',
    total: 1748,
    items: [
      {
        id: '2',
        name: 'Akıllı Saat Pro',
        image: '/api/placeholder/80/80',
        price: 1299,
        quantity: 1
      },
      {
        id: '3',
        name: 'Wireless Mouse Gaming',
        image: '/api/placeholder/80/80',
        price: 449,
        quantity: 1
      }
    ]
  }
];

const statusColors = {
  delivered: 'bg-green-100 text-green-800',
  shipping: 'bg-blue-100 text-blue-800',
  processing: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800'
};

const statusLabels = {
  delivered: 'Teslim Edildi',
  shipping: 'Kargoda',
  processing: 'Hazırlanıyor',
  cancelled: 'İptal Edildi'
};

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile>(mockUser);
  const [orders] = useState<Order[]>(mockOrders);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'favorites' | 'settings'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
    address: { ...user.address }
  });

  const handleSave = () => {
    setUser(prev => ({
      ...prev,
      name: editForm.name,
      email: editForm.email,
      phone: editForm.phone,
      address: editForm.address
    }));
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: { ...user.address }
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-primary text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/20">
                <Image
                  src={user.avatar}
                  alt={user.name}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              </div>
              <button className="absolute bottom-0 right-0 w-10 h-10 bg-white text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors">
                <Camera className="w-5 h-5" />
              </button>
            </div>
            
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
              <p className="text-white/80 mb-1">{user.email}</p>
              <p className="text-white/60 text-sm flex items-center gap-1 justify-center md:justify-start">
                <Calendar className="w-4 h-4" />
                Üye olma tarihi: {new Date(user.joinDate).toLocaleDateString('tr-TR')}
              </p>
            </div>
            
            <div className="ml-auto">
              <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors">
                <Settings className="w-4 h-4" />
                Ayarlar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="container mx-auto px-4 -mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{user.stats.totalOrders}</div>
            <div className="text-gray-600 text-sm">Toplam Sipariş</div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{user.stats.totalSpent.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}₺</div>
            <div className="text-gray-600 text-sm">Toplam Harcama</div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Heart className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{user.stats.favoriteItems}</div>
            <div className="text-gray-600 text-sm">Favori Ürün</div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{user.stats.reviewsGiven}</div>
            <div className="text-gray-600 text-sm">Verilen Yorum</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-80">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                    activeTab === 'profile' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <User className="w-5 h-5" />
                  Profil Bilgileri
                </button>
                
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                    activeTab === 'orders' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Package className="w-5 h-5" />
                  Siparişlerim
                </button>
                
                <button
                  onClick={() => setActiveTab('favorites')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                    activeTab === 'favorites' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Heart className="w-5 h-5" />
                  Favorilerim
                </button>
                
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                    activeTab === 'settings' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Settings className="w-5 h-5" />
                  Ayarlar
                </button>
                
                <hr className="my-4" />
                
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-red-600 hover:bg-red-50 transition-colors">
                  <LogOut className="w-5 h-5" />
                  Çıkış Yap
                </button>
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Profil Bilgileri</h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      Düzenle
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSave}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        Kaydet
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        İptal
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Kişisel Bilgiler</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ad Soyad</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <User className="w-5 h-5 text-gray-400" />
                          <span>{user.name}</span>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">E-posta</label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Mail className="w-5 h-5 text-gray-400" />
                          <span>{user.email}</span>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={editForm.phone}
                          onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Phone className="w-5 h-5 text-gray-400" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Adres Bilgileri</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Adres</label>
                      {isEditing ? (
                        <textarea
                          value={editForm.address.street}
                          onChange={(e) => setEditForm(prev => ({ 
                            ...prev, 
                            address: { ...prev.address, street: e.target.value }
                          }))}
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                          <span>{user.address.street}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Şehir</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.address.city}
                            onChange={(e) => setEditForm(prev => ({ 
                              ...prev, 
                              address: { ...prev.address, city: e.target.value }
                            }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        ) : (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <span>{user.address.city}</span>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Posta Kodu</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.address.postalCode}
                            onChange={(e) => setEditForm(prev => ({ 
                              ...prev, 
                              address: { ...prev.address, postalCode: e.target.value }
                            }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        ) : (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <span>{user.address.postalCode}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Siparişlerim</h2>
                  
                  {orders.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="w-12 h-12 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Henüz siparişiniz yok</h3>
                      <p className="text-gray-600 mb-4">İlk siparişinizi vermek için ürünleri keşfedin</p>
                      <Link
                        href="/products"
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <ShoppingBag className="w-5 h-5" />
                        Alışverişe Başla
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map(order => (
                        <div key={order.id} className="border border-gray-200 rounded-xl p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="font-semibold text-gray-900">Sipariş #{order.id}</h3>
                              <p className="text-gray-600 text-sm">{new Date(order.date).toLocaleDateString('tr-TR')}</p>
                            </div>
                            <div className="text-right">
                              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status]}`}>
                                {statusLabels[order.status]}
                              </span>
                              <p className="text-lg font-bold text-gray-900 mt-1">{order.total}₺</p>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            {order.items.map(item => (
                              <div key={item.id} className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-lg overflow-hidden">
                                  <Image
                                    src={item.image}
                                    alt={item.name}
                                    width={64}
                                    height={64}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900">{item.name}</h4>
                                  <p className="text-gray-600 text-sm">Adet: {item.quantity}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-gray-900">{item.price}₺</p>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                            <button className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              <Eye className="w-4 h-4" />
                              Detayları Gör
                            </button>
                            {order.status === 'delivered' && (
                              <button className="flex items-center gap-2 px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                                <Star className="w-4 h-4" />
                                Değerlendir
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'favorites' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Favorilerim</h2>
                
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Henüz favori ürününüz yok</h3>
                  <p className="text-gray-600 mb-4">Beğendiğiniz ürünleri favorilere ekleyerek daha sonra kolayca bulabilirsiniz</p>
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    Ürünleri Keşfet
                  </Link>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Ayarlar</h2>
                  
                  <div className="space-y-6">
                    {/* Notifications */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Bildirimler</h3>
                      <div className="space-y-3">
                        <label className="flex items-center justify-between cursor-pointer">
                          <div className="flex items-center gap-3">
                            <Bell className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900">E-posta bildirimleri</p>
                              <p className="text-gray-600 text-sm">Sipariş durumu ve kampanyalar hakkında bilgi alın</p>
                            </div>
                          </div>
                          <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        </label>
                        
                        <label className="flex items-center justify-between cursor-pointer">
                          <div className="flex items-center gap-3">
                            <Bell className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900">SMS bildirimleri</p>
                              <p className="text-gray-600 text-sm">Önemli güncellemeler için SMS alın</p>
                            </div>
                          </div>
                          <input type="checkbox" className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        </label>
                      </div>
                    </div>
                    
                    {/* Security */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Güvenlik</h3>
                      <div className="space-y-3">
                        <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <Shield className="w-5 h-5 text-gray-400" />
                            <div className="text-left">
                              <p className="font-medium text-gray-900">Şifre değiştir</p>
                              <p className="text-gray-600 text-sm">Hesap güvenliğiniz için düzenli olarak şifrenizi değiştirin</p>
                            </div>
                          </div>
                          <Edit3 className="w-5 h-5 text-gray-400" />
                        </button>
                        
                        <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <Shield className="w-5 h-5 text-gray-400" />
                            <div className="text-left">
                              <p className="font-medium text-gray-900">İki faktörlü doğrulama</p>
                              <p className="text-gray-600 text-sm">Hesabınız için ek güvenlik katmanı ekleyin</p>
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">Kapalı</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}