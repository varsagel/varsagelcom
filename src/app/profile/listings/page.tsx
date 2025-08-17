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
  
  const [activeTab, setActiveTab] = useState('active');
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isReactivating, setIsReactivating] = useState<string | null>(null);

  // İlanları getir
  useEffect(() => {
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
        alert('Giriş yapmanız gerekiyor');
        setIsDeleting(null);
        return;
      }
      
      const response = await fetch(`/api/listings/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('İlan silinemedi');
      }
      
      setListings(prev => prev.filter(listing => listing.id !== id));
      setIsDeleting(null);
    } catch (error) {
      console.error('İlan silme hatası:', error);
      alert('İlan silinirken bir hata oluştu. Lütfen tekrar deneyin.');
      setIsDeleting(null);
    }
  };

  const handleReactivateListing = async (id: string) => {
    if (!confirm('Bu ilanı tekrar aktif etmek istediğinizden emin misiniz? Bu işlem kabul edilen teklifi reddedecektir.')) return;
    
    try {
      setIsReactivating(id);
      
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Giriş yapmanız gerekiyor');
        setIsReactivating(null);
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
        throw new Error('İlan tekrar aktif edilemedi');
      }
      
      // İlanları yeniden getir
      fetchListings();
      setIsReactivating(null);
      alert('İlan başarıyla tekrar aktif edildi.');
    } catch (error) {
      console.error('İlan tekrar aktif etme hatası:', error);
      alert('İlan tekrar aktif edilirken bir hata oluştu. Lütfen tekrar deneyin.');
      setIsReactivating(null);
    }
  };

  const getStatusBadge = (status: Listing['status']) => {
    switch (status) {
      case 'active':
        return <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">Aktif</span>;
      case 'expired':
        return <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900 dark:text-amber-300">Süresi Dolmuş</span>;
      case 'closed':
        return <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">Kapanmış</span>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="rounded-full bg-destructive/10 p-3 mb-4">
            <Info className="h-6 w-6 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold mb-2">İlanlar Yüklenemedi</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Tekrar Dene
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">İlanlarım</h1>
          <p className="text-muted-foreground">
            İlanlarınızı görüntüleyin, düzenleyin veya yenilerini ekleyin.
          </p>
        </div>
        
        <Link href="/listings/create">
          <Button className="mt-4 sm:mt-0">
            <Plus className="mr-2 h-4 w-4" />
            Yeni İlan Oluştur
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="active" value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-6">
          <TabsTrigger value="active">Aktif İlanlar</TabsTrigger>
          <TabsTrigger value="accepted">Kabul Edilen</TabsTrigger>
          <TabsTrigger value="expired">Süresi Dolmuş</TabsTrigger>
          <TabsTrigger value="closed">Kapanmış</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          {renderListings()}
        </TabsContent>
        
        <TabsContent value="accepted">
          {renderListings()}
        </TabsContent>
        
        <TabsContent value="expired">
          {renderListings()}
        </TabsContent>
        
        <TabsContent value="closed">
          {renderListings()}
        </TabsContent>
      </Tabs>

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            >
              Önceki
            </Button>
            
            <span className="text-sm">
              Sayfa {currentPage} / {totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            >
              Sonraki
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  function renderListings() {
    if (listings.length === 0) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-3 mb-4">
              <Info className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">İlan Bulunamadı</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              {activeTab === 'active' && 'Henüz aktif bir ilanınız bulunmuyor. Yeni bir ilan oluşturarak başlayabilirsiniz.'}
              {activeTab === 'accepted' && 'Kabul edilen teklifiniz olan ilanınız bulunmuyor.'}
              {activeTab === 'expired' && 'Süresi dolmuş ilanınız bulunmuyor.'}
              {activeTab === 'closed' && 'Kapanmış ilanınız bulunmuyor.'}
            </p>
            {activeTab === 'active' && (
              <Link href="/listings/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Yeni İlan Oluştur
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {listings.map((listing) => (
          <Card key={listing.id}>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex gap-4">
                  {/* Image/Icon */}
                  <div className="relative h-20 w-20 flex-shrink-0 rounded-md overflow-hidden">
                    {(listing.images && listing.images.length > 0) ? (
                      <img 
                        src={listing.images[0]} 
                        alt={listing.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (listing.icon && (listing.category === 'vasita' || listing.category === 'Vasıta') && listing.subcategory === 'Otomobil') ? (
                      <img 
                        src={`/api/icons?name=${listing.icon}`} 
                        alt={listing.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                         src="/images/defaults/varsagel.com.jpeg"
                         alt={listing.title}
                         className="w-full h-full object-cover"
                       />
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-xl">{listing.title}</CardTitle>
                      {getStatusBadge(listing.status)}
                    </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-1 h-3 w-3"
                      >
                        <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
                        <path d="M7 7h.01" />
                      </svg>
                      {listing.category}
                    </span>
                    <span className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-1 h-3 w-3"
                      >
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {formatCity(listing.location)}
                    </span>
                    <span className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-1 h-3 w-3"
                      >
                        <path d="M12 6v6l4 2" />
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                      {formatDate(listing.createdAt)}
                    </span>
                    {(listing.category === 'Otomobil' || listing.category === 'Motosiklet' || listing.category === 'Ticari Araç' || listing.category === 'Deniz Araçları' || listing.category === 'Tarım Araçları' || listing.category === 'İş Makineleri' || listing.category === 'Hasarlı Araçlar' || listing.category === 'Klasik Araçlar' || listing.category === 'Elektrikli Araçlar') && (listing.mileage || listing.mileageMin || listing.mileageMax) && (
                      <span className="flex items-center">
                        🚗
                        <span className="ml-1">
                          {listing.mileage 
                            ? `${listing.mileage.toLocaleString()} km`
                            : `${listing.mileageMin?.toLocaleString() || 0} - ${listing.mileageMax?.toLocaleString() || 0} km`
                          }
                        </span>
                      </span>
                    )}
                    {(listing.category === 'Otomobil' || listing.category === 'Motosiklet' || listing.category === 'Ticari Araç' || listing.category === 'Deniz Araçları' || listing.category === 'Tarım Araçları' || listing.category === 'İş Makineleri' || listing.category === 'Hasarlı Araçlar' || listing.category === 'Klasik Araçlar' || listing.category === 'Elektrikli Araçlar') && listing.categorySpecificData && (listing.categorySpecificData.brand || listing.categorySpecificData.model) && (
                      <span className="flex items-center">
                        🏷️
                        <span className="ml-1">
                          {listing.categorySpecificData.brand && listing.categorySpecificData.model 
                            ? `${listing.categorySpecificData.brand} ${listing.categorySpecificData.model}`
                            : listing.categorySpecificData.brand || listing.categorySpecificData.model
                          }
                        </span>
                      </span>
                    )}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end">
                  <div className="text-right">
                    <div className="text-lg font-semibold">
                      {formatPrice(listing.budgetMin)} - {formatPrice(listing.budgetMax)}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      <span>
                        {listing.status === 'active' 
                          ? `Son Tarih: ${formatDate(listing.expiryDate)}` 
                          : listing.status === 'expired' 
                            ? `Süresi Doldu: ${formatDate(listing.expiryDate)}` 
                            : `Kapandı: ${formatDate(listing.updatedAt)}`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="px-4 sm:px-6 pb-0">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {listing.description}
              </p>
            </CardContent>
            
            <CardFooter className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <MessageSquare className="mr-1 h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{listing.offersCount} Teklif</span>
                </div>
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-1 h-4 w-4 text-muted-foreground"
                  >
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                  <span className="text-sm">{listing.favoritesCount} Favori</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Link href={`/listings/${listing.id}`}>
                  <Button variant="outline" size="sm">
                    <Eye className="mr-1 h-4 w-4" />
                    Görüntüle
                  </Button>
                </Link>
                
                {listing.status === 'active' && (
                  <Link href={`/listings/edit/${listing.id}`}>
                    <Button variant="outline" size="sm">
                      <Edit className="mr-1 h-4 w-4" />
                      Düzenle
                    </Button>
                  </Link>
                )}
                
                {activeTab === 'accepted' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleReactivateListing(listing.id)}
                    disabled={isReactivating === listing.id}
                  >
                    {isReactivating === listing.id ? (
                      <>
                        <div className="mr-1 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                        Aktif Ediliyor...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-1 h-4 w-4" />
                        Tekrar Aktif Et
                      </>
                    )}
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDeleteListing(listing.id)}
                  disabled={isDeleting === listing.id}
                >
                  {isDeleting === listing.id ? (
                    <>
                      <div className="mr-1 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                      Siliniyor...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-1 h-4 w-4 text-destructive" />
                      Sil
                    </>
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }
}