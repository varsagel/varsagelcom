'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Heart, Info, MessageSquare, Trash2 } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';
import { formatCity } from '@/utils/locationUtils';

interface Listing {
  id: string;
  favoriteId?: string; // Favori ID'si
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
  user: {
    id: string;
    name: string;
    image?: string;
  };
}

export default function ProfileFavoritesPage() {
  const [favorites, setFavorites] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);

  // Favorileri getir
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Giriş yapmanız gerekiyor');
          setIsLoading(false);
          return;
        }
        
        const response = await fetch(`/api/favorites?page=${currentPage}&limit=10`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Favoriler alınamadı');
        }
        
        const data = await response.json();
        
        // API'den gelen veriyi uygun formata çevir
         const formattedFavorites = data.favorites.map((fav: any) => ({
           id: fav.listing.id,
           favoriteId: fav.id, // Favori ID'sini ayrı olarak sakla
           title: fav.listing.title,
           description: fav.listing.description,
           category: fav.listing.category,
           location: fav.listing.location,
           budgetMin: fav.listing.budgetMin,
           budgetMax: fav.listing.budgetMax,
           status: fav.listing.status,
           expiryDate: fav.listing.expiryDate,
           createdAt: fav.listing.createdAt,
           updatedAt: fav.listing.updatedAt,
           offersCount: fav.listing._count?.offers || 0,
           favoritesCount: fav.listing._count?.favorites || 0,
           images: fav.listing.images ? JSON.parse(fav.listing.images) : [],
           user: {
             id: fav.listing.user.id,
             name: fav.listing.user.name,
             image: fav.listing.user.profileImage || 'https://randomuser.me/api/portraits/men/1.jpg'
           }
         }));
          
          setFavorites(formattedFavorites);
          setTotalPages(data.pagination.totalPages);
          setIsLoading(false);
      } catch (err) {
        setError('Favoriler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
        setIsLoading(false);
      }
    };
    
    fetchFavorites();
  }, [currentPage]);

  const handleRemoveFavorite = async (id: string) => {
    try {
      setIsRemoving(id);
      
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Giriş yapmanız gerekiyor');
        setIsRemoving(null);
        return;
      }
      
      // Favori ID'sini bulmak için önce favorileri kontrol et
       const favoriteToRemove = favorites.find(fav => fav.id === id);
       if (!favoriteToRemove || !favoriteToRemove.favoriteId) {
         alert('Favori bulunamadı');
         setIsRemoving(null);
         return;
       }
       
       const response = await fetch(`/api/favorites/${favoriteToRemove.favoriteId}`, {
         method: 'DELETE',
         headers: {
           'Authorization': `Bearer ${token}`
         }
       });
      
      if (!response.ok) {
        throw new Error('Favori kaldırılamadı');
      }
      
      setFavorites(prev => prev.filter(favorite => favorite.id !== id));
      setIsRemoving(null);
    } catch (error) {
      console.error('Favori kaldırma hatası:', error);
      alert('Favori kaldırılırken bir hata oluştu. Lütfen tekrar deneyin.');
      setIsRemoving(null);
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
          <h2 className="text-2xl font-bold mb-2">Favoriler Yüklenemedi</h2>
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Favorilerim</h1>
        <p className="text-muted-foreground">
          Favori olarak işaretlediğiniz ilanları görüntüleyin ve yönetin.
        </p>
      </div>

      {favorites.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-3 mb-4">
              <Heart className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Favori İlan Bulunamadı</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Henüz favori olarak işaretlediğiniz bir ilan bulunmuyor. İlanlara göz atarak favorilerinize ekleyebilirsiniz.
            </p>
            <Link href="/listings">
              <Button>
                İlanlara Göz At
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((listing) => (
              <Card key={listing.id} className="flex flex-col h-full">
                <CardHeader className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="relative h-8 w-8 rounded-full overflow-hidden mr-2">
                        {listing.user.image ? (
                          <Image 
                            src={listing.user.image} 
                            alt={listing.user.name} 
                            fill 
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-muted flex items-center justify-center">
                            <span className="text-xs font-medium">
                              {listing.user.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-medium">{listing.user.name}</span>
                    </div>
                    {getStatusBadge(listing.status)}
                  </div>
                  <CardTitle className="text-lg">
                    <Link href={`/listings/${listing.id}`} className="hover:underline">
                      {listing.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="p-4 pt-0 flex-grow">
                  <div className="relative h-40 mb-3 rounded-md overflow-hidden">
                    {listing.images && listing.images.length > 0 ? (
                      <Image 
                        src={listing.images[0]} 
                        alt={listing.title} 
                        fill 
                        className="object-cover"
                      />
                    ) : listing.icon && (listing.category === 'vasita' || listing.category === 'Vasıta') && listing.subcategory === 'Otomobil' ? (
                      <Image 
                        src={`/api/icons?name=${listing.icon}`} 
                        alt={listing.title} 
                        fill 
                        className="object-cover"
                      />
                    ) : (
                      <img
                         src="/images/defaults/varsagel.com.jpeg"
                         alt={listing.title}
                         className="w-full h-full object-cover"
                       />
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {listing.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground mb-3">
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
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">
                      {formatPrice(listing.budgetMin)} - {formatPrice(listing.budgetMax)}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center">
                        <MessageSquare className="mr-1 h-3 w-3" />
                        {listing.offersCount}
                      </span>
                      <span className="flex items-center">
                        <Heart className="mr-1 h-3 w-3 fill-current text-red-500" />
                        {listing.favoritesCount}
                      </span>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="p-4 pt-0 flex justify-between">
                  <Link href={`/listings/${listing.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="mr-1 h-4 w-4" />
                      Görüntüle
                    </Button>
                  </Link>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleRemoveFavorite(listing.id)}
                    disabled={isRemoving === listing.id}
                  >
                    {isRemoving === listing.id ? (
                      <>
                        <div className="mr-1 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                        Kaldırılıyor...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-1 h-4 w-4 text-destructive" />
                        Favorilerden Kaldır
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
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
        </>
      )}
    </div>
  );
}