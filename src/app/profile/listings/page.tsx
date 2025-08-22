'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Edit, Eye, Info, MessageSquare, MoreHorizontal, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';
import { formatCity } from '@/utils/locationUtils';

interface Listing {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  location: string;
  budgetMin: number;
  budgetMax: number;
  status: 'active' | 'expired' | 'closed';
  expiryDate: string;
  createdAt: string;
  updatedAt: string;
  offersCount: number;
  favoritesCount: number;
  images?: string[];
  icon?: string;
  mileage?: number;
  mileageMin?: number;
  mileageMax?: number;
  categorySpecificData?: {
    brand?: string;
    model?: string;
    [key: string]: any;
  };
}

export default function ProfileListingsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('active');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isReactivating, setIsReactivating] = useState<string | null>(null);

  // İlanları getir
  const fetchListings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Gerçek API çağrısı
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }
      
      const response = await fetch(`/api/profile/listings?status=${activeTab}&page=${currentPage}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/auth/login');
          return;
        }
        throw new Error('İlanlar alınamadı');
      }
      
      const data = await response.json();
      
      // API'den gelen verileri frontend formatına dönüştür
      const formattedListings = data.listings.map((listing: any) => ({
        id: listing.id,
        title: listing.title,
        description: listing.description,
        category: listing.category,
        location: listing.location,
        budgetMin: listing.budget,
        budgetMax: listing.budget,
        status: listing.status || 'active',
        expiryDate: listing.expiresAt,
        createdAt: listing.createdAt,
        updatedAt: listing.updatedAt,
        offersCount: listing._count?.offers || 0,
        favoritesCount: listing._count?.favorites || 0,
        images: listing.images || []
      }));
      
      setListings(formattedListings);
      setTotalPages(data.pagination.totalPages);
      setError(null);
      setIsLoading(false);
      
    } catch (err) {
      setError('İlanlar yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [activeTab, currentPage]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1);
  };

  const handleDeleteListing = async (id: string) => {
    if (!confirm('Bu ilanı silmek istediğinizden emin misiniz?')) return;
    
    try {
      setIsDeleting(id);
      
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }
      
      const response = await fetch(`/api/listings/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('İlan silinirken bir hata oluştu');
      }
      
      // İlanı listeden kaldır
      setListings(prev => prev.filter(listing => listing.id !== id));
      
    } catch (err) {
      setError('İlan silinirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsDeleting(null);
    }
  };

  const reactivateListing = async (id: string) => {
    try {
      setIsReactivating(id);
      
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }
      
      const response = await fetch(`/api/listings/${id}/reactivate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('İlan yeniden aktifleştirilirken bir hata oluştu');
      }
      
      // İlanları yeniden yükle
      await fetchListings();
      
    } catch (err) {
      setError('İlan yeniden aktifleştirilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsReactivating(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Aktif</span>;
      case 'expired':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Süresi Dolmuş</span>;
      case 'closed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Kapalı</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">İlanlar yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">İlanlarım</h1>
        <Link href="/listings/create">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Yeni İlan Ekle
          </Button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex">
            <Info className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Aktif İlanlar</TabsTrigger>
          <TabsTrigger value="expired">Süresi Dolmuş</TabsTrigger>
          <TabsTrigger value="closed">Kapalı İlanlar</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {listings.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {activeTab === 'active' ? 'Aktif ilanınız bulunmuyor' : 
                 activeTab === 'expired' ? 'Süresi dolmuş ilanınız bulunmuyor' : 
                 'Kapalı ilanınız bulunmuyor'}
              </h3>
              <p className="text-gray-600 mb-6">
                {activeTab === 'active' ? 'Hemen yeni bir ilan oluşturun ve hizmet almaya başlayın.' : 
                 'Bu kategoride henüz bir ilanınız yok.'}
              </p>
              {activeTab === 'active' && (
                <Link href="/listings/create">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    İlk İlanınızı Oluşturun
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid gap-6">
              {listings.map((listing) => (
                <Card key={listing.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{listing.title}</CardTitle>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{listing.category}</span>
                          <span>•</span>
                          <span>{formatCity(listing.location)}</span>
                          <span>•</span>
                          <span>{formatPrice(listing.budgetMin)} - {formatPrice(listing.budgetMax)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(listing.status)}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-gray-700 mb-4 line-clamp-2">{listing.description}</p>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{listing.offersCount} Teklif</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{listing.favoritesCount} Favoriye Eklendi</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Oluşturulma: {formatDate(listing.createdAt)}</span>
                      </div>
                      {listing.expiryDate && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>Bitiş: {formatDate(listing.expiryDate)}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <Link href={`/listings/${listing.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Görüntüle
                        </Button>
                      </Link>
                      
                      {listing.status === 'active' && (
                        <Link href={`/listings/${listing.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-1" />
                            Düzenle
                          </Button>
                        </Link>
                      )}
                      
                      {listing.status === 'expired' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => reactivateListing(listing.id)}
                          disabled={isReactivating === listing.id}
                        >
                          {isReactivating === listing.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-1"></div>
                          ) : (
                            <RefreshCw className="h-4 w-4 mr-1" />
                          )}
                          Yeniden Aktifleştir
                        </Button>
                      )}
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDeleteListing(listing.id)}
                      disabled={isDeleting === listing.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {isDeleting === listing.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-1"></div>
                      ) : (
                        <Trash2 className="h-4 w-4 mr-1" />
                      )}
                      Sil
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Önceki
                </Button>
                
                <span className="flex items-center px-4 py-2 text-sm text-gray-700">
                  Sayfa {currentPage} / {totalPages}
                </span>
                
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Sonraki
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}