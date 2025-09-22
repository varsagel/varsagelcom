'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Package, 
  DollarSign, 
  Heart, 
  Settings, 
  Plus,
  Eye,
  Calendar,
  MapPin,
  Clock,
  MessageSquare
} from 'lucide-react';

interface Listing {
  id: string;
  title: string;
  minPrice: number;
  maxPrice: number;
  category: string;
  subcategory: string;
  condition: string;
  location: string;
  status: string;
  images: string[];
  createdAt: string;
  viewCount: number;
  _count: {
    offers: number;
    favorites: number;
  };
}

interface Offer {
  id: string;
  amount: number;
  message?: string;
  status: string;
  createdAt: string;
  listing: {
    id: string;
    title: string;
    minPrice: number;
    maxPrice: number;
    images: string[];
    user: {
      name: string;
    };
  };
}

interface Favorite {
  id: string;
  createdAt: string;
  listing: {
    id: string;
    title: string;
    minPrice: number;
    maxPrice: number;
    images: string[];
    location: string;
    status: string;
  };
}

interface ReceivedOffer {
  id: string;
  amount: number;
  description?: string;
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
    images: string[];
  };
}

interface AcceptedOffer {
  id: string;
  amount: number;
  description?: string;
  status: string;
  createdAt: string;
  type: 'sent' | 'received';
  seller?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  listing: {
    id: string;
    title: string;
    minPrice: number;
    maxPrice: number;
    images: string[];
    user?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

interface RejectedOffer {
  id: string;
  amount: number;
  description?: string;
  status: string;
  rejectionReason?: string;
  createdAt: string;
  type: 'sent' | 'received';
  seller?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  listing: {
    id: string;
    title: string;
    minPrice: number;
    maxPrice: number;
    images: string[];
    user?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('listings');
  const [listings, setListings] = useState<Listing[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [receivedOffers, setReceivedOffers] = useState<ReceivedOffer[]>([]);
  const [acceptedOffers, setAcceptedOffers] = useState<AcceptedOffer[]>([]);
  const [rejectedOffers, setRejectedOffers] = useState<RejectedOffer[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData();
    }
  }, [status]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Kullanıcının ilanlarını fetch et
      const listingsRes = await fetch('/api/user/listings');
      if (listingsRes.ok) {
        const listingsData = await listingsRes.json();
        setListings(listingsData);
      }

      // Kullanıcının verdiği teklifleri fetch et
      const offersRes = await fetch('/api/user/offers');
      if (offersRes.ok) {
        const offersData = await offersRes.json();
        setOffers(offersData);
      }

      // Kullanıcının aldığı teklifleri fetch et
      const receivedOffersRes = await fetch('/api/user/received-offers');
      if (receivedOffersRes.ok) {
        const receivedOffersData = await receivedOffersRes.json();
        setReceivedOffers(receivedOffersData);
      }

      // Kullanıcının kabul edilen tekliflerini fetch et
      const acceptedOffersRes = await fetch('/api/user/accepted-offers');
      if (acceptedOffersRes.ok) {
        const acceptedOffersData = await acceptedOffersRes.json();
        setAcceptedOffers(acceptedOffersData);
      }

      // Kullanıcının reddedilen tekliflerini fetch et
      const rejectedOffersRes = await fetch('/api/user/rejected-offers');
      if (rejectedOffersRes.ok) {
        const rejectedOffersData = await rejectedOffersRes.json();
        setRejectedOffers(rejectedOffersData);
      }

      // Kullanıcının favorilerini fetch et
      const favoritesRes = await fetch('/api/user/favorites');
      if (favoritesRes.ok) {
        const favoritesData = await favoritesRes.json();
        setFavorites(favoritesData);
      }
    } catch (error) {
      console.error('Veri yüklenirken hata:', error);
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

  const formatPriceRange = (minPrice: number, maxPrice: number) => {
    if (minPrice && maxPrice && minPrice !== maxPrice) {
      return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
    } else if (minPrice) {
      return formatPrice(minPrice);
    } else if (maxPrice) {
      return `En fazla ${formatPrice(maxPrice)}`;
    }
    return 'Fiyat belirtilmemiş';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'sold':
        return 'bg-gray-100 text-gray-800';
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
      case 'active':
        return 'Aktif';
      case 'sold':
        return 'Satıldı';
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

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{session?.user?.name}</h1>
                <p className="text-gray-600">{session?.user?.email}</p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Settings className="w-4 h-4" />
              Ayarlar
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{listings.length}</p>
                <p className="text-gray-600">İlanlarım</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{offers.length}</p>
                <p className="text-gray-600">Tekliflerim</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{receivedOffers.length}</p>
                <p className="text-gray-600">Aldığım Teklifler</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{acceptedOffers.length}</p>
                <p className="text-gray-600">Kabul Edilen</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{rejectedOffers.length}</p>
                <p className="text-gray-600">Reddedilen</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{favorites.length}</p>
                <p className="text-gray-600">Favorilerim</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('listings')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'listings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  İlanlarım ({listings.length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab('offers')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'offers'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Verdiğim Teklifler ({offers.length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab('received-offers')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'received-offers'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Aldığım Teklifler ({receivedOffers.length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab('accepted-offers')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'accepted-offers'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Kabul Edilen ({acceptedOffers.length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab('rejected-offers')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'rejected-offers'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Reddedilen ({rejectedOffers.length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab('favorites')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'favorites'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Favorilerim ({favorites.length})
                </div>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* İlanlarım Tab */}
            {activeTab === 'listings' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">İlanlarım</h2>
                  <button
                    onClick={() => router.push('/listings/create')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Yeni İlan
                  </button>
                </div>

                {listings.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz ilan yok</h3>
                    <p className="text-gray-600 mb-4">İlk ilanınızı oluşturun ve satışa başlayın!</p>
                    <button
                      onClick={() => router.push('/listings/create')}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      İlan Oluştur
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {listings.map((listing) => (
                      <div 
                        key={listing.id} 
                        className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => router.push(`/listings/${listing.id}`)}
                      >
                        <div className="aspect-w-16 aspect-h-12 bg-gray-200">
                          {listing.images && listing.images.length > 0 ? (
                            <img
                              src={listing.images[0]}
                              alt={listing.title}
                              className="w-full h-48 object-cover"
                            />
                          ) : (
                            <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                              <Package className="w-12 h-12 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium text-gray-900 line-clamp-2">{listing.title}</h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(listing.status)}`}>
                              {getStatusText(listing.status)}
                            </span>
                          </div>
                          <p className="text-lg font-bold text-blue-600 mb-2">{formatPriceRange(listing.minPrice, listing.maxPrice)}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {listing.viewCount}
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              {listing._count.offers}
                            </div>
                            <div className="flex items-center gap-1">
                              <Heart className="w-4 h-4" />
                              {listing._count.favorites}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                            <MapPin className="w-4 h-4" />
                            {listing.location}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            {formatDate(listing.createdAt)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Verdiğim Teklifler Tab */}
            {activeTab === 'offers' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Verdiğim Teklifler</h2>
                
                {offers.length === 0 ? (
                  <div className="text-center py-12">
                    <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz teklif yok</h3>
                    <p className="text-gray-600">İlanları inceleyin ve teklif verin!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {offers.map((offer) => (
                      <div 
                        key={offer.id} 
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => router.push(`/offers/${offer.id}`)}
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                            {offer.listing.images && offer.listing.images.length > 0 ? (
                              <img
                                src={offer.listing.images[0]}
                                alt={offer.listing.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <Package className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-medium text-gray-900">{offer.listing.title}</h3>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(offer.status)}`}>
                                {getStatusText(offer.status)}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 mb-2">
                              <div>
                                <span className="text-sm text-gray-600">İlan Fiyatı: </span>
                                <span className="font-medium">{formatPriceRange(offer.listing.minPrice, offer.listing.maxPrice)}</span>
                              </div>
                              <div>
                                <span className="text-sm text-gray-600">Teklifim: </span>
                                <span className="font-bold text-green-600">{formatPrice(offer.amount)}</span>
                              </div>
                            </div>
                            {offer.message && (
                              <p className="text-sm text-gray-600 mb-2">&quot;{offer.message}&quot;</p>
                            )}
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="w-4 h-4" />
                              {formatDate(offer.createdAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Aldığım Teklifler Tab */}
            {activeTab === 'received-offers' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Aldığım Teklifler</h2>
                
                {receivedOffers.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz teklif yok</h3>
                    <p className="text-gray-600">İlanlarınıza gelen teklifler burada görünecek!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {receivedOffers.map((offer) => (
                      <div 
                        key={offer.id} 
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => router.push(`/offers/${offer.id}`)}
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                            {offer.listing.images && offer.listing.images.length > 0 ? (
                              <img
                                src={offer.listing.images[0]}
                                alt={offer.listing.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <Package className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-medium text-gray-900">{offer.listing.title}</h3>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(offer.status)}`}>
                                {getStatusText(offer.status)}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 mb-2">
                              <div>
                                <span className="text-sm text-gray-600">İlan Fiyatı: </span>
                                <span className="font-medium">{formatPriceRange(offer.listing.minPrice, offer.listing.maxPrice)}</span>
                              </div>
                              <div>
                                <span className="text-sm text-gray-600">Teklif: </span>
                                <span className="font-bold text-green-600">{formatPrice(offer.amount)}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 mb-2">
                              <div>
                                <span className="text-sm text-gray-600">Teklif Veren: </span>
                                <span className="font-medium">{offer.seller.firstName} {offer.seller.lastName}</span>
                              </div>
                            </div>
                            {offer.description && (
                              <p className="text-sm text-gray-600 mb-2">&quot;{offer.description}&quot;</p>
                            )}
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="w-4 h-4" />
                              {formatDate(offer.createdAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Kabul Edilen Teklifler Tab */}
            {activeTab === 'accepted-offers' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Kabul Edilen Teklifler</h2>
                
                {acceptedOffers.length === 0 ? (
                  <div className="text-center py-12">
                    <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz kabul edilen teklif yok</h3>
                    <p className="text-gray-600">Kabul edilen teklifleriniz burada görünecek.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {acceptedOffers.map((offer) => (
                      <div 
                        key={offer.id} 
                        className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => router.push(`/offers/${offer.id}`)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                                offer.type === 'sent' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                              }`}>
                                {offer.type === 'sent' ? 'Verdiğim Teklif' : 'Aldığım Teklif'}
                              </span>
                              <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">
                                Kabul Edildi
                              </span>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              {offer.listing.title}
                            </h3>
                            <p className="text-2xl font-bold text-green-600 mb-2">{formatPrice(offer.amount)}</p>
                            {offer.description && (
                              <p className="text-gray-600 mb-3">{offer.description}</p>
                            )}
                            {offer.rejectionReason && (
                              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                                <p className="text-sm font-medium text-red-800 mb-1">Reddetme Nedeni:</p>
                                <p className="text-sm text-red-700">{offer.rejectionReason}</p>
                              </div>
                            )}
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatDate(offer.createdAt)}
                              </div>
                              {(offer.type === 'received' && offer.seller) && (
                                <div className="flex items-center gap-1">
                                  <User className="w-4 h-4" />
                                  {offer.seller.firstName} {offer.seller.lastName}
                                </div>
                              )}
                              {(offer.type === 'sent' && offer.listing.user) && (
                                <div className="flex items-center gap-1">
                                  <User className="w-4 h-4" />
                                  {offer.listing.user.firstName} {offer.listing.user.lastName}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="ml-4">
                            {offer.listing.images && offer.listing.images.length > 0 ? (
                              <img
                                src={offer.listing.images[0]}
                                alt={offer.listing.title}
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                                <Package className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reddedilen Teklifler Tab */}
            {activeTab === 'rejected-offers' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Reddedilen Teklifler</h2>
                
                {rejectedOffers.length === 0 ? (
                  <div className="text-center py-12">
                    <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz reddedilen teklif yok</h3>
                    <p className="text-gray-600">Reddedilen teklifleriniz burada görünecek.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {rejectedOffers.map((offer) => (
                      <div key={offer.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                                offer.type === 'sent' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                              }`}>
                                {offer.type === 'sent' ? 'Verdiğim Teklif' : 'Aldığım Teklif'}
                              </span>
                              <span className="px-3 py-1 text-sm font-medium rounded-full bg-red-100 text-red-800">
                                Reddedildi
                              </span>
                            </div>
                            <h3 
                              className="text-lg font-medium text-gray-900 mb-2 cursor-pointer hover:text-blue-600"
                              onClick={() => router.push(`/offers/${offer.listing.id}`)}
                            >
                              {offer.listing.title}
                            </h3>
                            <p className="text-2xl font-bold text-red-600 mb-2">{formatPrice(offer.amount)}</p>
                            {offer.description && (
                              <p className="text-gray-600 mb-3">{offer.description}</p>
                            )}
                            {offer.rejectionReason && (
                              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                                <p className="text-sm font-medium text-red-800 mb-1">Reddetme Nedeni:</p>
                                <p className="text-sm text-red-700">{offer.rejectionReason}</p>
                              </div>
                            )}
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatDate(offer.createdAt)}
                              </div>
                              {(offer.type === 'received' && offer.seller) && (
                                <div className="flex items-center gap-1">
                                  <User className="w-4 h-4" />
                                  {offer.seller.firstName} {offer.seller.lastName}
                                </div>
                              )}
                              {(offer.type === 'sent' && offer.listing.user) && (
                                <div className="flex items-center gap-1">
                                  <User className="w-4 h-4" />
                                  {offer.listing.user.firstName} {offer.listing.user.lastName}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="ml-4">
                            {offer.listing.images && offer.listing.images.length > 0 ? (
                              <img
                                src={offer.listing.images[0]}
                                alt={offer.listing.title}
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                                <Package className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Favorilerim Tab */}
            {activeTab === 'favorites' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Favorilerim</h2>
                
                {favorites.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz favori yok</h3>
                    <p className="text-gray-600">Beğendiğiniz ilanları favorilerinize ekleyin!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((favorite) => (
                      <div 
                        key={favorite.id} 
                        className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => router.push(`/listings/${favorite.listing.id}`)}
                      >
                        <div className="aspect-w-16 aspect-h-12 bg-gray-200">
                          {favorite.listing.images && favorite.listing.images.length > 0 ? (
                            <img
                              src={favorite.listing.images[0]}
                              alt={favorite.listing.title}
                              className="w-full h-48 object-cover"
                            />
                          ) : (
                            <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                              <Package className="w-12 h-12 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium text-gray-900 line-clamp-2">{favorite.listing.title}</h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(favorite.listing.status)}`}>
                              {getStatusText(favorite.listing.status)}
                            </span>
                          </div>
                          <p className="text-lg font-bold text-blue-600 mb-2">{formatPriceRange(favorite.listing.minPrice, favorite.listing.maxPrice)}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                            <MapPin className="w-4 h-4" />
                            {favorite.listing.location}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            Favorilere eklendi: {formatDate(favorite.createdAt)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}