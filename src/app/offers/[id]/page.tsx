'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft,
  Package,
  DollarSign,
  Clock,
  User,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  MapPin,
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import RejectionReasonModal from '@/components/RejectionReasonModal';

interface OfferDetail {
  id: string;
  amount: number;
  message?: string;
  status: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  categorySpecificData?: any;
  listing: {
    id: string;
    title: string;
    description: string;
    minPrice: number;
    maxPrice: number;
    images: string[];
    location: string;
    status: string;
    category: string;
    subcategory: string;
    condition: string;
    createdAt: string;
    views: number;
    user: {
      id: string;
      name: string;
      email: string;
    };
    _count: {
      offers: number;
      favorites: number;
    };
  };
}

export default function OfferDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [offer, setOffer] = useState<OfferDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [isListingDetailsOpen, setIsListingDetailsOpen] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (params.id && status === 'authenticated') {
      fetchOfferDetail();
    }
  }, [params.id, status]);

  const fetchOfferDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/offers/${params.id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Bu teklif bulunamadı. Teklif silinmiş olabilir veya geçersiz bir bağlantı kullanıyor olabilirsiniz.');
        } else if (response.status === 401) {
          throw new Error('Bu teklifi görüntülemek için giriş yapmanız gerekiyor.');
        } else if (response.status === 403) {
          throw new Error('Bu teklifi görüntüleme yetkiniz bulunmuyor.');
        } else {
          throw new Error(`Teklif yüklenirken bir hata oluştu (${response.status})`);
        }
      }

      const data = await response.json();
      setOffer(data);
    } catch (error) {
      console.error('Error fetching offer:', error);
      setError(error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleOfferAction = async (action: 'accepted' | 'rejected', rejectionReason?: string) => {
    if (!offer || updating) return;

    if (action === 'accepted') {
      const confirmMessage = 'Bu teklifi kabul etmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve ilanınız satıldı olarak işaretlenecektir.';
      if (!confirm(confirmMessage)) return;
    } else if (action === 'rejected' && !rejectionReason) {
      // Reddetme için modal açılacak, burada direkt işlem yapmıyoruz
      setShowRejectionModal(true);
      return;
    }

    setUpdating(true);
    try {
      const requestBody: any = { status: action };
      if (action === 'rejected' && rejectionReason) {
        requestBody.rejectionReason = rejectionReason;
      }

      const response = await fetch(`/api/offers/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Teklif güncellenirken bir hata oluştu');
      }

      // Teklif detayını yeniden yükle
      await fetchOfferDetail();
      
      const successMessage = action === 'accepted' 
        ? 'Teklif başarıyla kabul edildi!' 
        : 'Teklif başarıyla reddedildi!';
      
      alert(successMessage);
      
      if (action === 'rejected') {
        setShowRejectionModal(false);
      }
    } catch (error) {
      console.error('Error updating offer:', error);
      alert(error instanceof Error ? error.message : 'Bir hata oluştu');
    } finally {
      setUpdating(false);
    }
  };

  const handleRejectionSubmit = (rejectionReason: string) => {
    handleOfferAction('rejected', rejectionReason);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatPriceRange = (minPrice: number, maxPrice: number) => {
    if (minPrice === maxPrice) {
      return formatPrice(minPrice);
    }
    return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Beklemede';
      case 'accepted':
        return 'Kabul Edildi';
      case 'rejected':
        return 'Reddedildi';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Teklif detayları yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Teklif Bulunamadı</h2>
          <p className="text-gray-600 mb-6">{error || 'Bu teklif mevcut değil veya erişim yetkiniz yok.'}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Geri Dön
            </button>
            <button
              onClick={() => router.push('/offers')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tüm Teklifler
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Yeniden Dene
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Teklif Detayı</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Teklif Bilgileri */}
          <div className="lg:col-span-2 space-y-6">
            {/* Teklif Durumu */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Teklif Durumu</h2>
                <div className="flex items-center gap-2">
                  {getStatusIcon(offer.status)}
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(offer.status)}`}>
                    {getStatusText(offer.status)}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Teklif Miktarı</p>
                  <p className="text-2xl font-bold text-green-600">{formatPrice(offer.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">İlan Fiyat Aralığı</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatPriceRange(offer.listing.minPrice, offer.listing.maxPrice)}
                  </p>
                </div>
              </div>

              {offer.message && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Mesajınız</p>
                  <p className="text-gray-900">&quot;{offer.message}&quot;</p>
                </div>
              )}

              {offer.status === 'rejected' && offer.rejectionReason && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-medium text-red-800 mb-1">Reddetme Nedeni:</p>
                  <p className="text-red-700">{offer.rejectionReason}</p>
                </div>
              )}

              {/* Kabul Et / Reddet Butonları - Sadece ilan sahibi için */}
              {session?.user?.email === offer.listing.user.email && offer.status === 'pending' && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-3">Bu teklifi değerlendirin:</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleOfferAction('accepted')}
                      disabled={updating}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <CheckCircle className="w-5 h-5" />
                      {updating ? 'İşleniyor...' : 'Kabul Et'}
                    </button>
                    <button
                      onClick={() => handleOfferAction('rejected')}
                      disabled={updating}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <XCircle className="w-5 h-5" />
                      {updating ? 'İşleniyor...' : 'Reddet'}
                    </button>
                  </div>
                </div>
              )}

              {/* Kategori Özel Veriler */}
              {offer.categorySpecificData && Object.keys(offer.categorySpecificData).length > 0 && (
                <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                      <Package className="w-4 h-4 text-blue-600" />
                      Teklifinizde Belirttiğiniz Özel Bilgiler
                    </h3>
                  </div>
                  <div className="bg-white p-4">
                    <div className="grid grid-cols-1 gap-3">
                      {(() => {
                        // categorySpecificData'nın doğru şekilde parse edildiğinden emin ol
                        let data = offer.categorySpecificData;
                        if (typeof data === 'string') {
                          try {
                            data = JSON.parse(data);
                          } catch (error) {
                            console.error('categorySpecificData parse error:', error);
                            data = {};
                          }
                        }
                        if (!data || typeof data !== 'object') {
                          data = {};
                        }
                        
                        return Object.entries(data).map(([key, value]) => {
                         // Türkçe alan adı çevirileri
                         const fieldTranslations: { [key: string]: string } = {
                           'brand': 'Marka',
                           'model': 'Model',
                           'year': 'Yıl',
                           'mileage': 'Kilometre',
                           'fuel-type': 'Yakıt Türü',
                           'transmission': 'Vites',
                           'body-type': 'Kasa Tipi',
                           'color': 'Renk',
                           'engine-size': 'Motor Hacmi',
                           'horsepower': 'Beygir Gücü',
                           'features': 'Özellikler',
                           'exchange': 'Takas',
                           'series': 'Seri',
                           'condition': 'Durum'
                         };
                         
                         const displayName = fieldTranslations[key] || 
                           key.replace(/([A-Z])/g, ' $1')
                              .replace(/^./, str => str.toUpperCase())
                              .replace(/-/g, ' ');
                         
                         return (
                         <div key={key} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-gray-100 last:border-b-0">
                           <span className="text-sm font-medium text-gray-700 mb-1 sm:mb-0">
                             {displayName}
                           </span>
                          <span className="text-sm text-gray-900 bg-gray-50 px-3 py-1 rounded-md font-medium">
                            {(() => {
                              if (value === null || value === undefined || value === '') {
                                return 'Belirtilmemiş';
                              }
                              if (Array.isArray(value)) {
                                return value.join(', ');
                              }
                              if (typeof value === 'object') {
                                return Object.entries(value).map(([k, v]) => `${k}: ${v}`).join(', ');
                              }
                              return String(value);
                            })()}
                           </span>
                         </div>
                         );
                       });
                      })()}
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Gönderilme: {formatDate(offer.createdAt)}
                </div>
                {offer.updatedAt !== offer.createdAt && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Güncelleme: {formatDate(offer.updatedAt)}
                  </div>
                )}
              </div>
            </div>


          </div>

          {/* Sağ Taraf - İlan ve Alıcı Bilgileri */}
          <div className="space-y-6">
            {/* İlan Detay Bilgileri */}
            <div className="bg-white rounded-lg shadow-sm">
              <div 
                className="p-6 cursor-pointer flex items-center justify-between hover:bg-gray-50 transition-colors"
                onClick={() => setIsListingDetailsOpen(!isListingDetailsOpen)}
              >
                <h2 className="text-lg font-semibold text-gray-900">İlan Detayları</h2>
                {isListingDetailsOpen ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </div>
              
              {isListingDetailsOpen && (
                <div className="px-6 pb-6">
                  {/* İlan Görseli */}
                  <div className="mb-4">
                    <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden">
                      {offer.listing.images && offer.listing.images.length > 0 ? (
                        <img
                          src={offer.listing.images[0]}
                          alt={offer.listing.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <Package className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* İlan Başlığı */}
                  <h3 className="font-semibold text-gray-900 mb-3 text-lg">{offer.listing.title}</h3>
                  
                  {/* İlan Bilgileri */}
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fiyat Aralığı:</span>
                      <span className="text-gray-900 font-medium">{formatPriceRange(offer.listing.minPrice, offer.listing.maxPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Kategori:</span>
                      <span className="text-gray-900">{offer.listing.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Alt Kategori:</span>
                      <span className="text-gray-900">{offer.listing.subcategory}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Durum:</span>
                      <span className="text-gray-900">{offer.listing.condition}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Konum:</span>
                      <span className="text-gray-900 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {offer.listing.location}
                      </span>
                    </div>
                     <div className="flex justify-between">
                       <span className="text-gray-600">Görüntülenme:</span>
                       <span className="text-gray-900 flex items-center gap-1">
                         <Eye className="w-3 h-3" />
                         {offer.listing.views}
                       </span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-gray-600">İlan Tarihi:</span>
                       <span className="text-gray-900">{formatDate(offer.listing.createdAt)}</span>
                     </div>
                   </div>

                   {/* İlan Açıklaması */}
                   {offer.listing.description && (
                     <div className="mt-4 pt-4 border-t border-gray-200">
                       <h4 className="text-sm font-medium text-gray-900 mb-2">Açıklama</h4>
                       <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">
                         {offer.listing.description}
                       </p>
                     </div>
                   )}

                   {/* İlan Butonları */}
                   <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                     <button
                       onClick={() => router.push(`/listings/${offer.listing.id}`)}
                       className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                     >
                       İlanı Detaylı Görüntüle
                     </button>
                     <button
                       onClick={() => router.push(`/messages?userId=${offer.listing.user.id}`)}
                       className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm"
                     >
                       <MessageSquare className="w-4 h-4" />
                       Satıcıyla Mesajlaş
                     </button>
                   </div>
                 </div>
               )}
             </div>

           {/* Alıcı Bilgileri */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Alıcı Bilgileri</h2>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{offer.listing.user.name}</p>
                  <p className="text-sm text-gray-600">{offer.listing.user.email}</p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">İlan Tarihi:</span>
                  <span className="text-gray-900">{formatDate(offer.listing.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Toplam Teklif:</span>
                  <span className="text-gray-900">{offer.listing._count.offers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Favori Sayısı:</span>
                  <span className="text-gray-900">{offer.listing._count.favorites}</span>
                </div>
              </div>
            </div>

            {/* İlan Durumu */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">İlan Durumu</h2>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  offer.listing.status === 'active' ? 'bg-green-500' : 
                  offer.listing.status === 'sold' ? 'bg-red-500' : 'bg-yellow-500'
                }`}></div>
                <span className="text-sm font-medium">
                  {offer.listing.status === 'active' ? 'Aktif' :
                   offer.listing.status === 'sold' ? 'Satıldı' : 'Pasif'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rejection Reason Modal */}
      <RejectionReasonModal
        isOpen={showRejectionModal}
        onClose={() => setShowRejectionModal(false)}
        onSubmit={handleRejectionSubmit}
        isLoading={updating}
      />
    </div>
  );
}