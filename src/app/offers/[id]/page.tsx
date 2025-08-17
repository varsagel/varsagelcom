'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Calendar, DollarSign, FileText, MapPin, Eye, Heart, Clock, Shield, Star, Package, Image, Play, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { formatRelativeTime } from '@/lib/utils';
import { formatCity, formatDistrict } from '@/utils/locationUtils';

interface Offer {
  id: string;
  price: number;
  duration: string;
  message: string;
  experience: string;
  portfolio: string;
  guaranteeOffered: boolean;
  revisionCount: number;
  additionalServices: any[];
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  categorySpecificData?: any;
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  };
  listing: {
    id: string;
    title: string;
    description: string;
    category: string;
    subcategory?: string;
    location: string;
    district?: string;
    budgetMin: number;
    budgetMax: number;
    price?: number;
    images: string;
    videoUrl?: string;
    expiresAt: string;
    status: string;
    createdAt: string;
    viewCount: number;
    likeCount: number;
    favoriteCount: number;
    categorySpecificData?: any;
    userId: string;
    user: {
      id: string;
      name: string;
      email: string;
      createdAt: string;
    };
  };
}

export default function OfferDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  useEffect(() => {
    const initializePage = async () => {
      await fetchCurrentUser();
      await fetchOffer();
    };
    initializePage();
  }, [params.id]);

  const fetchCurrentUser = async () => {
    setUserLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log('Token kontrolü:', token ? 'Token mevcut' : 'Token yok');
      
      if (!token) {
        console.log('Token yok, currentUserId null set ediliyor');
        setCurrentUserId(null);
        return;
      }
      
      const response = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Profile API response status:', response.status);
      
      if (response.ok) {
        const userData = await response.json();
        console.log('Kullanıcı verisi alındı:', userData);
        setCurrentUserId(userData.user.id);
        console.log('Kullanıcı ID set edildi:', userData.user.id);
      } else {
        console.log('Profile API başarısız, currentUserId null set ediliyor');
        setCurrentUserId(null);
      }
    } catch (error) {
      console.error('fetchCurrentUser hatası:', error);
      setCurrentUserId(null);
    } finally {
      setUserLoading(false);
      console.log('fetchCurrentUser tamamlandı, userLoading false set edildi');
    }
  };

  const fetchOffer = async () => {
    try {
      console.log('Teklif detayı getiriliyor - ID:', params.id);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast({
          title: 'Giriş Gerekli',
          description: 'Bu sayfayı görüntülemek için giriş yapmanız gerekiyor.',
          variant: 'destructive',
          duration: 5000,
        });
        router.push('/auth/login');
        return;
      }
      const response = await fetch(`/api/offers/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('API yanıtı:', response.status, response.statusText);
      
      if (response.ok) {
        const offerData = await response.json();
        console.log('Teklif verisi alındı:', offerData);
        setOffer(offerData);
      } else {
        const errorData = await response.json();
        console.error('API hatası:', response.status, errorData);
        
        if (response.status === 401) {
          toast({
            title: 'Oturum Süresi Doldu',
            description: 'Lütfen tekrar giriş yapın.',
            variant: 'destructive',
            duration: 5000,
          });
          localStorage.removeItem('token');
          router.push('/auth/login');
        } else {
          toast({
            title: 'Hata',
            description: errorData.error || 'Teklif bulunamadı',
            variant: 'destructive',
            duration: 5000,
          });
          router.push('/offers');
        }
      }
    } catch (error) {
      console.error('Teklif yüklenirken hata:', error);
      toast({
        title: 'Hata',
        description: 'Teklif yüklenirken bir hata oluştu',
        variant: 'destructive',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOfferAction = async (action: 'accept' | 'reject') => {
    if (!offer) {
      console.error('Teklif bulunamadı');
      return;
    }
    
    if (offer.status !== 'pending') {
      toast({
        title: 'Uyarı',
        description: 'Bu teklif zaten işleme alınmış',
        variant: 'destructive',
        duration: 5000,
      });
      return;
    }
    
    setActionLoading(true);
    console.log(`Teklif ${action} işlemi başlatılıyor:`, offer.id);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast({
          title: 'Giriş Gerekli',
          description: 'Bu işlem için giriş yapmanız gerekiyor',
          variant: 'destructive',
          duration: 5000,
        });
        router.push('/auth/login');
        return;
      }
      
      console.log(`API çağrısı yapılıyor: PUT /api/offers/${offer.id}`);
      
      const response = await fetch(`/api/offers/${offer.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });
      
      console.log('API yanıtı:', response.status, response.statusText);

      if (response.ok) {
        const result = await response.json();
        console.log('İşlem başarılı:', result);
        
        // API'den gelen mesajı kullan
        toast({
          title: '✅ Başarılı!',
          description: result.message || (action === 'accept' 
            ? '🎉 Teklif başarıyla kabul edildi!' 
            : '✅ Teklif başarıyla reddedildi'),
          variant: 'default',
          duration: 4000,
        });
        
        // Teklifi yeniden yükle
        await fetchOffer();
        
        // Kısa bir bekleme sonrası durum kontrolü
        setTimeout(() => {
          console.log('Teklif durumu güncellendi:', result.offer?.status);
        }, 500);
      } else {
        const errorData = await response.json();
        console.error('API hatası:', response.status, errorData);
        
        let errorMessage = 'İşlem başarısız';
        
        if (response.status === 401) {
          errorMessage = 'Oturum süresi doldu, lütfen tekrar giriş yapın';
          localStorage.removeItem('token');
          router.push('/auth/login');
        } else if (response.status === 404) {
          errorMessage = 'Teklif bulunamadı veya yetkiniz yok';
        } else if (response.status === 400) {
          errorMessage = errorData.error || 'Geçersiz işlem';
        } else {
          errorMessage = errorData.error || 'Sunucu hatası oluştu';
        }
        
        toast({
          title: 'Hata',
          description: errorMessage,
          variant: 'destructive',
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Teklif işlemi sırasında hata:', error);
      
      let errorMessage = 'İşlem sırasında bir hata oluştu';
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = 'Bağlantı hatası - lütfen internet bağlantınızı kontrol edin';
      } else if (error instanceof Error) {
        errorMessage = `Hata: ${error.message}`;
      }
      
      toast({
        title: 'Bağlantı Hatası',
        description: errorMessage,
        variant: 'destructive',
        duration: 5000,
      });
    } finally {
      setActionLoading(false);
      console.log('Teklif işlemi tamamlandı');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Beklemede</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Kabul Edildi</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Reddedildi</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const isServiceCategory = (category: string) => {
    const categoryLower = category.toLowerCase();
    return ['hizmet', 'temizlik', 'tamir', 'bakım', 'eğitim', 'danışmanlık', 'tasarım', 'yazılım', 'web', 'grafik'].includes(categoryLower);
  };

  const renderCategorySpecificData = (category: string, data: any) => {
    const categoryLower = category.toLowerCase();
    
    // Araç kategorileri
    const isVehicle = ['otomobil', 'araç', 'araba', 'vasita', 'otomotiv', 'motor', 'motorsiklet', 'bisiklet', 'kamyon', 'minibüs'].includes(categoryLower);
    // Emlak kategorileri
    const isRealEstate = ['emlak', 'ev', 'daire', 'villa', 'arsa', 'ofis', 'mağaza', 'depo', 'gayrimenkul'].includes(categoryLower);
    // Elektronik kategorileri
    const isElectronics = ['elektronik', 'bilgisayar', 'laptop', 'telefon', 'tablet', 'teknoloji', 'donanım', 'yazılım', 'oyun', 'ses', 'görüntü'].includes(categoryLower);
    // Hizmet kategorileri
    const isService = ['hizmet', 'temizlik', 'tamir', 'bakım', 'eğitim', 'danışmanlık', 'tasarım', 'yazılım', 'web', 'grafik'].includes(categoryLower);
    // Giyim kategorileri
    const isClothing = ['giyim', 'ayakkabı', 'çanta', 'aksesuar', 'moda', 'tekstil'].includes(categoryLower);
    // Yedek parça kategorileri
    const isSpareParts = ['yedek-parca', 'yedek parça', 'aksesuar', 'donanım', 'tuning', 'otomotiv ekipmanları', 'motosiklet ekipmanları'].includes(categoryLower);

    if (isVehicle) {
      return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🚗</span>
            <h4 className="text-lg font-semibold text-blue-800">Araç Bilgileri</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.brand && (
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <p className="text-xs font-medium text-blue-600 mb-1">Marka</p>
                <p className="font-semibold text-gray-800">{data.brand}</p>
              </div>
            )}
            {data.model && (
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <p className="text-xs font-medium text-blue-600 mb-1">Model</p>
                <p className="font-semibold text-gray-800">{data.model}</p>
              </div>
            )}
            {data.series && (
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <p className="text-xs font-medium text-blue-600 mb-1">Seri</p>
                <p className="font-semibold text-gray-800">{data.series}</p>
              </div>
            )}
            {data.modelYear && (
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <p className="text-xs font-medium text-blue-600 mb-1">Model Yılı</p>
                <p className="font-semibold text-gray-800">{data.modelYear}</p>
              </div>
            )}
            {data.mileage && (
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <p className="text-xs font-medium text-blue-600 mb-1">Kilometre</p>
                <p className="font-semibold text-gray-800">{Number(data.mileage).toLocaleString('tr-TR')} km</p>
              </div>
            )}
            {data.fuelType && (
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <p className="text-xs font-medium text-blue-600 mb-1">Yakıt Tipi</p>
                <p className="font-semibold text-gray-800 capitalize">{data.fuelType}</p>
              </div>
            )}
            {data.transmission && (
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <p className="text-xs font-medium text-blue-600 mb-1">Vites</p>
                <p className="font-semibold text-gray-800 capitalize">{data.transmission}</p>
              </div>
            )}
            {data.bodyType && (
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <p className="text-xs font-medium text-blue-600 mb-1">Kasa Tipi</p>
                <p className="font-semibold text-gray-800 capitalize">{data.bodyType}</p>
              </div>
            )}
            {data.color && (
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <p className="text-xs font-medium text-blue-600 mb-1">Renk</p>
                <p className="font-semibold text-gray-800 capitalize">{data.color}</p>
              </div>
            )}
            {data.vehicleCondition && (
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <p className="text-xs font-medium text-blue-600 mb-1">Araç Durumu</p>
                <p className="font-semibold text-gray-800">{data.vehicleCondition.replace('-', ' ')}</p>
              </div>
            )}
            {data.engineSize && (
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <p className="text-xs font-medium text-blue-600 mb-1">Motor Hacmi</p>
                <p className="font-semibold text-gray-800">{data.engineSize} cc</p>
              </div>
            )}
            {data.enginePower && (
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <p className="text-xs font-medium text-blue-600 mb-1">Motor Gücü</p>
                <p className="font-semibold text-gray-800">{data.enginePower} HP</p>
              </div>
            )}
          </div>
          {(data.paintedParts || data.replacedParts) && (
            <div className="mt-4 pt-4 border-t border-blue-200">
              <h5 className="text-sm font-medium text-blue-700 mb-2">🔧 Hasar Bilgileri</h5>
              <div className="grid grid-cols-2 gap-4">
                {data.paintedParts && (
                  <div className="bg-white rounded-lg p-3 border border-orange-100">
                    <p className="text-xs font-medium text-orange-600 mb-1">Boyalı Parça</p>
                    <p className="font-semibold text-gray-800">{data.paintedParts} adet</p>
                  </div>
                )}
                {data.replacedParts && (
                  <div className="bg-white rounded-lg p-3 border border-red-100">
                    <p className="text-xs font-medium text-red-600 mb-1">Değişen Parça</p>
                    <p className="font-semibold text-gray-800">{data.replacedParts} adet</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (isRealEstate) {
      return (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🏠</span>
            <h4 className="text-lg font-semibold text-green-800">Emlak Bilgileri</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.propertyType && (
              <div className="bg-white rounded-lg p-3 border border-green-100">
                <p className="text-xs font-medium text-green-600 mb-1">Emlak Tipi</p>
                <p className="font-semibold text-gray-800 capitalize">{data.propertyType}</p>
              </div>
            )}
            {data.area && (
              <div className="bg-white rounded-lg p-3 border border-green-100">
                <p className="text-xs font-medium text-green-600 mb-1">Alan</p>
                <p className="font-semibold text-gray-800">{data.area} m²</p>
              </div>
            )}
            {data.rooms && (
              <div className="bg-white rounded-lg p-3 border border-green-100">
                <p className="text-xs font-medium text-green-600 mb-1">Oda Sayısı</p>
                <p className="font-semibold text-gray-800">{data.rooms}</p>
              </div>
            )}
            {data.buildingAge && (
              <div className="bg-white rounded-lg p-3 border border-green-100">
                <p className="text-xs font-medium text-green-600 mb-1">Bina Yaşı</p>
                <p className="font-semibold text-gray-800">{data.buildingAge}</p>
              </div>
            )}
            {data.floor && (
              <div className="bg-white rounded-lg p-3 border border-green-100">
                <p className="text-xs font-medium text-green-600 mb-1">Bulunduğu Kat</p>
                <p className="font-semibold text-gray-800">{data.floor}</p>
              </div>
            )}
            {data.totalFloors && (
              <div className="bg-white rounded-lg p-3 border border-green-100">
                <p className="text-xs font-medium text-green-600 mb-1">Toplam Kat</p>
                <p className="font-semibold text-gray-800">{data.totalFloors}</p>
              </div>
            )}
            {data.heating && (
              <div className="bg-white rounded-lg p-3 border border-green-100">
                <p className="text-xs font-medium text-green-600 mb-1">Isıtma</p>
                <p className="font-semibold text-gray-800">{data.heating}</p>
              </div>
            )}
            {data.furnished && (
              <div className="bg-white rounded-lg p-3 border border-green-100">
                <p className="text-xs font-medium text-green-600 mb-1">Eşyalı</p>
                <p className="font-semibold text-gray-800">{data.furnished === 'true' || data.furnished === true ? 'Evet' : 'Hayır'}</p>
              </div>
            )}
            {data.balcony && (
              <div className="bg-white rounded-lg p-3 border border-green-100">
                <p className="text-xs font-medium text-green-600 mb-1">Balkon</p>
                <p className="font-semibold text-gray-800">{data.balcony === 'true' || data.balcony === true ? 'Var' : 'Yok'}</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (isElectronics) {
      return (
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">💻</span>
            <h4 className="text-lg font-semibold text-purple-800">Elektronik Bilgileri</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.brand && (
              <div className="bg-white rounded-lg p-3 border border-purple-100">
                <p className="text-xs font-medium text-purple-600 mb-1">Marka</p>
                <p className="font-semibold text-gray-800">{data.brand}</p>
              </div>
            )}
            {data.model && (
              <div className="bg-white rounded-lg p-3 border border-purple-100">
                <p className="text-xs font-medium text-purple-600 mb-1">Model</p>
                <p className="font-semibold text-gray-800">{data.model}</p>
              </div>
            )}
            {data.condition && (
              <div className="bg-white rounded-lg p-3 border border-purple-100">
                <p className="text-xs font-medium text-purple-600 mb-1">Durum</p>
                <p className="font-semibold text-gray-800">{data.condition}</p>
              </div>
            )}
            {data.warranty && (
              <div className="bg-white rounded-lg p-3 border border-purple-100">
                <p className="text-xs font-medium text-purple-600 mb-1">Garanti</p>
                <p className="font-semibold text-gray-800">{data.warranty === 'true' || data.warranty === true ? 'Var' : 'Yok'}</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (isService) {
      return (
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🛠️</span>
            <h4 className="text-lg font-semibold text-orange-800">Hizmet Bilgileri</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.serviceType && (
              <div className="bg-white rounded-lg p-3 border border-orange-100">
                <p className="text-xs font-medium text-orange-600 mb-1">Hizmet Tipi</p>
                <p className="font-semibold text-gray-800">{data.serviceType}</p>
              </div>
            )}
            {data.experience && (
              <div className="bg-white rounded-lg p-3 border border-orange-100">
                <p className="text-xs font-medium text-orange-600 mb-1">Deneyim</p>
                <p className="font-semibold text-gray-800">{data.experience}</p>
              </div>
            )}
            {data.urgency && (
              <div className="bg-white rounded-lg p-3 border border-orange-100">
                <p className="text-xs font-medium text-orange-600 mb-1">Aciliyet</p>
                <p className="font-semibold text-gray-800">{data.urgency}</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (isSpareParts) {
      return (
        <div className="bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🔧</span>
            <h4 className="text-lg font-semibold text-gray-800">Yedek Parça Bilgileri</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.spareBrand && (
              <div className="bg-white rounded-lg p-3 border border-gray-100">
                <p className="text-xs font-medium text-gray-600 mb-1">Uyumlu Marka</p>
                <p className="font-semibold text-gray-800">{data.spareBrand}</p>
              </div>
            )}
            {data.spareModel && (
              <div className="bg-white rounded-lg p-3 border border-gray-100">
                <p className="text-xs font-medium text-gray-600 mb-1">Uyumlu Model</p>
                <p className="font-semibold text-gray-800">{data.spareModel}</p>
              </div>
            )}
            {data.spareSeries && (
              <div className="bg-white rounded-lg p-3 border border-gray-100">
                <p className="text-xs font-medium text-gray-600 mb-1">Uyumlu Seri</p>
                <p className="font-semibold text-gray-800">{data.spareSeries}</p>
              </div>
            )}
            {data.condition && (
              <div className="bg-white rounded-lg p-3 border border-gray-100">
                <p className="text-xs font-medium text-gray-600 mb-1">Durum</p>
                <p className="font-semibold text-gray-800">{data.condition}</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Diğer kategoriler için genel gösterim
    return (
      <div className="bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">📋</span>
          <h4 className="text-lg font-semibold text-gray-800">Ek Bilgiler</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(data).map(([key, value]) => {
            if (value && value !== '' && value !== null && value !== undefined) {
              return (
                <div key={key} className="bg-white rounded-lg p-3 border border-gray-100">
                  <p className="text-xs font-medium text-gray-600 mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                  <p className="font-semibold text-gray-800">
                    {typeof value === 'boolean' ? (value ? 'Evet' : 'Hayır') : String(value)}
                  </p>
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>
    );
  };

  // İlan kategoriye özel bilgileri render eden fonksiyon
  const renderListingCategorySpecificData = (category: string, data: any) => {
    if (!data || typeof data !== 'object') {
      return (
        <div className="text-sm text-muted-foreground italic">
          Kategoriye özel ilan bilgisi bulunamadı.
        </div>
      );
    }

    // JSON string ise parse et
    let parsedData = data;
    if (typeof data === 'string') {
      try {
        parsedData = JSON.parse(data);
      } catch (e) {
        return (
          <div className="text-sm text-muted-foreground italic">
            Kategoriye özel ilan bilgisi okunamadı.
          </div>
        );
      }
    }

    const categoryLower = category.toLowerCase();
    
    // Araç kategorileri için özel gösterim
    const isVehicle = ['otomobil', 'araç', 'araba', 'vasita', 'otomotiv', 'motor', 'motorsiklet', 'bisiklet', 'kamyon', 'minibüs'].includes(categoryLower);
    
    if (isVehicle) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {parsedData.vehicleYearMin && (
            <div className="bg-white rounded-lg p-3 border border-purple-100">
              <p className="text-xs font-medium text-purple-600 mb-1">Minimum Araç Yılı</p>
              <p className="font-semibold text-gray-800">{parsedData.vehicleYearMin}</p>
            </div>
          )}
          
          {parsedData.vehicleYearMax && (
            <div className="bg-white rounded-lg p-3 border border-purple-100">
              <p className="text-xs font-medium text-purple-600 mb-1">Maksimum Araç Yılı</p>
              <p className="font-semibold text-gray-800">{parsedData.vehicleYearMax}</p>
            </div>
          )}
          
          {parsedData.mileageMin && (
            <div className="bg-white rounded-lg p-3 border border-purple-100">
              <p className="text-xs font-medium text-purple-600 mb-1">Minimum Kilometre</p>
              <p className="font-semibold text-gray-800">{parsedData.mileageMin.toLocaleString()} km</p>
            </div>
          )}
          
          {parsedData.mileageMax && (
            <div className="bg-white rounded-lg p-3 border border-purple-100">
              <p className="text-xs font-medium text-purple-600 mb-1">Maksimum Kilometre</p>
              <p className="font-semibold text-gray-800">{parsedData.mileageMax.toLocaleString()} km</p>
            </div>
          )}
          
          {parsedData.preferredBrands && parsedData.preferredBrands.length > 0 && (
            <div className="bg-white rounded-lg p-3 border border-purple-100 md:col-span-2">
              <p className="text-xs font-medium text-purple-600 mb-2">Tercih Edilen Markalar</p>
              <div className="flex flex-wrap gap-1">
                {parsedData.preferredBrands.map((brand: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {brand}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {parsedData.fuelTypes && parsedData.fuelTypes.length > 0 && (
            <div className="bg-white rounded-lg p-3 border border-purple-100">
              <p className="text-xs font-medium text-purple-600 mb-2">Yakıt Türleri</p>
              <div className="flex flex-wrap gap-1">
                {parsedData.fuelTypes.map((fuel: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {fuel}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {parsedData.transmissionTypes && parsedData.transmissionTypes.length > 0 && (
            <div className="bg-white rounded-lg p-3 border border-purple-100">
              <p className="text-xs font-medium text-purple-600 mb-2">Vites Türleri</p>
              <div className="flex flex-wrap gap-1">
                {parsedData.transmissionTypes.map((transmission: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {transmission}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {parsedData.bodyTypes && parsedData.bodyTypes.length > 0 && (
            <div className="bg-white rounded-lg p-3 border border-purple-100">
              <p className="text-xs font-medium text-purple-600 mb-2">Kasa Türleri</p>
              <div className="flex flex-wrap gap-1">
                {parsedData.bodyTypes.map((body: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {body}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {parsedData.colors && parsedData.colors.length > 0 && (
            <div className="bg-white rounded-lg p-3 border border-purple-100">
              <p className="text-xs font-medium text-purple-600 mb-2">Renkler</p>
              <div className="flex flex-wrap gap-1">
                {parsedData.colors.map((color: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {color}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {parsedData.additionalRequirements && (
            <div className="bg-white rounded-lg p-3 border border-purple-100 md:col-span-3">
              <p className="text-xs font-medium text-purple-600 mb-1">Ek Gereksinimler</p>
              <p className="text-sm text-gray-700">{parsedData.additionalRequirements}</p>
            </div>
          )}
        </div>
      );
    }

    // Diğer kategoriler için genel gösterim
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(parsedData).map(([key, value]) => {
          if (value && value !== '' && value !== null && value !== undefined) {
            return (
              <div key={key} className="bg-white rounded-lg p-3 border border-purple-100">
                <p className="text-xs font-medium text-purple-600 mb-1 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
                <p className="font-semibold text-gray-800">
                  {Array.isArray(value) ? (
                    <div className="flex flex-wrap gap-1">
                      {value.map((item: any, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {String(item)}
                        </Badge>
                      ))}
                    </div>
                  ) : typeof value === 'boolean' ? (
                    value ? 'Evet' : 'Hayır'
                  ) : (
                    String(value)
                  )}
                </p>
              </div>
            );
          }
          return null;
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Teklif yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Teklif Bulunamadı</h1>
          <p className="text-muted-foreground mb-6">Aradığınız teklif bulunamadı veya erişim yetkiniz bulunmuyor.</p>
          <Button onClick={() => router.push('/offers')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tekliflere Dön
          </Button>
        </div>
      </div>
    );
  }

  const isListingOwner = currentUserId && currentUserId === offer.listing.userId;
  const isOfferOwner = currentUserId && currentUserId === offer.user.id;
  const canTakeAction = currentUserId && isListingOwner && offer.status === 'pending';
  
  // Debug bilgileri
  console.log('Debug - Teklif Sayfası:', {
    currentUserId,
    'offer.listing.userId': offer.listing.userId,
    'offer.user.id': offer.user.id,
    'offer.status': offer.status,
    isListingOwner,
    isOfferOwner,
    canTakeAction,
    'currentUserId var mı?': !!currentUserId
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Geri Dön
        </Button>
        
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Teklif Detayları</h1>
          {getStatusBadge(offer.status)}
        </div>
      </div>

      <div className="space-y-6">
        {/* Teklif Bilgileri */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Teklif Detayları
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Teklif Tutarı</label>
              <p className="text-2xl font-bold text-primary">{offer.price.toLocaleString('tr-TR')} ₺</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Teklif Tarihi</label>
                <p className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {formatRelativeTime(offer.createdAt)}
                </p>
              </div>
              
              {/* Revizyon hakkı sadece hizmet kategorisi için */}
              {isServiceCategory(offer.listing.category) && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Revizyon Hakkı</label>
                  <p className="flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    {offer.revisionCount} revizyon
                  </p>
                </div>
              )}
            </div>
            
            {offer.guaranteeOffered && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-700">
                  <Shield className="w-5 h-5" />
                  <span className="font-medium">Garanti Sunuluyor</span>
                </div>
                <p className="text-sm text-green-600 mt-1">Bu teklif garanti kapsamındadır</p>
              </div>
            )}
            
            {/* Deneyim ve portföy sadece hizmet kategorisi için */}
            {isServiceCategory(offer.listing.category) && offer.experience && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Deneyim</label>
                <p className="text-sm bg-blue-50 border border-blue-200 p-3 rounded-md">{offer.experience}</p>
              </div>
            )}
            
            {isServiceCategory(offer.listing.category) && offer.portfolio && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Portföy</label>
                <p className="text-sm bg-purple-50 border border-purple-200 p-3 rounded-md">{offer.portfolio}</p>
              </div>
            )}
            
            {offer.message && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Teklif Mesajı</label>
                <p className="text-sm bg-muted p-4 rounded-md border">{offer.message}</p>
              </div>
            )}
            
            {/* Kategoriye Özel Teklif Bilgileri */}
            {offer.categorySpecificData && Object.keys(offer.categorySpecificData).length > 0 && (
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-3 block">Kategoriye Özel Bilgiler</label>
                {renderCategorySpecificData(offer.listing.category, offer.categorySpecificData)}
              </div>
            )}
            
            {offer.additionalServices && offer.additionalServices.length > 0 && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Ek Hizmetler</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {offer.additionalServices.map((service, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {typeof service === 'string' ? service : service.name || 'Ek Hizmet'}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Teklif Sahibi Bilgileri */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Teklif Sahibi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg">
                {offer.user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-lg">{offer.user.name}</p>
                <p className="text-sm text-muted-foreground">{offer.user.email}</p>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Üyelik Tarihi</label>
              <p className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4" />
                {formatRelativeTime(offer.user.createdAt)}
              </p>
            </div>
            
            <div className="pt-4">
              <Button variant="outline" className="w-full" onClick={() => router.push(`/messages?userId=${offer.user.id}`)}>
                <User className="w-4 h-4 mr-2" />
                Mesaj Gönder
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* İlan Bilgileri */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              İlan Detayları
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* İlan Başlığı ve Durum */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{offer.listing.title}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={offer.listing.status === 'active' ? 'default' : 'secondary'}>
                    {offer.listing.status === 'active' ? 'Aktif' : offer.listing.status === 'expired' ? 'Süresi Dolmuş' : 'Kapalı'}
                  </Badge>
                  <span className="text-sm text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">{offer.listing.category}</span>
                  {offer.listing.subcategory && (
                    <>
                      <span className="text-sm text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">{offer.listing.subcategory}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Bütçe Aralığı</p>
                <p className="text-lg font-bold text-primary">
                  {offer.listing.budgetMin.toLocaleString('tr-TR')} - {offer.listing.budgetMax.toLocaleString('tr-TR')} ₺
                </p>
              </div>
            </div>
            
            {/* İlan Görselleri */}
            {offer.listing.images && (
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-3 block">İlan Görselleri</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {JSON.parse(offer.listing.images).slice(0, 4).map((image: string, index: number) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                      <img 
                        src={image} 
                        alt={`İlan görseli ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                        onClick={() => window.open(image, '_blank')}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all flex items-center justify-center">
                        <Image className="w-6 h-6 text-white opacity-0 hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Video */}
            {offer.listing.videoUrl && (
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-3 block">Video</label>
                <div className="relative aspect-video rounded-lg overflow-hidden border bg-gray-100">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button 
                      variant="secondary" 
                      size="lg"
                      onClick={() => window.open(offer.listing.videoUrl, '_blank')}
                    >
                      <Play className="w-6 h-6 mr-2" />
                      Videoyu İzle
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {/* İlan Detayları Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Konum</label>
                  <p className="flex items-center gap-2 font-medium">
                    <MapPin className="w-4 h-4 text-red-500" />
                    {formatCity(offer.listing.location)}
                    {offer.listing.district && `, ${formatDistrict(offer.listing.district)}`}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">İlan Tarihi</label>
                  <p className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {formatRelativeTime(offer.listing.createdAt)}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Son Tarih</label>
                  <p className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    {formatRelativeTime(offer.listing.expiresAt)}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">İstatistikler</label>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {offer.listing.viewCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      {offer.listing.favoriteCount}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">İlan Sahibi</label>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-sm font-bold">
                      {offer.listing.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{offer.listing.user.name}</p>
                      <p className="text-xs text-muted-foreground">Üye: {formatRelativeTime(offer.listing.user.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* İlan Açıklaması */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-3 block">İlan Açıklaması</label>
              <div className="bg-gray-50 border rounded-lg p-4">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{offer.listing.description}</p>
              </div>
            </div>
            

            
            {/* Aksiyon Butonları */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <Button 
                variant="default" 
                onClick={() => router.push(`/listings/${offer.listing.id}`)}
                className="flex-1"
              >
                <FileText className="w-4 h-4 mr-2" />
                İlanı Görüntüle
              </Button>
              
              {isListingOwner && (
                <Button 
                  variant="outline" 
                  onClick={() => router.push(`/listings/${offer.listing.id}/edit`)}
                  className="flex-1"
                >
                  İlanı Düzenle
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Aksiyon Butonları - Tüm kullanıcılar için görünür */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Teklif İşlemleri</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Kabul/Red butonları - sadece ilan sahibi görebilir */}
          {isListingOwner && canTakeAction && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <Button 
                  onClick={() => handleOfferAction('accept')}
                  disabled={actionLoading || userLoading || loading}
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-50 flex-1 min-h-[44px]"
                >
                  {actionLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      İşleniyor...
                    </div>
                  ) : userLoading ? (
                    'Kullanıcı Yükleniyor...'
                  ) : loading ? (
                    'Teklif Yükleniyor...'
                  ) : (
                    '✅ Teklifi Kabul Et'
                  )}
                </Button>
                
                <Button 
                  variant="destructive"
                  onClick={() => handleOfferAction('reject')}
                  disabled={actionLoading || userLoading || loading}
                  className="flex-1 min-h-[44px]"
                >
                  {actionLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      İşleniyor...
                    </div>
                  ) : userLoading ? (
                    'Kullanıcı Yükleniyor...'
                  ) : loading ? (
                    'Teklif Yükleniyor...'
                  ) : (
                    '❌ Teklifi Reddet'
                  )}
                </Button>
              </div>
              
              {/* İşlem durumu göstergesi */}
              {(actionLoading || userLoading || loading) && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 text-blue-700">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm">
                      {actionLoading ? 'Teklif işleniyor, lütfen bekleyin...' :
                       userLoading ? 'Kullanıcı bilgileri kontrol ediliyor...' :
                       'Teklif detayları yükleniyor...'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* İlan sahibi için bilgilendirme mesajı */}
          {isListingOwner && !canTakeAction && offer.status !== 'pending' && (
            <div className={`p-4 rounded-lg border ${
              offer.status === 'accepted' 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className={`flex items-center gap-2 ${
                offer.status === 'accepted' ? 'text-green-700' : 'text-red-700'
              }`}>
                {offer.status === 'accepted' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <XCircle className="w-5 h-5" />
                )}
                <p className="font-medium">
                  {offer.status === 'accepted' 
                    ? 'Teklif Başarıyla Kabul Edildi!' 
                    : 'Teklif Reddedildi'
                  }
                </p>
              </div>
              <p className={`text-sm mt-1 ${
                offer.status === 'accepted' ? 'text-green-600' : 'text-red-600'
              }`}>
                {offer.status === 'accepted' 
                  ? 'Bu teklifi kabul ettiniz. Artık teklif sahibi ile iletişime geçebilirsiniz.' 
                  : 'Bu teklifi reddettiniz. Başka teklifler için ilanınız aktif kalmaya devam ediyor.'
                }
              </p>
            </div>
          )}
          
          {isListingOwner && !canTakeAction && offer.status === 'pending' && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-blue-700">
                <AlertCircle className="w-5 h-5" />
                <p className="font-medium">Bu sizin ilanınıza gelen bir teklif.</p>
              </div>
              <p className="text-sm text-blue-600 mt-1">
                Teklifi değerlendirmek için yukarıdaki butonları kullanabilirsiniz.
              </p>
            </div>
          )}
          
          {/* Butonların neden devre dışı olduğunu açıklayan mesaj */}
           {(!canTakeAction || userLoading) && (
             <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
               <div className="text-sm text-gray-600">
                  {userLoading && (
                    <div>
                      <p>🔄 Kullanıcı bilgileri yükleniyor...</p>
                      <p className="text-xs mt-1">Lütfen bekleyin.</p>
                    </div>
                  )}
                  
                  {!userLoading && !currentUserId && (
                    <div>
                      <p>⚠️ Teklif işlemleri için giriş yapmanız gerekiyor.</p>
                    </div>
                  )}
                  
                  {!userLoading && currentUserId && !isListingOwner && isOfferOwner && (
                    <p>ℹ️ Bu sizin gönderdiğiniz teklif. İlan sahibinin kararını bekliyorsunuz.</p>
                  )}
                  
                  {!userLoading && currentUserId && !isListingOwner && !isOfferOwner && (
                    <p>ℹ️ Bu teklifi sadece ilan sahibi kabul veya reddedebilir.</p>
                  )}
                  
                  {!userLoading && currentUserId && isListingOwner && offer.status !== 'pending' && (
                    <p>ℹ️ Bu teklif zaten işleme alınmış. Durum: {offer.status === 'accepted' ? 'Kabul Edildi' : 'Reddedildi'}</p>
                  )}
                </div>
             </div>
           )}
        </CardContent>
      </Card>
      
      {/* Kabul/Ret butonları neden görünmediğini açıklayan mesajlar */}
      {!canTakeAction && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              {!currentUserId && (
                <div className="text-amber-600">
                  <p className="font-medium">Teklif işlemleri için giriş yapmanız gerekiyor.</p>
                </div>
              )}
              
              {currentUserId && !isListingOwner && isOfferOwner && offer.status === 'pending' && (
                <div className="text-blue-600">
                  <p className="font-medium">Bu sizin gönderdiğiniz teklif.</p>
                  <p className="text-sm text-muted-foreground">İlan sahibinin kararını bekliyorsunuz.</p>
                </div>
              )}
              
              {currentUserId && !isListingOwner && isOfferOwner && offer.status !== 'pending' && (
                <div className={`${
                  offer.status === 'accepted' ? 'text-green-600' : 'text-red-600'
                }`}>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {offer.status === 'accepted' ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                    <p className="font-medium">
                      {offer.status === 'accepted' 
                        ? 'Teklifiniz Kabul Edildi!' 
                        : 'Teklifiniz Reddedildi'
                      }
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {offer.status === 'accepted' 
                      ? 'Tebrikler! İlan sahibi teklifinizi kabul etti. İletişim bilgilerinizi paylaşabilirsiniz.' 
                      : 'Üzgünüz, bu sefer olmadı. Başka ilanlar için yeni teklifler verebilirsiniz.'
                    }
                  </p>
                </div>
              )}
              
              {currentUserId && !isListingOwner && !isOfferOwner && (
                <div className="text-gray-600">
                  <p className="font-medium">Bu teklifi sadece ilan sahibi kabul veya reddedebilir.</p>
                </div>
              )}
              
              {currentUserId && isListingOwner && offer.status !== 'pending' && (
                <div className="text-gray-600">
                  <p className="font-medium">Bu teklif zaten işleme alınmış.</p>
                  <p className="text-sm text-muted-foreground">Durum: {offer.status === 'accepted' ? 'Kabul Edildi' : 'Reddedildi'}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Durum Mesajları */}
      {offer.status !== 'pending' && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="text-center">
              {offer.status === 'accepted' && (
                <div className="text-green-600">
                  <p className="font-medium">Bu teklif kabul edilmiştir.</p>
                  {isListingOwner && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Teklif sahibi ile iletişime geçebilirsiniz.
                    </p>
                  )}
                </div>
              )}
              
              {offer.status === 'rejected' && (
                <div className="text-red-600">
                  <p className="font-medium">Bu teklif reddedilmiştir.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}