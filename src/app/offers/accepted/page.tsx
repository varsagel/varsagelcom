'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Package,
  DollarSign,
  Clock,
  User,
  CheckCircle,
  Calendar,
  MapPin,
  Eye,
  MessageSquare
} from 'lucide-react';

interface AcceptedOffer {
  id: string;
  amount: number;
  description: string;
  status: string;
  createdAt: string;
  seller: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  listing: {
    id: string;
    title: string;
    minPrice: number;
    maxPrice: number;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

export default function AcceptedOffersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [offers, setOffers] = useState<AcceptedOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>('received');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchAcceptedOffers();
    }
  }, [status, activeTab]);

  const fetchAcceptedOffers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/offers?type=${activeTab}&status=accepted`);
      
      if (!response.ok) {
        throw new Error('Kabul edilen teklifler yüklenemedi');
      }

      const data = await response.json();
      setOffers(data);
    } catch (error) {
      console.error('Error fetching accepted offers:', error);
      setError(error instanceof Error ? error.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Kabul edilen teklifler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Package className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Hata Oluştu</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Yeniden Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kabul Edilen Teklifler</h1>
            <p className="text-gray-600">Başarıyla kabul edilen tüm teklifleriniz</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6 w-fit">
          <button
            onClick={() => setActiveTab('received')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'received'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Aldığım Teklifler
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'sent'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Verdiğim Teklifler
          </button>
        </div>

        {/* Offers List */}
        {offers.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Henüz kabul edilen teklif yok
            </h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'received' 
                ? 'Henüz hiçbir teklifi kabul etmediniz.'
                : 'Verdiğiniz hiçbir teklif henüz kabul edilmedi.'
              }
            </p>
            <button
              onClick={() => router.push('/offers')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tüm Teklifleri Görüntüle
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {offers.map((offer) => (
              <div key={offer.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Listing Info */}
                    <div className="flex items-start gap-4 mb-4">
                      <Package className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {offer.listing.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          İlan Sahibi: {offer.listing.user.firstName} {offer.listing.user.lastName}
                        </p>
                      </div>
                    </div>

                    {/* Offer Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-600">Teklif Tutarı:</span>
                        <span className="font-semibold text-green-600">
                          {formatPrice(offer.amount)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Kabul Tarihi:</span>
                        <span className="text-sm text-gray-900">
                          {formatDate(offer.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Seller/Buyer Info */}
                    <div className="flex items-center gap-2 mb-4">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {activeTab === 'received' ? 'Teklif Veren:' : 'Teklif Alan:'}
                      </span>
                      <span className="text-sm text-gray-900">
                        {offer.seller.firstName} {offer.seller.lastName}
                      </span>
                    </div>

                    {/* Description */}
                    {offer.description && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                          "{offer.description}"
                        </p>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Kabul Edildi
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => router.push(`/offers/${offer.id}`)}
                      className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Detay
                    </button>
                    <button
                      onClick={() => router.push(`/messages?offerId=${offer.id}`)}
                      className="px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Mesaj
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}