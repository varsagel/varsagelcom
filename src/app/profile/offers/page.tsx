'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Clock, Eye, Info, MessageCircle, MessageSquare, MoreHorizontal, User, X } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
}

interface Offer {
  id: string;
  listingId: string;
  listingTitle: string;
  listingDescription: string;
  listingBudgetMin: number;
  listingBudgetMax: number;
  listingStatus: string;
  listingOwner?: User;
  offerUser?: User;
  price: number;
  duration: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: string;
  updatedAt: string;
  conversationId: string | null;
  type: 'sent' | 'received';
}

export default function ProfileOffersPage() {
  const [activeTab, setActiveTab] = useState('pending');
  const [offerType, setOfferType] = useState<'sent' | 'received'>('sent');
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const { toast } = useToast();

  // Teklifleri getir
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Giriş yapmanız gerekiyor');
          return;
        }
        
        const response = await fetch(`/api/profile/all-offers?type=${offerType}&status=${activeTab}&page=${currentPage}&limit=10`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Teklifler alınamadı');
        }
        
        const data = await response.json();
        setOffers(data.offers);
        setTotalPages(data.totalPages);
        setIsLoading(false);
      } catch (err) {
        setError('Teklifler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
        setIsLoading(false);
      }
    };
    
    fetchOffers();
  }, [activeTab, currentPage, offerType]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1);
  };

  const handleUpdateOfferStatus = async (id: string, newStatus: 'pending' | 'accepted' | 'rejected' | 'completed') => {
    try {
      setIsUpdating(id);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Giriş yapmanız gerekiyor');
        setIsUpdating(null);
        return;
      }
      
      const response = await fetch(`/api/offers/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Teklif durumu güncellenemedi');
      }
      
      // Başarılı güncelleme sonrası teklifleri yeniden yükle
      const fetchOffers = async () => {
        const response = await fetch(`/api/profile/all-offers?type=${offerType}&status=${activeTab}&page=${currentPage}&limit=10`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setOffers(data.offers);
          setTotalPages(data.totalPages);
        }
      };
      
      await fetchOffers();
      setIsUpdating(null);
      
      // Başarı toast'ı göster
      const statusText = newStatus === 'accepted' ? 'kabul edildi' : 
                        newStatus === 'rejected' ? 'reddedildi' : 
                        newStatus === 'completed' ? 'tamamlandı olarak işaretlendi' : 'güncellendi';
      
      toast({
        title: "Başarılı",
        description: `Teklif ${statusText}.`,
        variant: "default",
        duration: 3000,
      });
    } catch (error) {
      console.error('Teklif güncelleme hatası:', error);
      const errorMessage = error instanceof Error ? error.message : 'Teklif durumu güncellenirken bir hata oluştu.';
      setError(errorMessage);
      setIsUpdating(null);
      
      toast({
        title: "Hata",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const handleDeleteOffer = async (offerId: string) => {
    if (!confirm('Bu teklifi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      setIsUpdating(offerId);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Giriş yapmanız gerekiyor');
        setIsUpdating(null);
        return;
      }

      const response = await fetch(`/api/offers/${offerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Teklif silinirken hata oluştu');
      }

      // Teklifleri yeniden yükle
      const fetchOffers = async () => {
        const response = await fetch(`/api/profile/all-offers?type=${offerType}&status=${activeTab}&page=${currentPage}&limit=10`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setOffers(data.offers);
          setTotalPages(data.totalPages);
        }
      };
      
      await fetchOffers();
      setIsUpdating(null);
      
      toast({
        title: "Başarılı",
        description: "Teklif başarıyla silindi.",
        variant: "default",
        duration: 3000,
      });
    } catch (error) {
      console.error('Teklif silme hatası:', error);
      const errorMessage = error instanceof Error ? error.message : 'Teklif silinirken bir hata oluştu.';
      setError(errorMessage);
      setIsUpdating(null);
      
      toast({
        title: "Hata",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const getStatusBadge = (status: Offer['status']) => {
    switch (status) {
      case 'pending':
        return <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900 dark:text-amber-300">Beklemede</span>;
      case 'accepted':
        return <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">Kabul Edildi</span>;
      case 'rejected':
        return <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-300">Reddedildi</span>;
      case 'completed':
        return <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">Tamamlandı</span>;
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
          <h2 className="text-2xl font-bold mb-2">Teklifler Yüklenemedi</h2>
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
        <h1 className="text-3xl font-bold mb-2">Tekliflerim</h1>
        <p className="text-muted-foreground">
          Gönderdiğiniz ve aldığınız teklifleri görüntüleyin ve yönetin.
        </p>
      </div>

      {/* Teklif Türü Seçimi */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
          <button
            onClick={() => {
              setOfferType('sent');
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              offerType === 'sent'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Yaptığım Teklifler
          </button>
          <button
            onClick={() => {
              setOfferType('received');
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              offerType === 'received'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Aldığım Teklifler
          </button>
        </div>
      </div>

      <Tabs defaultValue="pending" value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-6">
          <TabsTrigger value="pending">Beklemede</TabsTrigger>
          <TabsTrigger value="accepted">Kabul Edilenler</TabsTrigger>
          <TabsTrigger value="rejected">Reddedilenler</TabsTrigger>
          <TabsTrigger value="completed">Tamamlananlar</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
          {renderOffers()}
        </TabsContent>
        
        <TabsContent value="accepted">
          {renderOffers()}
        </TabsContent>
        
        <TabsContent value="rejected">
          {renderOffers()}
        </TabsContent>
        
        <TabsContent value="completed">
          {renderOffers()}
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

  function renderOffers() {
    if (offers.length === 0) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-3 mb-4">
              <Info className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Teklif Bulunamadı</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              {offerType === 'sent' ? (
                <>
                  {activeTab === 'pending' && 'Henüz beklemede olan teklifiniz bulunmuyor.'}
                  {activeTab === 'accepted' && 'Henüz kabul edilen teklifiniz bulunmuyor.'}
                  {activeTab === 'rejected' && 'Henüz reddedilen teklifiniz bulunmuyor.'}
                  {activeTab === 'completed' && 'Henüz tamamlanan teklifiniz bulunmuyor.'}
                </>
              ) : (
                <>
                  {activeTab === 'pending' && 'İlanlarınıza henüz beklemede olan teklif gelmemiş.'}
                  {activeTab === 'accepted' && 'İlanlarınıza henüz kabul edilen teklif bulunmuyor.'}
                  {activeTab === 'rejected' && 'İlanlarınıza henüz reddedilen teklif bulunmuyor.'}
                  {activeTab === 'completed' && 'İlanlarınıza henüz tamamlanan teklif bulunmuyor.'}
                </>
              )}
            </p>
            <Link href="/listings">
              <Button>
                İlanlara Göz At
              </Button>
            </Link>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {offers.map((offer) => (
          <Card key={offer.id}>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-xl">
                      <Link href={`/listings/${offer.listingId}`} className="hover:underline">
                        {offer.listingTitle}
                      </Link>
                    </CardTitle>
                    {getStatusBadge(offer.status)}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                    {offerType === 'received' && offer.offerUser && (
                      <span className="flex items-center">
                        <User className="mr-1 h-3 w-3" />
                        Teklif Veren: {offer.offerUser.name}
                      </span>
                    )}
                    {offerType === 'sent' && offer.listingOwner && (
                      <span className="flex items-center">
                        <User className="mr-1 h-3 w-3" />
                        İlan Sahibi: {offer.listingOwner.name}
                      </span>
                    )}
                    <span className="flex items-center">
                      <Clock className="mr-1 h-3 w-3" />
                      Teslim Süresi: {offer.duration}
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
                      {formatDate(offer.createdAt)}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col items-end">
                  <div className="text-right">
                    <div className="text-lg font-semibold">
                      {formatPrice(offer.price)}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="px-4 sm:px-6 pb-0">
              <p className="text-sm text-muted-foreground">
                {offer.message}
              </p>
            </CardContent>
            
            <CardFooter className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-6">
              <div className="flex items-center gap-4">
                {offerType === 'sent' ? (
                  // Yaptığım teklifler için mesajlar
                  <>
                    {offer.status === 'accepted' && (
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">
                          Teklif kabul edildi. İlan sahibi ile iletişime geçebilirsiniz.
                        </span>
                        {offer.conversationId && (
                          <Link href={`/messages/${offer.conversationId}`}>
                            <Button variant="default" size="sm">
                              <MessageCircle className="mr-1 h-4 w-4" />
                              Mesajlaş
                            </Button>
                          </Link>
                        )}
                      </div>
                    )}
                    {offer.status === 'rejected' && (
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">
                          Teklif reddedildi. Başka ilanlara göz atabilirsiniz.
                        </span>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteOffer(offer.id)}
                          disabled={isUpdating === offer.id}
                        >
                          <X className="mr-1 h-4 w-4" />
                          {isUpdating === offer.id ? 'Siliniyor...' : 'Sil'}
                        </Button>
                      </div>
                    )}
                    {offer.status === 'completed' && (
                      <span className="text-sm text-muted-foreground">
                        Bu teklif başarıyla tamamlandı.
                      </span>
                    )}
                  </>
                ) : (
                  // Aldığım teklifler için mesajlar
                  <>
                    {offer.status === 'pending' && (
                      <span className="text-sm text-muted-foreground">
                        Bu teklifi kabul edebilir veya reddedebilirsiniz.
                      </span>
                    )}
                    {offer.status === 'accepted' && (
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">
                          Teklifi kabul ettiniz. Teklif veren ile iletişime geçebilirsiniz.
                        </span>
                        {offer.conversationId && (
                          <Link href={`/messages/${offer.conversationId}`}>
                            <Button variant="default" size="sm">
                              <MessageCircle className="mr-1 h-4 w-4" />
                              Mesajlaş
                            </Button>
                          </Link>
                        )}
                      </div>
                    )}
                    {offer.status === 'rejected' && (
                      <span className="text-sm text-muted-foreground">
                        Bu teklifi reddettiniz.
                      </span>
                    )}
                    {offer.status === 'completed' && (
                      <span className="text-sm text-muted-foreground">
                        Bu teklif başarıyla tamamlandı.
                      </span>
                    )}
                  </>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Link href={`/offers/${offer.id}`}>
                  <Button variant="default" size="sm">
                    <Info className="mr-1 h-4 w-4" />
                    Teklif Detayı
                  </Button>
                </Link>
                <Link href={`/listings/${offer.listingId}`}>
                  <Button variant="outline" size="sm">
                    <Eye className="mr-1 h-4 w-4" />
                    İlanı Görüntüle
                  </Button>
                </Link>
                
                {offerType === 'sent' ? (
                  // Yaptığım teklifler için butonlar
                  <>
                    {offer.status === 'pending' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleUpdateOfferStatus(offer.id, 'rejected')}
                        disabled={isUpdating === offer.id}
                      >
                        {isUpdating === offer.id ? (
                          <>
                            <div className="mr-1 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                            İşleniyor...
                          </>
                        ) : (
                          <>
                            <X className="mr-1 h-4 w-4 text-destructive" />
                            İptal Et
                          </>
                        )}
                      </Button>
                    )}
                    
                    {offer.status === 'accepted' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleUpdateOfferStatus(offer.id, 'completed')}
                        disabled={isUpdating === offer.id}
                      >
                        {isUpdating === offer.id ? (
                          <>
                            <div className="mr-1 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                            İşleniyor...
                          </>
                        ) : (
                          <>
                            <Check className="mr-1 h-4 w-4 text-green-600" />
                            Tamamlandı Olarak İşaretle
                          </>
                        )}
                      </Button>
                    )}
                  </>
                ) : (
                  // Aldığım teklifler için butonlar
                  <>
                    {offer.status === 'pending' && (
                      <>
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => handleUpdateOfferStatus(offer.id, 'accepted')}
                          disabled={isUpdating === offer.id}
                        >
                          {isUpdating === offer.id ? (
                            <>
                              <div className="mr-1 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                              İşleniyor...
                            </>
                          ) : (
                            <>
                              <Check className="mr-1 h-4 w-4" />
                              Kabul Et
                            </>
                          )}
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleUpdateOfferStatus(offer.id, 'rejected')}
                          disabled={isUpdating === offer.id}
                        >
                          {isUpdating === offer.id ? (
                            <>
                              <div className="mr-1 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                              İşleniyor...
                            </>
                          ) : (
                            <>
                              <X className="mr-1 h-4 w-4" />
                              Reddet
                            </>
                          )}
                        </Button>
                      </>
                    )}
                    
                    {offer.status === 'accepted' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleUpdateOfferStatus(offer.id, 'completed')}
                        disabled={isUpdating === offer.id}
                      >
                        {isUpdating === offer.id ? (
                          <>
                            <div className="mr-1 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                            İşleniyor...
                          </>
                        ) : (
                          <>
                            <Check className="mr-1 h-4 w-4 text-green-600" />
                            Tamamlandı Olarak İşaretle
                          </>
                        )}
                      </Button>
                    )}
                  </>
                )}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }
}