'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Offer {
  id: string;
  price: number;
  deliveryTime: string;
  description: string;
  experience?: string;
  portfolio?: string;
  guaranteeOffered?: boolean;
  revisionCount?: number;
  additionalServices?: string[];
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  createdAt: string;
  conversationId?: string | null;
  listing: {
    id: string;
    title: string;
    description: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export default function OffersPage() {
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>('sent');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    
    setIsAuthenticated(true);
    fetchOffers();
  }, [router, activeTab]);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`/api/offers?type=${activeTab}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.status === 401) {
        localStorage.removeItem('token');
        router.push('/auth/signin');
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        console.log('Teklifler başarıyla yüklendi:', data);
        setOffers(data);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Bilinmeyen hata' }));
        console.error('API hatası:', response.status, errorData);
        throw new Error(errorData.error || `HTTP ${response.status}: Teklifler yüklenemedi`);
      }
    } catch (error) {
      console.error('Teklifler yüklenirken hata:', error);
      // Kullanıcıya hata mesajı göster
      alert(`Teklifler Yüklenemedi\n\n${error instanceof Error ? error.message : 'Teklifler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOfferAction = async (offerId: string, action: 'accept' | 'reject' | 'cancel') => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/auth/signin');
        return;
      }

      const response = await fetch(`/api/offers/${offerId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (response.status === 401) {
          localStorage.removeItem('token');
          router.push('/auth/login');
          return;
        }

      if (response.ok) {
        fetchOffers(); // Listeyi yenile
      }
    } catch (error) {
      console.error('Teklif işlemi sırasında hata:', error);
    }
  };

  const handleDeleteOffer = async (offerId: string) => {
    if (!isAuthenticated) {
      router.push('/auth/signin');
      return;
    }

    if (!confirm('Bu teklifi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/offers/${offerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        router.push('/auth/signin');
        return;
      }

      if (response.ok) {
        // Refresh offers after deletion
        fetchOffers();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Teklif silinirken hata oluştu');
      }
    } catch (error) {
      console.error('Error deleting offer:', error);
      alert('Teklif silinirken hata oluştu');
    }
  };

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <div className="px-6 py-4">
              <h1 className="text-2xl font-bold text-gray-900">Tekliflerim</h1>
              <p className="text-gray-600 mt-1">Gönderdiğiniz ve aldığınız teklifleri yönetin</p>
            </div>
            
            {/* Tab Navigation */}
            <div className="px-6">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('sent')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'sent'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Gönderilen Teklifler
                </button>
                <button
                  onClick={() => setActiveTab('received')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'received'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Alınan Teklifler
                </button>
              </nav>
            </div>
          </div>

          <div className="p-6">
            {offers.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📋</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {activeTab === 'sent' ? 'Henüz teklif göndermediniz' : 'Henüz teklif almadınız'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {activeTab === 'sent' 
                    ? 'İlanları inceleyin ve ilginizi çeken projelere teklif gönderin'
                    : 'İlan oluşturun ve freelancerlardan teklif almaya başlayın'
                  }
                </p>
                <Link
                  href={activeTab === 'sent' ? '/listings' : '/listings/create'}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  {activeTab === 'sent' ? 'İlanları İncele' : 'İlan Oluştur'}
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {offers.map((offer) => (
                  <div key={offer.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-bold text-xl text-gray-900 mb-2">{offer.listing.title}</h3>
                          <p className="text-gray-600 text-sm leading-relaxed">{offer.listing.description}</p>
                          {activeTab === 'received' && (
                            <div className="mt-3 flex items-center gap-2">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-semibold text-sm">{offer.user.name.charAt(0)}</span>
                              </div>
                              <p className="text-sm text-gray-700 font-medium">
                                Teklif veren: {offer.user.name}
                              </p>
                            </div>
                          )}
                        </div>
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                          offer.status === 'accepted' ? 'bg-green-100 text-green-800 border border-green-200' :
                          offer.status === 'rejected' ? 'bg-red-100 text-red-800 border border-red-200' :
                          offer.status === 'cancelled' ? 'bg-gray-100 text-gray-800 border border-gray-200' :
                          'bg-yellow-100 text-yellow-800 border border-yellow-200'
                        }`}>
                          {offer.status === 'accepted' ? '✓ Kabul Edildi' :
                           offer.status === 'rejected' ? '✗ Reddedildi' :
                           offer.status === 'cancelled' ? '🚫 İptal Edildi' : '⏳ Beklemede'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-blue-600">💰</span>
                            <span className="font-medium text-blue-800 text-sm">Teklif Fiyatı</span>
                          </div>
                          <p className="text-blue-700 font-bold text-lg">₺{offer.price.toLocaleString()}</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-green-600">⏰</span>
                            <span className="font-medium text-green-800 text-sm">Teslimat Süresi</span>
                          </div>
                          <p className="text-green-700 font-bold">{offer.deliveryTime}</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-purple-600">🔄</span>
                            <span className="font-medium text-purple-800 text-sm">Revizyon Hakkı</span>
                          </div>
                          <p className="text-purple-700 font-bold">{offer.revisionCount || 0} adet</p>
                        </div>
                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-orange-600">🛡️</span>
                            <span className="font-medium text-orange-800 text-sm">İş Garantisi</span>
                          </div>
                          <p className={`font-bold ${
                            offer.guaranteeOffered ? 'text-green-600' : 'text-gray-500'
                          }`}>
                            {offer.guaranteeOffered ? '✓ Var' : '✗ Yok'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <span>📝</span>
                            Teklif Açıklaması
                          </h4>
                          <p className="text-gray-700 leading-relaxed">{offer.description}</p>
                        </div>
                        
                        {offer.experience && (
                          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                            <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                              <span>🎯</span>
                              Deneyim ve Uzmanlık
                            </h4>
                            <p className="text-blue-700 leading-relaxed">{offer.experience}</p>
                          </div>
                        )}
                        
                        {offer.portfolio && (
                          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200">
                            <h4 className="font-semibold text-indigo-800 mb-3 flex items-center gap-2">
                              <span>🎨</span>
                              Portföy ve Referanslar
                            </h4>
                            <a href={offer.portfolio} target="_blank" rel="noopener noreferrer" 
                               className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
                              <span>🔗</span>
                              Referans çalışmalarını görüntüle
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          </div>
                        )}
                        
                        {offer.additionalServices && offer.additionalServices.length > 0 && (
                          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                            <h4 className="font-semibold text-emerald-800 mb-3 flex items-center gap-2">
                              <span>⭐</span>
                              Ek Hizmetler
                            </h4>
                            <ul className="space-y-2">
                              {offer.additionalServices.map((service, index) => (
                                <li key={index} className="flex items-center gap-2 text-emerald-700">
                                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                                  {service}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                          <span>📅</span>
                          {new Date(offer.createdAt).toLocaleDateString('tr-TR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/offers/${offer.id}`}
                            className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <span className="mr-1">👁️</span>
                            Detay
                          </Link>
                          {activeTab === 'sent' && (offer.status === 'pending' || offer.status === 'rejected') && (
                            <button 
                              onClick={() => handleDeleteOffer(offer.id)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1 transition-colors"
                            >
                              <span>🗑️</span>
                              {offer.status === 'pending' ? 'Teklifi Geri Çek' : 'Teklifi Sil'}
                            </button>
                          )}
                          {activeTab === 'sent' && offer.status === 'accepted' && (
                            <button 
                              onClick={() => {
                                if (confirm('Bu teklifi iptal etmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve ilan tekrar aktif hale gelecektir.')) {
                                  handleOfferAction(offer.id, 'cancel');
                                }
                              }}
                              className="text-orange-600 hover:text-orange-800 text-sm font-medium flex items-center gap-1 transition-colors"
                            >
                              <span>🚫</span>
                              Teklifi İptal Et
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons for Received Offers */}
                      {activeTab === 'received' && offer.status === 'pending' && (
                        <div className="flex gap-3 pt-4 border-t border-gray-200">
                          <button
                            onClick={() => handleOfferAction(offer.id, 'accept')}
                            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Kabul Et
                          </button>
                          <button
                            onClick={() => handleOfferAction(offer.id, 'reject')}
                            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Reddet
                          </button>
                        </div>
                      )}

                      {/* Contact Button for Accepted Offers */}
                      {offer.status === 'accepted' && offer.conversationId && (
                        <div className="pt-4 border-t border-gray-200">
                          <Link
                            href={`/messages/${offer.conversationId}`}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <span className="mr-2">💬</span>
                            Mesajlaş
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}