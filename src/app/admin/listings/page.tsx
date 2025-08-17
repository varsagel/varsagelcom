'use client';

import { useState, useEffect } from 'react';
import { Listing, User } from '@prisma/client';
import Link from 'next/link';
import { formatCity } from '@/utils/locationUtils';

interface ListingWithUser extends Listing {
  user: {
    name: string | null;
    email: string;
  };
  _count: {
    offers: number;
    favorites: number;
    views: number;
  };
}

export default function AdminListingsPage() {
  const [listings, setListings] = useState<ListingWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'price' | 'views' | 'offers'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedListing, setSelectedListing] = useState<ListingWithUser | null>(null);
  const [showListingModal, setShowListingModal] = useState(false);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        search: searchTerm,
        status: statusFilter,
        sortBy,
        sortOrder,
      });
      
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/listings?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      
      if (data.success) {
        setListings(data.listings);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('İlanlar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [currentPage, searchTerm, statusFilter, sortBy, sortOrder]);

  const handleListingAction = async (listingId: string, action: 'approve' | 'reject' | 'delete' | 'feature') => {
    if (!confirm(`Bu ilanı ${action === 'approve' ? 'onaylamak' : action === 'reject' ? 'reddetmek' : action === 'delete' ? 'silmek' : 'öne çıkarmak'} istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/listings/${listingId}`, {
        method: action === 'delete' ? 'DELETE' : 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: action !== 'delete' ? JSON.stringify({ action }) : undefined,
      });

      if (response.ok) {
        fetchListings();
        setShowListingModal(false);
      }
    } catch (error) {
      console.error('İlan işlemi hatası:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'sold':
        return 'bg-blue-100 text-blue-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktif';
      case 'pending':
        return 'Beklemede';
      case 'rejected':
        return 'Reddedildi';
      case 'sold':
        return 'Satıldı';
      case 'expired':
        return 'Süresi Doldu';
      default:
        return status;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">İlan Yönetimi</h1>
      </div>

      {/* Arama ve Filtreleme */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="İlan ara (başlık, açıklama)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="active">Aktif</option>
              <option value="pending">Beklemede</option>
              <option value="rejected">Reddedildi</option>
              <option value="sold">Satıldı</option>
              <option value="expired">Süresi Doldu</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="createdAt">Oluşturma Tarihi</option>
              <option value="price">Fiyat</option>
              <option value="views">Görüntülenme</option>
              <option value="offers">Teklif Sayısı</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="desc">Azalan</option>
              <option value="asc">Artan</option>
            </select>
          </div>
        </div>
      </div>

      {/* İlan Listesi */}
      <div className="bg-white rounded-lg shadow-sm border">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">İlanlar yükleniyor...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İlan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Satıcı
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fiyat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İstatistikler
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {listings.map((listing) => (
                    <tr key={listing.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            {listing.images && listing.images.length > 0 ? (
                              <img
                                className="h-12 w-12 rounded-lg object-cover"
                                src={listing.images[0]}
                                alt={listing.title}
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-400 text-xs">Resim Yok</span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 line-clamp-2">
                              {listing.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {listing.category}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {listing.user.name || 'İsimsiz'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {listing.user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {listing.price.toLocaleString('tr-TR')} TL
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div>{listing._count.views} görüntülenme</div>
                          <div>{listing._count.offers} teklif</div>
                          <div>{listing._count.favorites} favori</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(listing.status)}`}>
                          {getStatusText(listing.status)}
                        </span>
                        {listing.isFeatured && (
                          <div className="mt-1">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                              Öne Çıkan
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(listing.createdAt).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-col space-y-1">
                          <button
                            onClick={() => {
                              setSelectedListing(listing);
                              setShowListingModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Detay
                          </button>
                          <Link
                            href={`/listings/${listing.id}`}
                            target="_blank"
                            className="text-green-600 hover:text-green-900"
                          >
                            Görüntüle
                          </Link>
                          {listing.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleListingAction(listing.id, 'approve')}
                                className="text-green-600 hover:text-green-900"
                              >
                                Onayla
                              </button>
                              <button
                                onClick={() => handleListingAction(listing.id, 'reject')}
                                className="text-red-600 hover:text-red-900"
                              >
                                Reddet
                              </button>
                            </>
                          )}
                          {!listing.isFeatured && listing.status === 'active' && (
                            <button
                              onClick={() => handleListingAction(listing.id, 'feature')}
                              className="text-purple-600 hover:text-purple-900"
                            >
                              Öne Çıkar
                            </button>
                          )}
                          <button
                            onClick={() => handleListingAction(listing.id, 'delete')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Sayfalama */}
            {totalPages > 1 && (
              <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Önceki
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Sonraki
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Sayfa <span className="font-medium">{currentPage}</span> / <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === page
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* İlan Detay Modal */}
      {showListingModal && selectedListing && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">İlan Detayları</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Başlık</label>
                    <p className="text-sm text-gray-900">{selectedListing.title}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Kategori</label>
                    <p className="text-sm text-gray-900">{selectedListing.category}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fiyat</label>
                    <p className="text-sm text-gray-900">{selectedListing.price.toLocaleString('tr-TR')} TL</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Konum</label>
                    <p className="text-sm text-gray-900">{formatCity(selectedListing.location)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Durum</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedListing.status)}`}>
                      {getStatusText(selectedListing.status)}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Satıcı</label>
                    <p className="text-sm text-gray-900">{selectedListing.user.name || 'İsimsiz'}</p>
                    <p className="text-sm text-gray-500">{selectedListing.user.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">İstatistikler</label>
                    <div className="text-sm text-gray-900">
                      <p>{selectedListing._count.views} görüntülenme</p>
                      <p>{selectedListing._count.offers} teklif</p>
                      <p>{selectedListing._count.favorites} favori</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Oluşturma Tarihi</label>
                    <p className="text-sm text-gray-900">{new Date(selectedListing.createdAt).toLocaleString('tr-TR')}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Son Güncelleme</label>
                    <p className="text-sm text-gray-900">{new Date(selectedListing.updatedAt).toLocaleString('tr-TR')}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">Açıklama</label>
                <p className="text-sm text-gray-900 mt-1 p-3 bg-gray-50 rounded-md">{selectedListing.description}</p>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowListingModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Kapat
                </button>
                <Link
                  href={`/listings/${selectedListing.id}`}
                  target="_blank"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  İlanı Görüntüle
                </Link>
                {selectedListing.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleListingAction(selectedListing.id, 'approve')}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Onayla
                    </button>
                    <button
                      onClick={() => handleListingAction(selectedListing.id, 'reject')}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Reddet
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleListingAction(selectedListing.id, 'delete')}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Sil
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}